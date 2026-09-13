---
title: "Rollout Scheduler (3)"
description: "batch分布决定的调度策略"
pubDate: 2026-09-08
authors:
  - "owner"
tags:
  - "RL"
  - "rollout"
  - "schedule"
status: "published"
formats:
  - "blog"
---

#### 如何控制RL中的batch分布

RL与SFT/PT最本质的不同（之一）是，组成训练的batch时从实际环境中采集到的。异步RL进一步引入了采样时间带来的bias。然而，大模型的权重更新方式，显然更喜欢I.I.D分布的sample，这可能是RL**不稳定**的主要来源。

一个重要的分布的request的**长度**。

如Rollout Scheduler(2)中已经展示的那样，我们首先需要有区分request的**集合**（长/短），预估不同request的**需求服务量**（时间 * 并行度），据此决定**资源**（concurrency）的分配

#### bucket是目标，frontier是决策。

长度的基本单位规定为一个 chunk。Bucket 描述最终完成长度：$B_1$ 为 $L=1$，$B_2$ 为 $1<L\leq2$，$B_4$ 为 $2<L\leq4$，$B_8$ 为 $4<L\leq8$；本例的目标完成数为 $(3,3,3,3)$。

下图中给了一个简单的例子

1. **Release**：F/G/H/I 保持已有 grant，J/K/L/M 在 $f_4$ 释放四个 lane；resident 中 N 在 $f_1$、O 在 $f_2$、P/Q 在 $f_4$。
2. **Plan**：已观察到的 EOS 完成数为 $(3,1,1,0)$，欠额为 $(0,2,2,3)$；乘以平均总服务量 $(1,2,4,8)$ 得到权重 $(0,4,8,24)$，按最大余数法分配八个 lane 得到目标 $(0,1,2,5)$，扣除冻结 grant $(0,1,1,2)$ 后，本轮需要新增 $(0,0,1,3)$。
3. **Apply**：O 获得到 $f_4$ 的 grant，J/P/Q 获得到 $f_8$ 的 grant，实际 mix 为 $(0,1,2,5)$，没有 supply miss 或 spill；N 留在 resident，因为冻结的 F 已满足 $f_2$ 的目标数量。

<figure class="sviz-demo sviz-demo-rollout">
  <div class="sviz-demo-frame">
    <systems-viz-next
      src="/demos/sviz/frontier-scheduler-example.json"
      visualization-id="frontier-scheduler-example"
      theme="auto"
    ></systems-viz-next>
  </div>
  <figcaption>同一次决策的 Release → Plan → Apply：只分配四个释放的 lane；O 补齐到 f_4 的 grant，J/P/Q 获得到 f_8 的 grant，实际 mix 为 (0,1,2,5)，无供给缺口或溢出。</figcaption>
</figure>
<script type="module" src="/demos/sviz/systems-viz-next.js"></script>

#### resident buffer

容易想象得到的一个问题是，状态转移的概率只能描述**期望**，不能描述**波动**。
因此，尽管我们能够分配好frontier，但是并不一定有相应的request正好处于这些frontier上面。

一个最简单的想法是，我们总是会保证系统内有大于concurrency数量的request，作为**额外的选项**。
这就是resident buffer。实际上，resident buffer的大小可以用2 cp(1-p)进行估算。

p.s. 2表示波动的正负，即进出状态的波动都要考虑到。

#### 完整的workflow

1. 决定RL训练一个step的目标batch 分布（bucket）。
2. 将执行中的request分布不同的状态，这些状态会转移到目标的bucket。
3. 事先采集好这些状态间的转移关系。
