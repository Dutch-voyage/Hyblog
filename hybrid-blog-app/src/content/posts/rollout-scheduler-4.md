---
title: "Rollout Scheduler (4)"
description: "Scheduler如何影响Cache管理"
pubDate: 2026-09-13
authors:
  - "owner"
tags:
  - ""
status: "draft"
formats:
  - "blog"
---

#### Rollout 的KV cache管理

Rollout中另一个重要的资源是KV cache，或者更宽泛的表述为Sequence Cache（KV Cache + R3 expert cache）。

关于具体KV cache管理技术，大部分可以复用Inference Serving中的技术，但是关键的区别在于Rollout的并行度控制，会直接影响到系统内的Memory管理。

#### Agentic Memory pattern

设计到不同的prefill-decode-tool比例，每个request有其特有的Memory特征。

不过我们总是可以重新将他们分类，并使用类似的方式平衡他们的Memory Allocation。

**uniform**

<figure class="sviz-demo">
  <div class="sviz-demo-frame">
    <systems-viz-next
      src="/demos/r2/90520822-b4dd-494f-a4ad-bda886429642/agentic-uniform.json"
      visualization-id="agentic-uniform"
      theme="auto"
    ></systems-viz-next>
  </div>
  <figcaption>Uniform allocation · flat and sharp requests</figcaption>
</figure>
<script type="module" src="/demos/sviz/systems-viz-next.js"></script>

**debt-aware**

<figure class="sviz-demo">
  <div class="sviz-demo-frame">
    <systems-viz-next
      src="/demos/r2/b2b00391-e8ae-42c9-91ba-79169fce234c/agentic-debt-aware.json"
      visualization-id="agentic-debt-aware"
      theme="auto"
    ></systems-viz-next>
  </div>
  <figcaption>Debt-aware allocation · flat and sharp requests</figcaption>
</figure>
<script type="module" src="/demos/sviz/systems-viz-next.js"></script>