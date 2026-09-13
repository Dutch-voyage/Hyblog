---
title: "并不现代的软件开发（2）"
description: "注册、编译、动态路径与可视化：为了实现更加测试/迭代/agentic 友好的框架，我们需要哪些努力"
pubDate: 2026-09-14
authors:
  - "owner"
tags:
  - "software-engineering"
  - "agentic-coding"
  - "artifact-infer"
status: "published"
formats:
  - "blog"
---
#### 现代的复杂框架测试

一个现实的问题是，对于一个复杂的代码库进行开发时，我们希望CI进行一些**局部的**和**用例**直接相关的测试，应该如何选择被触发的测试呢？

从最根本的角度思考，**改动了哪些代码，执行到对应代码的CI就应该被触发。**

由于我们面向的是python这种非常动态的语言（当然这类问题不仅限于python），因此这个问题基本指向了唯一的措施：**编译**。

#### 给开发者看的编译

传统编译指的是将代码转换成机器码，然而我们实际上要做相反的事情，即将代码改动重新翻译会功能组件。

大型框架一开始总是精心设计的，但是随着不断迭代（不受约束的开发），逐渐功能之间越来越耦合，功能的耦合本身不直接带来问题，但是一旦设计到测试，就带来了很大的成本开销。

因此我们在开发中需要明确限制，某处修改更改/添加了什么组件，并完成相应的注册。

这样一来整个代码库会显示成为一个DAG图，而某个具体的测试代码会通过编译成为一个子图。

![注册不同的组件](/images/artifact-infer-ep-ll-triton/relationships.svg)

```python
# ModelRunner.__init__ 中的原始片段
orch = RegistryOrchestrator()
self.model = wire_components(orch, self, config)
orch.finalize()
```

#### 结构化开发

某个commit总可以被看作是：**局部函数的修改**或**拓扑层面的修改**。

关于前者，触发规则总是类似路径匹配的一些措施。

而关于后者，则需要更加全局的图匹配。

以下是一些例子
（better see https://github.com/Dutch-voyage/Artifact-Infer）

##### 外层
![外层 cell 注册：BlockManager 向 Scheduler 提供分配接口，Scheduler 与 ModelRunner 向 LLMEngine 提供接口。](/images/artifact-infer-ep-ll-triton/outer-registry.svg)

下面是 recipe 中完整的 `combine()`：

```python
def combine(**kwargs):
    reject_implementation_kwargs(kwargs)
    orch = RegistryOrchestrator()

    engine = orch.add(LLMEngine(**kwargs))
    config = engine.config
    model_runner = orch.add(
        ModelRunner(
            config,
            wire_components=wire_components,
            use_cuda_graph=USE_CUDA_GRAPH,
        )
    )
    block_manager = orch.add(BlockManager(config.num_kvcache_blocks, config.kvcache_block_size))
    scheduler = orch.add(Scheduler(config))

    engine.model_runner = model_runner
    engine.block_mngr = block_manager
    engine.scheduler = scheduler

    for name in ("can_allocate", "allocate", "can_append", "may_append", "deallocate"):
        orch.register(block_manager, name, scheduler)
    for name in ("add", "schedule", "postprocess", "is_finished"):
        orch.register(scheduler, name, engine)
    orch.register(model_runner, "run", engine)
    orch.finalize()

    return engine, SamplingParams
```

`orch.add(...)` 将四个外层组件加入 orchestrator；`orch.register(...)` 再明确它们之间的接口关系：

- `BlockManager → Scheduler`：`can_allocate`、`allocate`、`can_append`、`may_append`、`deallocate`。
- `Scheduler → LLMEngine`：`add`、`schedule`、`postprocess`、`is_finished`。
- `ModelRunner → LLMEngine`：`run`。

##### 局部

![局部 cell 注册：Attention 接到 attention 层与共享 ModelRunner；MoeBackend 接到 DispatchEPLL、ExpertsEPLL、CombineEPLL 和同一个 runner。灰色边表示模型包含关系。](/images/artifact-infer-ep-ll-triton/local-registry.svg)

[单独打开局部图查看完整标签](/images/artifact-infer-ep-ll-triton/local-registry.svg)。蓝色带标签的边仍然表示 cell 注册。灰色无标签的边按 **被包含对象 → 包含它的对象** 绘制：模型包含各层，`runner.model` 引用模型。

下面是完整的 `wire_components()`，包括源码中的非 MoE 分支，便于之后对照修改；上图只展示其中的 MoE 分支。

```python
def wire_components(orch: RegistryOrchestrator, runner: ModelRunner, config):
    attention = orch.add(FlashinferAttention(config))

    is_moe = getattr(config.hf_config, "model_type", "") == "qwen3_moe"
    if is_moe:
        hf = config.hf_config
        moe_backend = orch.add(
            MoeBackend(
                config=config,
                num_experts=hf.num_experts,
                top_k=hf.num_experts_per_tok,
                hidden_size=hf.hidden_size,
                moe_intermediate_size=hf.moe_intermediate_size,
                impl=BACKEND_IMPL,
                block_size_m=BLOCK_SIZE_M,
                ll_m_max=LL_M_MAX,
                use_cuda_graph=USE_CUDA_GRAPH,
            )
        )
        model = orch.add(
            Qwen3MoeForCausalLM(
                hf,
                moe_block_size_m=BLOCK_SIZE_M,
                moe_mode="ep_ll",
                m_max=moe_backend.M_max,
                ep_ll_dispatch_kernel=DISPATCH_KERNEL,
            )
        )
    else:
        moe_backend = None
        model = orch.add(Qwen3ForCausalLM(config.hf_config))

    orch.register(attention, "init_forward_metadata_capture_cuda_graph", runner)
    orch.register(attention, "init_forward_metadata_replay_cuda_graph", runner)
    orch.register(attention, "prepare_metadata_for_attn_decode", runner)
    orch.register(attention, "prepare_metadata_for_attn_prefill", runner)

    for module in model.modules():
        if hasattr(module, "k_cache") and hasattr(module, "v_cache"):
            orch.register(attention, "attn", module)

        if moe_backend is None:
            continue
        if isinstance(module, DispatchEPLL):
            for name in (
                "send_buf",
                "recv_buf",
                "original_indices",
                "local_counts",
                "topk_weights_buf",
                "topk_ids_buf",
                "hidden_recv",
            ):
                orch.register(moe_backend, name, module)
        if isinstance(module, ExpertsEPLL):
            orch.register(moe_backend, "run_experts_ll", module)
        if isinstance(module, CombineEPLL):
            for name in ("rev_send", "rev_recv"):
                orch.register(moe_backend, name, module)

    if moe_backend is not None:
        orch.register(moe_backend, "prepare_metadata_for_moe", runner)
    return model
```

MoE 三类模块则明确通过 `isinstance()` 匹配：

| 使用者 | 来自同一个 `MoeBackend` 的 cell |
| --- | --- |
| `DispatchEPLL` | `send_buf`、`recv_buf`、`original_indices`、`local_counts`、`topk_weights_buf`、`topk_ids_buf`、`hidden_recv` |
| `ExpertsEPLL` | `run_experts_ll` |
| `CombineEPLL` | `rev_send`、`rev_recv` |
| `ModelRunner` | `prepare_metadata_for_moe` |

