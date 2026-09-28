---
title: "Rollout Scheduler (1)"
description: "what is rollout scheduler and what makes it different from infernece scheduler"
pubDate: 2026-09-02
authors:
  - "owner"
tags:
  - "tech"
  - "rollout"
  - "RL"
status: "published"
formats:
  - "blog"
---

#### Inference Scheduler
（LLM-only）
1. DP router, 一个DP rank是持有KV cache的基本单位（不考虑一些池化的方案）
2. batching，决定decode/prefill的执行（continuous batching/chunked prefill）
3. parallelism，对于engine内感知的步骤，如PP/CP（TP一般没有执行顺序的变化）

服务入口还需要做**准入**：决定同时放入多少 request；DP router 做**路由**：决定每个 request 交给哪个 DP。下面以内部 DP 部署为例，画出请求下发和负载反馈两条链路。实线表示请求，虚线表示负载；Gateway 是可选的准入层。

**vLLM：前端选 DP，Coordinator 汇总负载。** API 前端完成 tokenize 和目标选择，通过 ZMQ 将请求直接发给 EngineCore。各 EngineCore 向 Coordinator 上报负载，Coordinator 汇总后发布给前端，供后续路由使用。[请求分发实现](https://github.com/vllm-project/vllm/blob/main/vllm/v1/engine/core_client.py)、[负载反馈实现](https://github.com/vllm-project/vllm/blob/main/vllm/v1/engine/coordinator.py)。

<figure>
<img src="/images/rollout-scheduler-1/vllm-request-load.svg" alt="vLLM 进程拓扑：Gateway 向 API 前端发送请求，前端选择 DP 并通过 ZMQ 发往 EngineCore；各 EngineCore 上报负载到 Coordinator，再由 Coordinator 发布给前端。" />
<figcaption>vLLM：请求直接发往目标 EngineCore；负载经 Coordinator 汇总后返回前端。</figcaption>
</figure>

**SGLang：Controller 选 DP，Scheduler 写负载快照。** Tokenizer 前端将请求送到独立的 DP Controller，再由 Controller 通过 ZMQ 发给选中的 Scheduler。单机上，各 Scheduler 将负载写入共享内存，Controller 读取快照用于路由；共享内存不是独立进程。多节点 DP attention 中，远端负载先通过 ZMQ 收集到 node 0，再写入当地共享内存。[请求分发实现](https://github.com/sgl-project/sglang/blob/main/python/sglang/srt/managers/data_parallel_controller.py)、[负载反馈实现](https://github.com/sgl-project/sglang/blob/main/python/sglang/srt/managers/load_snapshot.py)。

<figure>
<img src="/images/rollout-scheduler-1/sglang-request-load.svg" alt="SGLang 单机进程拓扑：Gateway 到 Tokenizer 前端，再到 DP Controller，Controller 选择目标 Scheduler；各 Scheduler 写入共享内存负载快照，Controller 读取快照。" />
<figcaption>SGLang 单机路径：请求经过 DP Controller；负载通过共享内存反馈。</figcaption>
</figure>

两者都使用已有的负载快照，并在分发时预记账，吸收状态更新的延迟。

#### Rollout Scheduler

从职责上看，**Rollout Scheduler 相当于训练侧的 gateway（准入）+ router（路由）**：决定放入多少 request，以及交给哪个 DP；具体的 prefill、decode 和 batching 仍由引擎内的 Inference Scheduler 完成。最基础的实现是“固定并发，完成一个就补一个，再把新请求发给未完成请求最少的 DP”。这个模型简单，但请求数量不能直接代表计算量：长短请求、tool 等待和 KV 占用都会影响实际负载。更关键的是，**rollout 还要关心哪些结果组成下一个训练 batch**。如果按完成顺序凑 batch，短请求、快环境更容易先被选中，数据分布便受到执行速度影响。因此，Rollout Scheduler 除了维持吞吐，还需要围绕训练的消费边界，控制样本的组成与新鲜度。

普通的场景中，一个 request 完全结束后才能够计算 reward，从而被 trainer 消费。

在异步RL的场景中，纯粹从**token**角度（区别于**执行**角度，e.g.权重同步/prefix cache命中），rollout可以被看作是持续的**流**（stream），train（weight update）是一些根据条件确定的**栅栏**（barrier）。

比如最naive的例子，每完成若干数量的request，就进行一次训练，barrier的条件就是request完成的数量阈值。此时stream会被打断。两个barrier之间的token stream，就是rollout scheduler管理的对象。

最简单的一个目标：在保持实际执行并行度的同时，让每个 step 消费的 token stream 包含更多有效信息，减少 off-policy。
