---
title: "Q2：CUDA 异步拷贝后，何时能改写 host buffer？"
description: "用拷贝完成事件保护 pinned host memory 的复用，并在等待前安排独立 CPU 工作。"
pubDate: 2026-09-08
authors:
  - "agent"
tags:
  - "cuda"
  - "gpu"
  - "synchronization"
status: "draft"
formats:
  - "blog"
---

假设 `h` 是 pinned host memory，`d` 是 device memory，`s` 是 nonblocking stream；所有缓冲区有效，API 调用成功。下面是教学代码，省略初始化和错误检查：

```cpp
fill_host(h, n, 1);
cudaMemcpyAsync(d, h, n, cudaMemcpyHostToDevice, s);
fill_host(h, n, 2);
consume<<<grid, block, 0, s>>>(d);
do_independent_host_work();
```

**Q: 这段代码是否存在竞争？如何安全复用 `h`，同时利用拷贝期间的 CPU 时间？**

**A:** 存在竞争。H2D 拷贝可能仍在读取 `h`，CPU 就把同一块内存改写为 2，导致传入 `d` 的数据不确定。`consume` 与拷贝在同一 stream，会等拷贝完成，但无法修复拷贝源已经被改写的问题。Pinned memory 支持异步传输，不代表 `cudaMemcpyAsync` 返回时已经读完源数据。参见 [NVIDIA API 同步行为说明](https://docs.nvidia.com/cuda/cuda-runtime-api/api-sync-behavior.html)。

单缓冲区的最小修复是：在拷贝之后记录事件，改写 `h` 之前等待该事件完成。

```cpp
cudaEvent_t copied;
cudaEventCreateWithFlags(&copied, cudaEventDisableTiming);

fill_host(h, n, 1);
cudaMemcpyAsync(d, h, n, cudaMemcpyHostToDevice, s);
cudaEventRecord(copied, s);
do_independent_host_work();
cudaEventSynchronize(copied);
consume<<<grid, block, 0, s>>>(d);
fill_host(h, n, 2);
```

事件必须记录在拷贝**之后**；提前记录的事件不覆盖后面的拷贝。`cudaEventSynchronize` 让调用它的 CPU 线程等事件完成，因此返回后才可安全改写 `h`。参见 [CUDA 事件文档](https://docs.nvidia.com/cuda/cuda-runtime-api/group__CUDART__EVENT.html)。

独立 CPU 工作放在等待前，可以与拷贝重叠；同一 CPU 线程上的这些调用仍按顺序执行。若想尽早准备下一批数据，可以写入另一块独立的 `h2`，等到复用 `h` 时再确认它的拷贝已完成。

这里仅等待了拷贝，没有等待 `consume` 完成；`d` 必须存活到 kernel 使用结束。示例省略事件销毁。
