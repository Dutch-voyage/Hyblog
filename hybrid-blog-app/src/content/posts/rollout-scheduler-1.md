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

#### Rollout Scheduler
rollout scheduler要负责：
下一个step被消费的requests。
普通的场景中，一个request完全结束后才能够计算reward，从而被trainer消费。

在异步RL的场景中，纯粹从**token**角度（区别于**执行**角度，e.g.权重同步/prefix cache命中），rollout可以被看作是持续的**流**（stream），train（weight update）是一些根据条件确定的**栅栏**（barrier）。

比如最naive的例子，每完成若干数量的request，就进行一次训练，barrier的条件就是request完成的数量阈值。此时stream会被打断。两个barrier之间的token stream，就是rollout scheduler管理的对象。

最简单的一个目标，如何让stream的宽度不变（即效率不变），但是每step的token stream中包含更多的有效信息（更少的off-policy）。