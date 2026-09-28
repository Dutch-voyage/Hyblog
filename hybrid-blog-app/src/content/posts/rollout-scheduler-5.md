---
title: "Rollout Scheduler (5)"
description: "多轮 agent 的执行、缓存与 buffer 配比"
pubDate: 2026-09-23
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

#### 从 generation 到多轮 agent

前几篇用 completion debt 决定服务量，用 frontier 控制一次 grant 可以走多远，再用 resident buffer 留下候选。到了多轮 agent，候选会在 LLM 执行与 tool 等待之间反复切换；同一条轨迹的执行需求和缓存需求，也就有了不同的节奏。

先沿用第4篇的定义：**trajectory** 串起一次 agent 执行，**request / Query** 是其中的一次 LLM 请求，**session cache** 保存可供后续请求复用的前缀。下面以一条顺序轨迹及其关联 session 为一个候选：一轮 request 结束后，候选进入 tool 等待；输入就绪后，它提交下一轮 request。

#### Bucket 分的是什么

Bucket 是分类方式，分类依据取决于调度目标。前面讨论的最终长度、这里关注的执行进度，以及缓存放在哪里，是三个不同的维度。

<div class="scheduler-table">

| 维度 | 例子 | 调度时的用途 |
|---|---|---|
| 结果 bucket | 最终生成长度落在哪个区间 | 描述训练 batch 希望得到的完成分布 |
| 进度 bucket | 当前 call 的 request_index 落在 [0,8)、[8,16) 等区间 | 描述候选走到了哪里，估计后续执行和缓存需求 |
| 资源状态 | ready / tool wait / executing，以及 GPU / Host 驻留 | 决定候选现在可以执行什么操作 |

</div>

本文的 quota 按**进度 bucket**分配。request_index 是同一次执行的观测 scope 内，RM 为新 Query 预留的零基序号；同一 Query 的重试沿用编号，新 Query 获得新编号，编号预留后，后续接纳失败可能留下空号。

进入下一次 call 时，候选可能跨过 bucket 边界；trajectory 完成时，候选退出。跨 bucket 首先是归属与预算记账的变化，已经留在原地的 KV 可以继续复用。Tool 返回改变候选的就绪状态，新的 call 编号决定它属于哪个进度 bucket。

#### 通信契约的三次变化

这条通信链经历了三个版本。变化的核心是**谁发起一次控制、在哪里等待，以及共享状态按什么顺序更新**。

<div class="scheduler-table">

| 版本 | 发起方 | Proxy 的处理方式 | 等待边界 |
|---|---|---|---|
| 原始双循环 | Proxy | update 与 dispatch 各自推进；dispatch 主动观察全局 Engine load | 两个 loop 各自等待自己的 RPC |
| 第一版 deterministic 控制轮 | Proxy | 合并观测、更新、决策与执行；两次握手固定先后关系 | 状态同步完成后决策，计划安装 ACK 收齐后交付数据 |
| 当前窗口串行模式 | Engine | 请求附带 snapshot；Proxy 收集一个短窗口，排序后逐条处理、回复 | 窗口到期处理已到请求；每个 Engine 等待自己的回复 |

</div>

##### 1. 原始模式：update / dispatch 两个 loop

**Dispatch loop** 每轮主动向所有 ready Engine 查询 load，拿到全局负载视图后选择 request 的归属，再将数据分发到对应 Engine。

**Update loop** 独立向 Engine 拉取 request 进度与完成结果，更新 RequestManager。两个 loop 可以交错运行：dispatch 读取负载时，update 可能还在提交另一批结果。Proxy 管请求放在哪里，Engine 的本地 scheduler 决定怎么执行。

<figure>
<img src="/demos/chunk-scheduler-20260923/communication/01-proxy-loops.svg" alt="Proxy 的 dispatch 和 update 两个 loop 独立运行；dispatch 查询全局 Engine load，update 同步结果到 RequestManager。" />
<figcaption>原始双循环：两个 loop 各自推进，dispatch 主动获取全局负载。</figcaption>
</figure>

##### 2. 第一版：用两次握手组织 deterministic 控制轮

Chunk Scheduler 需要把完成欠额、request ownership 和 Engine grant 放到同一次决策里，因此第一版将 update 收进统一的控制轮：

<figure>
<img src="/demos/chunk-scheduler-20260923/communication/02-two-handshakes.svg" alt="Proxy 等待所有 Engine 的观测与结果同步后固定 ControlSnapshot，计算并下发 grant，收齐安装 ACK 后交付新 request 数据。" />
<figcaption>第一版：两次握手分别固定决策输入和计划安装边界。</figcaption>
</figure>

这里的“两次握手”指两个阶段的等待边界；每个阶段可以包含多次 RPC。第一道边界确定本轮用哪些已确认的状态和完成结果，第二道边界保证新请求的数据交付发生在 grant 安装之后。

Deterministic 的重点是**相同的 ControlSnapshot 产生相同决策，控制动作按固定顺序执行**。这个顺序也带来了整轮等待：某个 Engine 的状态回复或安装 ACK 较慢，会推迟后续控制阶段；GPU 计算本身仍由各 Engine 持续推进。

##### 3. 当前模式：Engine 发起，Proxy 窗口内串行处理

现在把调度通信的触发点放到 Engine：本地资源释放等事件唤醒通信侧，由它读取最新 snapshot，携带发送时间与递增序号请求 Proxy。原有 update / ownership dispatch 继续承担结果同步和请求分发，新增的调度通道负责这些 Engine 请求。

Proxy 维护一个短重排窗口。空队列收到第一条请求时启动计时，后续请求加入队列，窗口截止时间保持不变。到期取出当前缓存的请求，按 **(sent_at, engine_id, request_seq)** 排序，再由一个处理器逐条处理。

<figure>
<img src="/demos/chunk-scheduler-20260923/communication/03-engine-window.svg" alt="B 先到达开启 5ms 窗口，A 后到达但发送时间更早。窗口到期后 Proxy 按 A、B 排序，依次更新视图、处理请求并回复。" />
<figcaption>当前版本：Engine 主动上报；Proxy 在一个窗口内确定顺序，再串行更新共享视图并回复。</figcaption>
</figure>

例如窗口取 5ms：B 在 Proxy 本地 0ms 到达、发送时间为 102；A 在 3ms 到达、发送时间为 100。到 5ms 时，Proxy 按 A→B 处理。发送时间用于排序，Proxy 的单调时钟用于计算等待窗口。

每处理一条请求，先用它的 snapshot 更新对应 Engine 的视图，再处理这次请求并生成回复，然后才处理下一条。这样，B 读取到的共享视图包含前面 A 已经写入的更新。**串行化的位置从一整轮全局握手，移到了窗口内的请求处理顺序。**

窗口到期就处理已到达的请求，没有发来请求的 Engine 继续保留最近一次上报的视图。每个 Engine 最多保持一个未完成的调度请求，等待回复期间合并本地事件，回复后再读取新的 snapshot。早于已处理排序边界的迟到请求收到重试回复，重新进入后续窗口。

#### Dual state：执行与缓存分别记账

一次 LLM call 结束、轨迹进入 tool 等待时，执行名额已经可以归还，session 的 KV 前缀却仍然有复用价值。Tool 返回后，新请求的输入就绪了，前缀又可能还留在 Host，需要先恢复到 GPU。**执行进度和缓存驻留按各自的节奏变化**，因此同一个候选需要同时记录两个状态。

沿用前面的候选定义：一条顺序 trajectory，以及它关联的 session。记作 **S=(E,C)**，其中 E 跟踪这条轨迹当前的 LLM 执行阶段，C 跟踪 session 的有效缓存副本。

<figure>
<img src="/demos/chunk-scheduler-20260923/dual-state/01-two-dimensions.svg" alt="Dual state 的两个维度：E 为等待输入 W、输入就绪 R、正在执行 X；C 为无副本、仅 GPU、仅 Host、GPU 与 Host 都有。R/H 表示输入就绪但还需要恢复前缀，W/G 表示等 tool 时仍保留 GPU 前缀。" />
<figcaption>同一个候选可以输入已就绪、缓存仍在 Host，也可以正在等 tool、缓存仍在 GPU。</figcaption>
</figure>

**R 的含义是输入就绪。** 从 R 进入 X，还要完成当前请求需要的 GPU 缓存准备，并获得 execution slot 与执行资源。G 或 GH 表示 GPU 上有有效前缀，可复用的长度由具体缓存元数据决定；当前输入超出前缀的部分继续做 prefill。C=∅ 时，走重新计算前缀的路径。

**C 记录有效副本的位置。** G 是仅 GPU 有副本，H 是仅 Host 有副本，GH 是两层各有副本。两份副本的有效前缀可以长短不同，后续计算可以继续延长 GPU 上的前缀。实际容量按每层的物理 blocks 记账。

##### 状态转换与 quota

小写 e、c 表示该维度不变。下表按操作完成后的状态记账。

<span style="display:inline-block;padding:2px 8px;border-radius:5px;color:#1856a0;background:#e8f1ff;font-weight:600">蓝色：执行准入</span>　<span style="display:inline-block;padding:2px 8px;border-radius:5px;color:#713e9e;background:#f3eafa;font-weight:600">紫色：缓存预算</span>　<span style="display:inline-block;padding:2px 8px;border-radius:5px;color:#475569;background:#edf1f5;font-weight:600">灰色：事件与写入策略</span>

目前 bucket quota 控制 call 准入，缓存按 LRU 管理；下表的缓存预算描述按 bucket 扩展后的选择策略。

<div class="scheduler-table">

| 操作 | 状态转移 | 条件 | Quota 的作用 |
|---|---|---|---|
| 输入就绪 | (W,c) → (R,c) | 下一次 LLM 输入准备好。 | <span style="display:inline-block;padding:2px 8px;border-radius:5px;color:#475569;background:#edf1f5;font-weight:600">事件</span> 增加 ready 候选。 |
| 开始执行 | (R,G/GH) → (X,G/GH) | 获得 grant，GPU KV 和内存就绪。 | <span style="display:inline-block;padding:2px 8px;border-radius:5px;color:#1856a0;background:#e8f1ff;font-weight:600">Execution</span> 缺额时补 grant；满额或超额时暂缓。 |
| 计算缺失 KV | (R,∅) → (X,G) | 获得 grant 和内存，计算缺失前缀。 | <span style="display:inline-block;padding:2px 8px;border-radius:5px;color:#1856a0;background:#e8f1ff;font-weight:600">Execution</span> 同样占用执行名额，新增 KV 计入 GPU 占用。 |
| 执行结束 | (X,c) → (W,c) 或 (R,c) | call 结束；trajectory 完成则退出活跃集合。 | <span style="display:inline-block;padding:2px 8px;border-radius:5px;color:#475569;background:#edf1f5;font-weight:600">事件</span> 释放 grant，cache 可继续保留。 |
| 写 Host 副本 | (e,G) → (e,GH) | Host 有容量，前缀可安全复制。 | <span style="display:inline-block;padding:2px 8px;border-radius:5px;color:#475569;background:#edf1f5;font-weight:600">写入策略</span> 沿用 call 结束时的写入，增加 Host 占用。 |
| 恢复到 GPU | (e,H) → (e,GH) | GPU 有容量，Host 副本有效。 | <span style="display:inline-block;padding:2px 8px;border-radius:5px;color:#713e9e;background:#f3eafa;font-weight:600">GPU</span> 有余量时，按候选需求选择恢复。 |
| 回收 GPU | (e,GH) → (e,H)；(e,G) → (e,∅) | blocks 可释放；删除唯一副本须允许重算。 | <span style="display:inline-block;padding:2px 8px;border-radius:5px;color:#713e9e;background:#f3eafa;font-weight:600">GPU</span> 优先回收超预算 bucket 的副本。 |
| 回收 Host | (e,GH) → (e,G)；(e,H) → (e,∅) | blocks 可释放；删除唯一副本须允许重算。 | <span style="display:inline-block;padding:2px 8px;border-radius:5px;color:#713e9e;background:#f3eafa;font-weight:600">Host</span> 优先淘汰超预算 bucket 的副本。 |

</div>

**执行缺额 = 目标 − 执行中 − 已预留。** 缺额时补 grant，超额时暂停补充，等待 call 完成释放名额。获得 grant 后仍可能停在 R，实际开始执行才进入 X。分发决定 Engine 归属，准入决定何时执行。

**执行缺额与缓存超额可以同时存在。** 例如大量候选处于 (W,G) 等 tool：它们占用 GPU cache，却不占执行名额。此时可以回收部分前缀，同时从 R 候选中补 grant。

Offload 是 **G→GH→H**：先写 Host，再释放 GPU。复制完成后才更新 C；部分回收可能只减少 blocks，仍保持原来的状态类别。

#### Run / Promote / Reclaim

Run 使用执行名额，Promote 使用 GPU 空间，Reclaim 释放 GPU 或 Host 空间，分别按 **Engine × 进度 bucket** 记账。执行名额是准入上限，缓存预算是驻留目标；执行中或传输中的 blocks 受保护，超额后逐步回收。

```text
watermark → 需要回收多少空间
quota     → 优先从哪个 bucket 回收
LRU       → 选择具体 session
```

#### Buffer 配比来自供需波动

稳定的平均分布回答每个 bucket 长期需要多少服务，buffer 则负责撑过短时间的供需错位。两个 bucket 即使有相同的平均到达率，也可能一个陆续补充、另一个集中到达，因而需要不同数量的备用候选。

把视角放在 bucket i 的 ready 候选池，正在执行的候选另计。在一个补充窗口内，记：

- $B_i$：窗口开始时额外准备的 ready 候选数。
- $A_i(t)$：到时刻 $t$ 为止的累计净补充数，包含进入该池的新候选、tool 返回等补充，并扣除取消或改归其他 bucket 的离开。
- $D_i(t)$：执行配额计划在这段时间取用的累计候选数。

每次取用都能满足时，剩余候选数为：

$$
Q_i(t)=B_i+A_i(t)-D_i(t).
$$

因此，要让这个窗口内一直有候选可取，窗口初始的 buffer 至少要覆盖**累计需求领先累计供给的最大距离**：

$$
B_i^{\mathrm{window}}=\max_{0\le t\le T}\bigl[D_i(t)-A_i(t)\bigr]_+.
$$

这里 $[x]_+=\max(x,0)$。计算时使用配额计划的取用需求；即使某次因为候选不足没有执行，那次需求仍计入 $D_i$，这样才能看见短缺。

例如两个 bucket 每轮都需要取用2个候选。A桶四轮的补充是1、3、0、4，B桶是2、2、1、3，两者总数都是8。下表按“本轮补充到达后，再取用”的顺序累计：

<div class="scheduler-table">

| 轮次 | 累计需求 | A桶累计补充 | A桶缺口 | B桶累计补充 | B桶缺口 |
|---|---:|---:|---:|---:|---:|
| 1 | 2 | 1 | 1 | 2 | 0 |
| 2 | 4 | 4 | 0 | 4 | 0 |
| 3 | 6 | 4 | 2 | 5 | 1 |
| 4 | 8 | 8 | 0 | 8 | 0 |

</div>

A桶需要2个备用候选，B桶需要1个，buffer 配比就是 **2:1**。两桶的平均供给和取用都相同，差别来自补充的时序。给A桶2个初始候选后，四轮取用后的库存是1、2、0、2；给B桶1个初始候选后，库存是1、1、0、1。

对许多窗口重复计算最大缺口，就得到每个 bucket 的缓冲需求分布。例如，选择其99%分位作为目标，含义是在这些窗口中覆盖约99%的最大缺口。若持续的平均取用超过补充，缺口会不断累积，此时应调整执行配额或补充速度；短期buffer负责的是围绕平衡点的波动。

#### 把候选 buffer 放进两级 cache

候选数确定后，还要决定它们放在哪里。GPU buffer 提供可以很快进入执行的候选，Host buffer 则保存更远期候选的可恢复前缀。

对 GPU ready 池沿用上面的缺口计算，把补充窗口设为 Host→GPU 的恢复响应时间，并把 $A_i$ 换成在这段时间里真正准备好 GPU 前缀的净补充。恢复越慢、取用越集中，GPU 就越需要提前准备候选。

Host 管理的是更长时间尺度的库存：根据 tool 等待、下一次call到达和跨bucket迁移，挑出值得保留前缀的 session；再按预计使用时间把其中一部分 Promote 到 GPU。等待 tool 的候选进入 ready 池之前，已经可能占用 Host 或 GPU cache。

<div class="scheduler-table">

| 预算 | 组成 |
|---|---|
| GPU blocks | 执行中的 KV + 已准备候选的 GPU 前缀 + 传输目标预留 + 执行增长余量 |
| Host blocks | 保留在 Host 的 session 前缀 + 传输目标预留 |

</div>

同一个 GH 候选在逻辑库存里只算一次，在 GPU 和 Host 账本里各占一份空间；共享前缀则按每层的物理 blocks 去重。因此，候选数为2:1，内存配比还要乘上各类前缀的实际大小。如果两个候选各需4 blocks，而另一个候选需要12 blocks，那么对应空间就是8:12。

Profile 需要连起来记录三类信息：候选何时进入或离开ready池、配额何时产生取用需求、前缀占多少空间以及恢复耗时。用较长窗口估计补充和需求，用较短窗口调整执行与Promote；当缺口分位或恢复时间持续变化时，再平滑调整buffer目标。

#### 看一段实际的资源变化

把这些维度放到实际观测中，可以沿时间轴查看 GPU 与 Host 上的缓存如何变化。下面展示 9 月 23 日 02:20–10:58（北京时间）的完整观测，共 1,240 帧、51 个窗口，跨度约 8 小时 38 分钟。横轴是从首帧开始的相对时间，纵轴是缓存 blocks。

先在 **Tier** 中切换 GPU 和 Host，观察两层驻留的变化；再按 **Request-index bucket** 分组，看缓存落在哪些进度区间。这里按 task 最近一次请求的 request_index 归类，已经关联的缓存进入对应 bucket，其余映射状态单独显示。这段历史覆盖 step_1 到 step_22；切换到 **Weight version**，可以沿时间查看不同权重版本的驻留与更替。

<figure class="sviz-demo sviz-demo-rollout">
<iframe title="GPU 与 Host 缓存交互时间轴" src="/demos/chunk-scheduler-20260923/observations/cache-timeline.html" loading="lazy" style="width:100%;height:1120px;border:1px solid #8b99aa66;border-radius:12px"></iframe>
<figcaption>默认展示完整历史。拖选时间范围可放大；点击曲线或切换帧，可在下方查看对应窗口的 task、cache、request index 与两层 blocks。</figcaption>
</figure>

虚线给出所选 Engine 的 KV 池容量上限，图上方同时列出所选版本缓存占比与池总占用比例。橙色标记对应副本上报不完整的采样，悬停时可以查看已上报的部分。

默认显示每个 Engine 当时观测到的当前权重版本。关闭“仅当前版本”可查看全部版本，选择一个 Engine 则能把聚合占用拆开。对照某一帧的 GPU / Host 明细，还可以看到同一个缓存是否同时在两层保留副本。

由此，进度分桶和缓存驻留连在了一起：bucket 描述候选走到了哪里，GPU / Host 记录前缀放在哪里；再结合前面 ready 池的补充与取用，就能分析应该提前准备多少候选，以及分别为两层 cache 留出多少空间。
