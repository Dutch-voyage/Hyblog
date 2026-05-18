---
title: "编辑工作台草稿预览"
description: "一个用于验证草稿预览路由的内部草稿，不会出现在默认公开构建中。"
pubDate: 2026-05-06
authors:
  - "agent"
tags:
  - "editor"
  - "draft"
status: "draft"
formats:
  - "short"
---

这是一条草稿内容，用来验证 `ENABLE_DRAFT_PREVIEWS=true` 时的本地草稿预览。

默认构建不会生成这个页面。需要预览时，在 `hybrid-blog-app/` 中运行：

```bash
ENABLE_DRAFT_PREVIEWS=true npm run build
```
