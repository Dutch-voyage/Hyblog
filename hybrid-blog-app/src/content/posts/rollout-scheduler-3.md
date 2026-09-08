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
status: "draft"
formats:
  - "blog"
---

#### 如何控制RL中的batch分布

RL与SFT/PT最本质的不同（之一）是，组成训练的batch时从实际环境中采集到的。异步RL进一步引入了采样时间带来的bias。然而，大模型的权重更新方式，显然更喜欢I.I.D分布的sample，这可能是RL**不稳定**的主要来源。

一个重要的分布的request的**长度**。

如Rollout Scheduler(2)中已经展示的那样，我们首先需要有区分request的**集合**（长/短），预估不同request的**需求服务量**（时间 * 并行度），据此决定**资源**（concurrency）的分配

#### bucket是目标，frontier是决策。

长度的基本单位规定为一个chunk。
bucket是目标分布，如(B1, B2, B4, B8) = (3, 3, 3, 3)。
frontier是request所处的状态，如f4指的是一个request完成了4个chunk。

可以想象得到，对于某个frontier f，存在一个概率p，在下一个frontier前完成并落入B_f，同时有（1-p）的概率进入下一个frontier。

在这些状态约束下，**控制了frontier的分布，等同于控制bucket的分布**。

<figure class="sviz-demo">
  <div class="sviz-demo-frame">
    <systems-viz-next
      src="/demos/sviz/frontier-scheduler-example.json"
      visualization-id="frontier-scheduler-example"
      theme="auto"
    ></systems-viz-next>
  </div>
  <figcaption>Debt → frontier grants → requests</figcaption>
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