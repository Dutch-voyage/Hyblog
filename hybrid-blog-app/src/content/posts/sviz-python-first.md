---
title: "sviz：从 Python 定义到可嵌入的系统可视化"
description: "用矩阵与嵌套结构两个交互示例，演示 sviz 的 define → compile → launch 工作流和 Web Component 发布方式。"
pubDate: 2026-09-06
authors:
  - "owner"
tags:
  - "demo"
  - "python"
  - "visualization"
  - "web-component"
status: "published"
formats:
  - "blog"
  - "interactive"
---

sviz 把系统图的定义、编译与阅读器分开：作者在 Python 中声明元素和连接，编译器生成确定性的显示数据，最后既可以启动本地阅读器，也可以把同一份结果发布到网页。

## define → compile → launch

一个最小的 Python 工作流只需要先构造 `Demo`，再编译并启动：

```python
from sviz import Demo

demo = Demo("service-map", title="Service map")
view = demo.view("overview")

browser = view.element("browser", label="Browser")
api = view.element("api", label="API")
database = view.element("database", label="Database")

view.connect(browser, api, label="HTTPS")
view.connect(api, database, label="SQL")

page = demo.compile()
page.launch()
```

`compile()` 返回仍可作为普通字典使用的渲染数据；`launch()` 则为本地编辑与检查启动阅读器。下面的博客版本直接加载预编译 JSON，因此发布后不依赖 Python、FastAPI 或 Node 构建服务。

## 矩阵：由索引生成内容

`matrix_example.py` 用一个声明生成 3 × 4 的 shard 矩阵。每个单元格的标签和属性都来自 `(i, j)` 索引，适合表达分片、tile 或规则拓扑。

<figure class="sviz-demo">
  <div class="sviz-demo-frame">
    <systems-viz-next
      src="/demos/sviz/matrix.json"
      visualization-id="matrix-example"
      theme="auto"
    ></systems-viz-next>
  </div>
  <figcaption>矩阵示例：选择节点可查看编译后的结构，也可以缩放形状并检查默认布局。</figcaption>
</figure>
<script type="module" src="/demos/sviz/systems-viz-next.js"></script>

## 嵌套结构：跨层连接

`nested_example.py` 把 core 放进 processor，再把 processor 与 memory 放进 machine，并从最深层的 core 连接到另一条分支上的 memory。它展示了结构层级与语义连接可以独立表达。

<figure class="sviz-demo">
  <div class="sviz-demo-frame">
    <systems-viz-next
      src="/demos/sviz/nested.json"
      visualization-id="nested-example"
      theme="auto"
    ></systems-viz-next>
  </div>
  <figcaption>嵌套示例：Machine 包含 Processor 与 Memory，Core 0 跨层连接到 Memory。</figcaption>
</figure>
<script type="module" src="/demos/sviz/systems-viz-next.js"></script>

## 同一份编译结果，两种发布形态

本页使用 sviz 的 `<systems-viz-next>` Web Component，让交互界面直接成为 MDX 内容的一部分。组件内部使用 Shadow DOM，不会覆盖博客的排版与配色变量；`theme="auto"` 会继续跟随系统明暗偏好。

如果宿主页面不适合加载自定义元素，也可以把相同的编译结果导出为 standalone HTML，再通过 `iframe` 隔离嵌入。对于当前 Astro + MDX 架构，Web Component 少一层文档边界，也更符合 Hyblog 把 demo 当作一等内容来管理的方式。

## 导入新的编译结果

在内置编辑器中点击「添加 Demo」，上传 `compile()` 生成的 JSON 后即可现场检查交互效果。编辑器会给出一段可复制的嵌入内容，也可以直接把它插入当前文章或笔记的 Markdown；提交 PR 时，JSON 会作为本地站点资源一起保存，不再创建单独的 Demo 类型内容。

在 Hyblog 仓库根目录也可以运行同一套本地导入流程：

```bash
npm run import:sviz -- \
  --json /path/to/compiled-demo.json \
  --asset my-demo
```

CLI 只写入 JSON 资源，并在终端打印可复制到任意 Markdown 内容里的嵌入代码。目标资源已经存在时会停止；只有明确传入 `--force` 才会替换。
