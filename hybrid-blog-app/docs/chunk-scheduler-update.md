# Chunk Scheduler blog update — 2026-09-23

`rollout-scheduler-4.md` retains `published`; `rollout-scheduler-5.md` is a local `draft`. Nothing was deployed. The existing demos/runtime remain unchanged. The article uses generic identities; private source paths belong in this integration note, not in rendered article copy.

## Review without authentication

From `hybrid-blog-app` run:

```sh
node scripts/export-chunk-scheduler-review.mjs
```

Open `../work/chunk-scheduler-update/rollout-scheduler-5-review.html` directly, or serve the blog root:

```sh
python3 -m http.server 4387 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4387/work/chunk-scheduler-update/rollout-scheduler-5-review.html`.

This is an independent self-contained HTML export, not an Astro public article URL. Astro public content deliberately excludes drafts; `/drafts/posts/rollout-scheduler-5/` is an authenticated dynamic route. The exporter leaves status, authentication, routes, RSS and search unchanged. Images are embedded as data URLs and report HTML as iframe srcdoc. The exporter keeps fragment navigation inside each report so tabs work offline. Re-run after article/assets edits.

## Source boundaries

All source paths below are relative to `/Users/bytedance/workspace/chunk_schedule/`, read-only.

| Claim | Source |
|---|---|
| Historical observe → reconcile → decide → install → admit, frozen grants, completion debt and residents | `reviews/alpha-seed-xgpt-upstream-review-20260918.md`; reviewed historical pins 94f740a / efef807, not latest master compatibility |
| Latest Phase 1 scope is communication + observation only | `dss-trial-validation/PHASE1-ACCEPTANCE.md` (2026-09-23); allocation/reservation/application explicitly deferred |
| Reclaim partial implementation | `dss-phase2/review/reclaim-04/README.md`, b1e79f8205fcce70c764f36ce6ba0ff3e6997f20 |
| Safety predicate precedes LRU preference; fallback remains possible | `dss-phase2/llmserver/bytedkvcache/manager/replacement_policy.py`, `LRUCache.popitem_matching` |
| GPU write-back and ordinary Host restrictions | `dss-phase2/llmserver/bytedkvcache/manager/kvcache_manager.py`, `install_reclaim_preferences`, `_maybe_demote_device_sessions` |
| Monotonic TTL, no same-version renewal, no execution authorization | `dss-phase2/llmserver/bytedkvcache/manager/reclaim_preferences.py`, `ReclaimPreferences.install/snapshot` |
| Request ordinal reservation | `dss-master-rework/alpha-seed/alpha_seed/workers/streaming_service/rollout_request_manager.py`, `reserve_request_index`; sibling `rollout_request_manager_proxy.py`, `_observe_request_index` |

The old `dss-phase1/CONTRACT.md` was inspected only as historical design. Its stronger completion definition is not used as current acceptance. The desired offload success path must not be confused with the current allocator's separate discard/recompute fallback after failed demotion. The article does not claim end-to-end safety validation of that implementation.

The dual-state section uses a two-dimension figure followed by a colored state-transition table explaining quota effects.

## Shared asset integration

Active article assets in `public/demos/chunk-scheduler-20260923/` (observed assets were copied byte-identically from task A; the communication and dual-state figures are maintained here):

- `dual-state/01-two-dimensions.svg`: active state-dimension figure; the former trajectory walkthrough is replaced by the state-transition table.
- `communication/01-proxy-loops.svg`, `02-two-handshakes.svg`, `03-engine-window.svg`: static sequence diagrams authored in the blog; regenerate with `python3 scripts/render-scheduler-sequences.py`. These replace the communication iframe in the article. The older `mechanism/communication.html` is retained as an unused historical export.
- `observations/phase1-vs-phase3.html`: byte-identical comparison export, common batches 4–21; cache in blocks, turn count/share controls, fixed 60-second fluctuation statistics.
- `observations/history-plan-runtime.html`: byte-identical offline export with #history / #plan / #runtime tabs. History is RM sampling, not a complete Mido trace.
- Both replace the old cache-timeline.html asset and article entry. Provenance and SHA-256 are in `docs/scheduler-trace-assets.json`. Historical integration notes below describe superseded exports.

Exact imported hashes are in `../work/chunk-scheduler-update/integration-manifest.json`. Source manifest lives in the interview workspace under `work/chunk-scheduler-update/assets/manifest.json`; the source task's `assets-handoff.md` records author sources and validation. No raw cache identities, logs or large original report copied.

The two observed windows come from different runs and must not be time-aligned. The four RM samples are not one atomic global snapshot. The self-contained draft export is also suitable as a local slides iframe; slides should consume task A's original individual diagrams for focused pages.

Validation: final `npm run build` passed, Astro check 78 files / 0 errors / 0 warnings / 0 hints. Existing duplicate `/tags/software-engineering` prerender warning remains. Three content visibility tests passed. Public route, homepage, RSS, sitemap and search were checked to exclude the draft. Browser review covered Astro article 4, draft HTML, embedded next checkpoint / projection switching, observed SVG rendering and narrow/desktop layouts. The standalone draft now includes five data-URL explanatory SVG images and one srcdoc iframe containing the interactive observed cache timeline.

A plain server of `dist/client` cannot serve the existing article 4 R2 demo routes (404); use Astro dev for that article. This is why the draft export and shared self-contained demos are the portable deliverables. No production deployment, authenticated draft-route end-to-end test, scheduler runtime test or throughput test was performed.

## Editorial revision after blog review — 2026-09-23

Blog is now the content authority. Article 4 defines trajectory, per-call request/Query, and reusable session cache. Article 5 distinguishes outcome buckets, progress buckets and resource state; adds the cumulative-supply/desired-demand buffer derivation, the 2:1 example, window quantiles, and the mapping to two-tier memory budgets. Article 3 corrects the variance-versus-buffer interpretation of 2cp(1-p).

Removed acceptance/progress reports and disclaimer-style copy from article bodies, embedded mechanism descriptions, plot captions and review export. Source/implementation evidence remains in this maintenance note and historical handoffs. Mechanism counters are explicitly valid-prefix blocks, with transfer reservation explained separately. Numerical behavior is unchanged. Updated portable assets and integration hashes; slides and resume retain their prior snapshots pending the next content sync.

Validation: Astro check/build passed (78 files, zero diagnostics; pre-existing duplicate tag route warning). DSL export checked 11 checkpoints; observed-data rebuilding checked 45 bucket totals and 60 pool counter identities. Verified the worked buffer arithmetic. The self-contained review exporter now renders KaTeX with embedded CSS/fonts; browser checked definitions, equations, example table and refreshed figure captions.

## Communication contract revision

Article 5 distinguishes three versions: original independent Proxy update/dispatch loops, the first deterministic controller with observation and installation handshakes, and the current Engine-initiated timestamp reorder queue with serial processing. Per user direction, communication is illustrated with three conventional static SVG sequence diagrams rather than a DSL demo.

Historical implementation evidence: `alpha-seed-scheduler-production-clean/alpha_seed/workers/rollout_proxy/strategies/chunk_distribution.py` (`dispatch`, `_observe_engine`, `_sync_engine_queries`), `chunk_distribution_runtime.py` (`apply_plan`, `admit_reserved`), and the review above. Current evidence: `dss-third-loop-review/alpha-seed/alpha_seed/workers/rollout_proxy/strategies/{timestamp_reorder,schedule_observation,engine_schedule_client}.py`. Diagrams show the actual message direction and processing boundary; the third diagram's response does not imply allocation has been implemented.

## Dual-state explanation revision

Replaced the embedded two-trajectory demo with two static figures: explicit execution/cache dimensions and a seven-stage walkthrough of one trajectory/session. The text distinguishes input readiness, usable GPU-prefix preparation, and execution admission; it explains valid-copy completion separately from destination capacity reservation. The figure reports active slots, and the prose records reserved slots in admission accounting. Run / Promote / Reclaim descriptions now connect each operation to its state dimension.

## Observed resource HTML integration

The final article section now consumes the existing `dss-cache-identity/review/platform-recovery/integrated-report/index.html` renderer, packaged with the full `timeline-data.json` and all 51 `detail-NNN.json` files by `scripts/import-scheduler-observation-html.py`. Exact source hashes and output hash are in `../work/chunk-scheduler-update/cache-timeline-provenance.json`. All plotted series are checked against the source slice. Task/cache/replica identities receive stable local aliases; time is relative; data and renderer are self-contained.

This replaces both historical static observations in the article. The new figure reports cache blocks grouped by request_index or weight version, rather than the old independent run's active RM request counts or physical in-use/parked totals. Article copy was rewritten to match that metric. The full history includes step_1 through step_22 and unknown-version records.

Latest-renderer correction: the first HTML import used the 12:28 step-history renderer. It is now replaced by the 2026-09-23 14:20 integrated-report renderer, including availability, coverage-aware gaps, pool capacity lines, pool utilization and per-row capacity ratios. The first corrected import retained 30 frames / 580 seconds; the subsequent full-history revision below supersedes that selection. Verified embedded GPU/Host pool summaries and incomplete-sample reporting.

## Full trace integration

The article now contains the complete available integrated report: 2026-09-23 02:20:38–10:58:59 +08:00, 31,101 seconds, 1,240 frames, 51 windows, 8 replicas, and step_1 through step_22. All numeric series, availability and capacity values are preserved without resampling. The importer checks that detail-window timestamps cover the aggregate timeline exactly once.

Aggregate data and each detail window are gzip/base64 embedded. Browser DecompressionStream loads the aggregate once and expands detail windows on demand through the existing three-window cache. Repeated full-history identity samples are reduced to each window's timestamps; labels use stable aliases across windows. No external detail fetch is needed. The resulting standalone HTML is about 5.4 MB. Source hashes cover the renderer, aggregate data and all 51 detail files.

Browser verification covered first, middle and last detail windows, Host/weight filtering and numeric time-range selection.
