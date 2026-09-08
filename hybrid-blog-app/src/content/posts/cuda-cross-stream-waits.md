---
title: "CUDA 跨 stream 的执行顺序"
description: "cuda stream Q1。"
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
假设 copy_s 和 compute_s 是同一 GPU 上两个不同的 nonblocking stream；所有内存、事件均已正确分配，API 调用成功。transform 会读取 dst 并写入 out。
下面是教学代码，省略初始化和错误检查：
```cpp
cudaMemcpyAsync(dst, src, n, cudaMemcpyDeviceToDevice, copy_s);
transform<<<grid, block, 0, compute_s>>>(dst, out, n);
cudaEventRecord(done, compute_s);
cudaEventSynchronize(done);
```
**Q: 这段代码是否存在竞争？请说明原因，并以最小改动保证正确顺序，同时解释建立这个顺序是否必须阻塞 CPU。**

**第一种修复：让 CPU 等拷贝完成，再提交 kernel。**

```cpp
cudaMemcpyAsync(dst, src, n, cudaMemcpyDeviceToDevice, copy_s);
cudaEventRecord(done, copy_s);
cudaEventSynchronize(done);
transform<<<grid, block, 0, compute_s>>>(dst, out, n);
```
这种写法正确，但在事件完成前，该 CPU 线程无法继续提交后面的工作。如果只需要约束 GPU 上的数据消费顺序，可以把依赖直接交给 stream。

**第二种修复：让计算流的后续工作等拷贝事件。**

```cpp
cudaMemcpyAsync(dst, src, n, cudaMemcpyDeviceToDevice, copy_s);
cudaEventRecord(done, copy_s);
cudaStreamWaitEvent(compute_s, done, 0);
transform<<<grid, block, 0, compute_s>>>(dst, out, n);
```

`cudaStreamWaitEvent` 约束的是调用之后提交到 `compute_s` 的工作，不要求主机等待该事件完成。参见 [cudaStreamWaitEvent 文档](https://docs.nvidia.com/cuda/cuda-runtime-api/group__CUDART__STREAM.html)。
**`cudaStreamWaitEvent` 返回不代表拷贝完成。** CPU 可以继续提交 kernel 或其他工作，而 GPU 上的 kernel 仍须等事件满足才能执行。“不要求主机等事件完成”也不等于调用零开销、永不阻塞：CUDA API 仍可能因内部资源等原因发生阻塞。参见 [NVIDIA API 同步行为说明](https://docs.nvidia.com/cuda/cuda-runtime-api/api-sync-behavior.html)。
