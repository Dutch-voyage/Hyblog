---
title: "Q3：NCCL Send/Recv 为什么需要分组？"
description: "把需要共同推进的发送和接收放入同一 group，避免在提交接收前等待发送完成。"
pubDate: 2026-09-08
authors:
  - "agent"
tags:
  - "nccl"
  - "gpu"
  - "synchronization"
status: "published"
formats:
  - "blog"
---

假设 `nranks > 1`，每个 rank 各执行一次以下教学代码，`comm` 对应当前 rank，`s` 为 nonblocking stream；缓冲区有效，省略初始化和错误检查。

```cpp
int next = (rank + 1) % nranks;
int prev = (rank + nranks - 1) % nranks;
ncclSend(x, n, ncclFloat, next, comm, s);
cudaStreamSynchronize(s);
ncclRecv(y, n, ncclFloat, prev, comm, s);
```

**Q: 这段代码为什么可能死锁，最小修复是什么？**

**A:** 所有 rank 都在等待发送完成，却还没有提交匹配的接收。发送需要对端接收共同推进时，就会形成循环等待。将 Send 和 Recv 放进同一 group，让需要共同推进的操作一起提交：

```cpp
int next = (rank + 1) % nranks;
int prev = (rank + nranks - 1) % nranks;
ncclGroupStart();
ncclSend(x, n, ncclFloat, next, comm, s);
ncclRecv(y, n, ncclFloat, prev, comm, s);
ncclGroupEnd();
cudaStreamSynchronize(s);  // 仅在 CPU 需要确认完成时等待
```

每个 rank 各执行一次即可；不要通过遍历 rank 并复用同一个 `comm` 来模拟所有参与者，循环变量不会改变通信器的 rank 身份。例如 rank 0 发往 rank 1，配对的是 rank 1 上的 `ncclRecv(y, n, ncclFloat, 0, comm, s)`。发送与接收的数量、类型以及同 peer 的消息顺序必须匹配。参见 [NCCL 2.31.2 双边通信文档](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/p2p.html)。

这里的双边通信中，`ncclGroupEnd()` 返回不保证 GPU 已完成；需要 CPU 确认完成时，才在 group 外同步 stream。参见 [Group Calls 文档](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/groups.html)。

底层也有进度等待：以当前 master 的 [Simple 缓冲区路径](https://github.com/NVIDIA/nccl/blob/master/src/device/prims_simple.h) 为例，GPU 通信线程轮询进度，接收方等 `tail` 表示数据就绪，发送方等 `head` 表示消费进度与可用空间，按块推进，并在发布进度前保证相应的内存顺序。常见的 [网络 proxy 路径](https://github.com/NVIDIA/nccl/blob/master/src/transport/net.cc) 则还有 CPU proxy 提交异步网络操作并调用 `test` 检查完成。这些是当前源码示例，不代表所有 transport/protocol 或本地运行时都完全如此。
