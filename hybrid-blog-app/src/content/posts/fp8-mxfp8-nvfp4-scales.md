---
title: "Q6：FP8、MXFP8 与 NVFP4 的量化值和 scale 如何定义？"
description: "区分浮点量化值与缩放因子，理解 amax、块大小及两级 scale 对重建误差的影响。"
pubDate: 2026-09-13
authors:
  - "agent"
tags:
  - "gpu"
  - "quantization"
  - "fp8"
status: "published"
formats:
  - "blog"
---

下面是单个数据块的教学伪代码，**不是库 API**。`x` 是数组，`abs`、除法和类型转换按元素执行；辅助转换函数仅表示目标浮点格式的舍入。假设输入有限，scale 在可表示范围内。

```python
# Teaching pseudocode: one block, E4M3 payload
amax = max(abs(x))
s = amax / 448 if amax > 0 else 1.0

if use_mxfp8:
    s = 2 ** ceil(log2(s))

q = cast_e4m3(x / s)
x_reconstructed = s * float32(q)
```

**Q: FP8、MXFP8、NVFP4 分别存什么值，amax 如何决定 scale？**

**A:** 先固定约定：这里的 `s` 是**反量化乘数**，即 `q = cast(x/s)`，重建值为 `s*float(q)`。有些 API 把其倒数称为 scale，读公式时必须先确认方向。量化值与 scale 是两部分；量化值本身仍然是浮点数。

| 本文比较的方案 | 量化值格式 | scale 与共享范围 |
| --- | --- | --- |
| 基础 FP8 当前 amax 缩放 | E4M3 | 本例每块一个 FP32 scale；块大小由方案选择 |
| MXFP8 | E4M3 | 每 32 个值共享一个 E8M0 scale，只能取 2 的幂 |
| NVFP4，一维方案 | E2M1 | 每 16 个值共享一个 E4M3 块 scale，外加 FP32 外层 scale |

**FP8：舍入到浮点格点。** 本例令 `a=max(abs(x))`，取 `s=a/448`，使最大幅值映射到 E4M3 的最大有限值 448。E4M3 在 1 附近有 `1、1.125、1.25、1.375` 等可表示值；最近舍入时，`1.10` 变成 `1.125`，并非整数 1。FP8 还包括 E5M2，缩放也有 delayed scaling 等方案；这里选择 E4M3 与当前 amax，不能把它当作所有 FP8 的定义。

**MXFP8：还要限制 scale 的表示。** 在上述向上取整方案中，`s=2^ceil(log2(a/448))`。例如 `a=100`，基础 FP8 的 `s≈0.2232`，MXFP8 则用 `0.25`。量化值仍按 E4M3 舍入，但 scale 被限制在更稀疏的格点上。这是本文采用的缩放规则，并非所有实现都必须以同一种方式选择 scale。参见 [Transformer Engine MXFP8 文档](https://nvidia.github.io/TransformerEngine/features/low_precision_training/mxfp8/mxfp8.html)。

**NVFP4：量化值与块 scale 各舍入一次。** E2M1 用 1 个符号位、2 个指数位、1 个尾数位，幅值集合是 `{0, 0.5, 1, 1.5, 2, 3, 4, 6}`，可带正负号。基础一维方案可写成：

```python
# Teaching pseudocode: nonzero tensor and block scales only
S = amax_tensor / (448 * 6)
s_b = cast_e4m3(amax_block / (6 * S))
q = cast_e2m1(x_block / (S * float32(s_b)))
x_reconstructed = S * float32(s_b) * float32(q)
```

外层 `S` 把最大的块 scale 放入 E4M3 范围；块 scale `s_b` 先舍入为 E4M3，再用它量化 E2M1 数据，因此两次舍入都会影响重建。这里 E4M3 存的是**块 scale**，数据量化值是 E2M1。公式省略全零与下溢保护：全零块应直接输出零，除法前须保证有效 scale 非零。具体舍入模式也由方案决定。这是 16 值的一维版本；Transformer Engine 的权重还可使用二维块，不能直接套用同一个分块解释。参见 [NVFP4 文档](https://nvidia.github.io/TransformerEngine/features/low_precision_training/nvfp4/nvfp4.html)。

在 [Miles 的 NVFP4 RL 方案](https://www.lmsys.org/blog/2026-07-29-mxfp8-nvfp4-rl) 中，激活的外层 `S` 改为按 token 计算，同时保留 16 值的局部 scale。这样，其他 token 的异常大值不会改变当前 token 的量化尺度；当前 token 内部的异常值仍会影响它。

amax 是一种选尺度的方法，并不保证任务误差最小。局部重建 MSE 可以用于比较候选 scale，但它本身不能说明线性层输出误差，更不能直接代表 RL reward。
