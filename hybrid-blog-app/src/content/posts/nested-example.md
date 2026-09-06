---
title: "Nested machine components"
description: "交互式 sviz 演示：Nested machine components"
pubDate: 2026-09-06
authors:
  - "owner"
tags:
  - "demo"
  - "visualization"
  - "sviz"
status: "published"
formats:
  - "blog"
  - "interactive"
---

这个页面展示 Nested machine components。

<figure class="sviz-demo">
  <div class="sviz-demo-frame">
    <systems-viz-next
      src="/demos/sviz/nested-example.json"
      visualization-id="nested-example"
      theme="auto"
      style="--sv-bg: var(--background); --sv-panel: var(--surface); --sv-panel-soft: color-mix(in srgb, var(--surface) 68%, var(--accent-soft)); --sv-text: var(--text); --sv-muted: var(--muted); --sv-border: var(--border); --sv-primary: var(--accent); --sv-selection: var(--accent);"
    ></systems-viz-next>
  </div>
  <figcaption>Nested machine components</figcaption>
</figure>
<script type="module" src="/demos/sviz/systems-viz-next.js"></script>
