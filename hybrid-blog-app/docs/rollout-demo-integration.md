# Rollout demo integration

Articles `rollout-scheduler-2` and `rollout-scheduler-3` embed the shared
`systems-viz-next` web component with site-local JSON assets. No standalone HTML
or localhost reference URL is needed in the published pages.

## Refresh the assets

The September 13, 2026 update imports the current working files from
`/Users/bytedance/workspace/demo-python-dsl`, including its uncommitted revisions.
The older `chunk_schedule/demo_anything` checkout is not the source.

From the blog repository root:

```sh
npm run import:sviz -- --json /Users/bytedance/workspace/demo-python-dsl/export/async_rollout.json --asset rollout-scheduler-example --force
npm run import:sviz -- --json /Users/bytedance/workspace/demo-python-dsl/export/frontier_scheduler.json --asset frontier-scheduler-example --force
cp /Users/bytedance/workspace/demo-python-dsl/src/sviz/static/systems-viz-next.js hybrid-blog-app/public/demos/sviz/systems-viz-next.js
npm run build
npm test
```

Authoring lives in `examples/rollout_scheduler.py` and
`examples/frontier_scheduler.py` in that source project; assumptions and generic
presentation attributes are documented in `docs/frontier-scheduler.md` and
`docs/python-dsl-design.md`. Import both JSON and runtime together: older runtimes
lack the projection preservation, font sizing, scrolling, wrapped labels,
legends, notes, and outline-only operation emphasis used here.

The articles opt into `sviz-demo-rollout`, a 1200px maximum figure width. This
leaves space beside the 320px narrative panel for the frontier wide layout.
Other articles retain their existing figure sizing. On narrow screens, the
frontier engines/cards stack and the basic diagram scrolls at its authored
800px minimum width.

## Validation performed

- Imported JSON matches both current source exports structurally; the runtime
  matches the source byte for byte.
- Production Astro build/check and Cloudflare Pages packaging succeeded;
  Astro reported zero errors, warnings, or hints in 63 checked files.
- All 70 existing tests across 10 files passed, including shared viewer colors
  and import validation.
- Actual Astro preview pages were exercised at `/content/rollout-scheduler-2/`
  and `/content/rollout-scheduler-3/` using the development server on port 4322.
- Both basic cases and all three frontier checkpoints were visited in both
  projections at desktop and 390px narrow width. Next/previous navigation,
  projection preservation, request selection across paired views, and expanded
  supporting notes were checked. The basic narrow diagram exposed an 800px
  scroll surface within a 356px panel; horizontal keyboard scrolling worked.
- Representative screenshots were inspected for readable labels, wrapped
  frontier labels, desktop side-by-side engines, narrow stacked engines,
  residents beneath each engine, and preserved progress fills with orange
  decision outlines. The browser recorded no console errors.

This was an integration check, not a rerun of the source project's semantic
suite or an exhaustive geometric audit of every label. No source-project files
were modified and nothing was deployed.
