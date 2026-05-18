# Hybrid Blog 第一阶段建设记录

本文档记录“构建一个最简单的个人博客”的实际交付内容。它对应 `hybrid_blog.md` 中的第一项具体任务。

## 本次目标

完成一个可以本地运行和静态构建的最小 Astro 个人博客，保留后续扩展为 Hybrid Blog 的结构。

本阶段只做：

1. 首页。
2. 文章、笔记、Demo 三类内容集合。
3. 列表页和详情页。
4. Markdown/MDX 示例内容。
5. Pages CMS 的 Git-based 编辑配置。
6. 基础 SEO 插件、RSS 和 sitemap 配置。

本阶段不做：

1. 登录和用户系统。
2. 评论系统。
3. 搜索。
4. agent API。
5. 在线 notebook 执行。
6. 云端数据库、对象存储和 serverless 任务。

## 已创建的项目结构

```text
.
├── .gitignore
├── .pages.yml
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── hybrid_blog.md
├── hybrid_blog_research.md
├── hybrid_blog_build_record.md
├── public/
│   └── images/
└── src/
    ├── components/
    │   └── ContentCard.astro
    ├── content/
    │   ├── demos/
    │   │   └── first-demo.mdx
    │   ├── notes/
    │   │   └── cold-start-idea.md
    │   └── posts/
    │       └── hello-hybrid-blog.md
    ├── content.config.ts
    ├── layouts/
    │   └── BaseLayout.astro
    └── pages/
        ├── index.astro
        ├── rss.xml.ts
        ├── demos/
        │   ├── [slug].astro
        │   └── index.astro
        ├── notes/
        │   ├── [slug].astro
        │   └── index.astro
        └── posts/
            ├── [slug].astro
            └── index.astro
```

## 技术选择

当前最小博客使用：

1. Astro：负责静态站点生成、页面路由和内容渲染。
2. TypeScript：用于 Astro 配置、内容 schema 和类型检查。
3. Astro Content Collections：定义 `posts`、`notes`、`demos` 三类内容集合。
4. MDX：用于 demo 内容，验证未来嵌入组件和交互内容的路径。
5. `@astrojs/sitemap`：为后续正式域名配置 sitemap。
6. `@astrojs/rss`：生成基础文章订阅源。
7. Pages CMS：通过 `.pages.yml` 提供 Git-based CMS 编辑入口。

## 页面说明

### 首页

路径：`/`

文件：`src/pages/index.astro`

首页展示：

1. 站点定位。
2. 三个内容入口：文章、笔记、Demo。
3. 最近更新内容。

### 文章列表和详情

路径：

1. `/posts/`
2. `/posts/hello-hybrid-blog/`
3. `/rss.xml`

文件：

1. `src/pages/posts/index.astro`
2. `src/pages/posts/[slug].astro`
3. `src/content/posts/hello-hybrid-blog.md`
4. `src/pages/rss.xml.ts`

用途：承载长文章和系统性表达。

### 笔记列表和详情

路径：

1. `/notes/`
2. `/notes/cold-start-idea/`

文件：

1. `src/pages/notes/index.astro`
2. `src/pages/notes/[slug].astro`
3. `src/content/notes/cold-start-idea.md`

用途：承载短内容、灵感记录和轻量更新。

### Demo 列表和详情

路径：

1. `/demos/`
2. `/demos/first-demo/`

文件：

1. `src/pages/demos/index.astro`
2. `src/pages/demos/[slug].astro`
3. `src/content/demos/first-demo.mdx`

用途：承载 demo、工具说明、视频脚本或后续 notebook 包装页。

## 内容模型

内容 schema 在 `src/content.config.ts` 中定义。

三类内容共享基础字段：

```yaml
title: "标题"
description: "摘要"
pubDate: 2026-05-06
updatedDate: 2026-05-06
authors:
  - "owner"
tags:
  - "tag"
status: "published"
cover: ""
canonicalUrl: ""
```

`posts` 增加：

```yaml
type: "post"
formats:
  - "blog"
```

`notes` 增加：

```yaml
type: "note"
formats:
  - "short"
```

`demos` 增加：

```yaml
type: "demo"
demoUrl: "https://example.com"
repositoryUrl: "https://example.com"
formats:
  - "demo"
```

## Pages CMS 配置

文件：`.pages.yml`

当前配置了：

1. 媒体目录：`public/images`。
2. Posts 集合：写入 `src/content/posts`。
3. Notes 集合：写入 `src/content/notes`。
4. Demos 集合：写入 `src/content/demos`。

这个配置的目的不是自研后台，而是让非技术作者可以通过 Pages CMS 编辑 Git 仓库中的内容文件。

## 本地运行

`package.json` 已声明 Astro 相关依赖。当前机器需要先确保 `npm`、`pnpm`、`yarn` 或 `bun` 至少有一个可用。

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

构建静态站点：

```bash
npm run build
```

预览构建结果：

```bash
npm run preview
```

## 当前验证状态

已完成文件层面的项目搭建。当前 Cursor shell 环境可以找到 Cursor 内置 Node.js，但没有可用的 `npm`、`pnpm`、`yarn`、`bun` 或 `corepack` 命令，因此本次无法在该环境中完成依赖安装和 `npm run build` 验证。

待本机安装包管理器后，优先执行：

```bash
npm install
npm run build
```

## 后续建议

第一阶段之后，最值得继续做的是：

1. 把 `astro.config.mjs` 中的 `site` 从 `https://example.com` 替换为真实域名。
2. 增加 RSS。
3. 增加静态搜索。
4. 增加标签页和专题页。
5. 接入部署平台。
6. 增加 agent 草稿 PR 的内容校验流程。
