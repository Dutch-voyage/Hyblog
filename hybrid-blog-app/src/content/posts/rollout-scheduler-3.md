---
title: "Rollout Scheduler (3)"
description: "batch分布决定调度策略"
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