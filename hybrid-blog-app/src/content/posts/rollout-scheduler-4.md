---
title: "Rollout Scheduler (4)"
description: "Scheduler如何影响Cache管理"
pubDate: 2026-09-13
authors:
  - "owner"
tags:
  - ""
status: "published"
formats:
  - "blog"
---

#### Rollout 的KV cache管理

Rollout中另一个重要的资源是KV cache，或者更宽泛的表述为Sequence Cache（KV Cache + R3 expert cache）。

关于具体KV cache管理技术，大部分可以复用Inference Serving中的技术，但是关键的区别在于Rollout的并行度控制，会直接影响到系统内的Memory管理。

#### execution 和 cache 是两种资源

前面用 lane 描述执行并行度，用 resident buffer 留下额外候选。到了多轮 agent，需要先分清三个对象：

<div class="scheduler-table">

| 对象 | 含义 | 生命周期 |
|---|---|---|
| trajectory | agent 从开始到完成的一次执行轨迹 | 包含多次 LLM call 和中间的 tool 等待 |
| request / Query | 一次 LLM call 提交给推理服务的请求 | 生成结束后，这次请求结束 |
| session cache | 以 session 身份索引、可被后续 call 复用的缓存 | 可以跨越多次 request，直到被释放或淘汰 |

</div>

下文用一条顺序执行的 trajectory 和它关联的 session 说明资源管理。一轮 LLM call 结束后，trajectory 等待 tool；tool 返回后提交新的 request，继续复用 session cache。具体系统可以有分支或多个 session，这里的 session 身份负责定位缓存，trajectory 身份负责串起执行过程。

这时，执行并行度和缓存驻留量就有了各自的生命周期：**LLM request 结束时归还 execution slot，session 的 KV 可以继续保留。**

<div class="scheduler-table">

| 分配什么 | 计量 | 作用 |
|---|---|---|
| execution slots | 执行中 + 已预留的数量 | 控制执行准入上限 |
| GPU KV | blocks | 控制近端驻留的软目标 |
| Host KV | blocks | 控制可恢复副本的软目标 |

</div>

调度设计按 Engine × bucket 分配这三项预算。执行预算决定现在运行多少请求；GPU 预算容纳执行中的 KV 和即将使用的候选；Host 预算保存距离下次使用更远的前缀。

#### 两级 cache 的移动

```text
写 Host 副本： G ──复制完成──> GH
成功 offload：GH ──安全释放 GPU──> H
恢复到 GPU：  H ──恢复完成──> GH（保留 Host 时）
```

这里 G/H 表示 GPU/Host 上的有效前缀，GH 表示两层都持有副本。写 Host 副本保留 GPU 驻留；offload 进一步释放 GPU。迁移先预留目标空间，完成复制，再交还源空间，因此传输过程中会同时占用两层容量。

Scheduler 因而有三个动作：Run 决定下一次执行，Promote 提前把前缀恢复到 GPU，Reclaim 回收暂时用不到的驻留。候选越接近下一次执行，越值得放在 GPU；等待时间越长，越适合放到 Host。

#### Agentic Memory pattern

不同 trajectory 的 prefill、decode 和 tool 等待比例，会形成不同的内存曲线。

下面用 flat 和 sharp 两类轨迹比较 uniform 与 debt-aware 分配。前者的 tool 等待更长，后者的 decode 更长；同样数量的候选，执行需求与缓存驻留需求可以很不一样。

[![flat-sharp-cache](/figures/flat-sharp-cache-0163dbf8d9eb08ee-page-1.png)](/figures/flat-sharp-cache-0163dbf8d9eb08ee.pdf)

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

<style>
.scheduler-table { overflow-x: auto; margin: 1.5rem 0; }
.scheduler-table table { border-collapse: collapse; width: 100%; min-width: 540px; font-size: .94em; }
.scheduler-table th, .scheduler-table td { padding: .6rem .85rem; border: 1px solid #8b99aa66; text-align: left; vertical-align: top; }
.scheduler-table th { background: #8b99aa18; }
</style>
