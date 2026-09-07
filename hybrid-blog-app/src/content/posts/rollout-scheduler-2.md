---
title: "Rollout Scheduler (2)"
description: "Rollout Scheduler是如何决定batch的"
pubDate: 2026-09-07
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

#### 可调度的资源

一般意义上，调度器（Scheduler）做的事情只有一件：分配资源。

在rollout schedule这件事情上，系统中的资源是什么呢？

最简单的模型中，需要被决定的资源只有一个，即并行度。系统中同时只存在一定数量的slot，request会通过分配得到slot，一个最基础的scheduler需要就是“现在需要跑多少request”。

Q：在异步RL中，并行度过大或者过小会发生什么？

A：并行度过大，则永远是quickest/shortest-first，并行度过小，则不能利用完全计算资源。

#### 调度的目标

控制并行度下，从**Scheduler**的视角来说，一个单位时间内，并行度为C，**则request产生的速度就是C**。因此效率不是优化的目标（这里的效率可以简化为并行的C个token进行decode，即一个batch，由Inference Scheduler决定，见上篇）。

那么目标是什么，一个重要的选项是request的分布。

#### 误区与正确的思考方式

最普通也容易犯错的想法是，目标的request分布是什么，就应该以什么样的分布发送给rollout。

这样的想法在同步训练中是自然的，但是在异步RL中，由于我们不知道barrier什么时候到来，这样做的后果就是，**batch的分布受到期望完成时间的影响，而产生了bias**。

下图是最简单的示意：
<figure class="sviz-demo">
  <div class="sviz-demo-frame">
    <systems-viz-next
      src="/demos/sviz/rollout-scheduler-example.json"
      visualization-id="rollout-scheduler-example"
      theme="auto"
    ></systems-viz-next>
  </div>
  <figcaption>Length-aware rollout lane allocation</figcaption>
</figure>
<script type="module" src="/demos/sviz/systems-viz-next.js"></script>