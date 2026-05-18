# WebAssembly User-Compute Sandbox Requirements

This document investigates whether Hybrid Blog can use WebAssembly to borrow a visitor's local compute resources for sandboxed tasks such as C/C++ compilation. It is a requirements and test-design document only. No integration is implemented in this step.

## Short Answer

Yes, it is technically possible to run a browser-side WebAssembly sandbox that compiles small C/C++ programs using the user's CPU. The practical version should be opt-in, isolated in Web Workers, aggressively resource-limited, and introduced as an experimental lab feature rather than core blog functionality.

The recommended path is staged:

1. MVP: run precompiled WebAssembly tasks in a browser worker.
2. Phase 2: compile tiny C/C++ examples in the browser using a Wasm-hosted Clang toolchain.
3. Phase 3: support cached toolchains, multiple files, and optional draft/demo embedding.

Do not start with a full online IDE or general-purpose untrusted compute platform.

## Product Goals

The feature should let a reader explicitly donate local compute for bounded tasks, for example:

1. Compile a small C or C++ snippet to WebAssembly.
2. Run the compiled WebAssembly module in a second sandbox.
3. View stdout, stderr, exit code, compile time, and runtime.
4. Learn how WebAssembly sandboxing works through a blog demo.

The feature should not silently use user compute. It must require clear consent and provide a stop button.

## Non-Goals

This feature should not attempt to provide:

1. A production-grade cloud build service.
2. Arbitrary native binary execution.
3. Long-running distributed compute.
4. Background mining or hidden compute.
5. Access to local files outside explicit browser file picker input.
6. Network access from compiled guest programs.
7. Full POSIX compatibility.
8. Public API stability in the first implementation.

## Tooling Options

### Option A: Wasmer JS SDK + Clang Package

Wasmer has demonstrated running Clang in the browser through the Wasmer JS SDK. The example downloads a Clang package and compiles C programs to Wasm/WASI-like output.

Pros:

1. Most direct evidence that Clang can run in Chrome, Firefox, and Safari.
2. Provides a JavaScript SDK and a browser example.
3. Can mount a virtual project directory and retrieve the produced `.wasm`.

Cons:

1. Toolchain size is large. The Wasmer article notes about 100 MB uncompressed and an intended compressed size closer to 30 MB.
2. Runtime/package model is Wasmer/WASIX-specific.
3. The dependency surface is larger than a tiny custom runner.
4. Browser use should be treated as experimental until tested in this project.

Best use:

Use as the first C/C++ compilation prototype if the goal is to validate "compile in browser" quickly.

### Option B: browsercc

`browsercc` is a newer project that packages Clang/LLVM, linker, and standard libraries for browser-side C/C++ to WebAssembly compilation.

Pros:

1. Directly targets browser-side C/C++ compilation.
2. Produces WASI-style output.
3. Reported package shape is smaller than the 100 MB uncompressed Wasmer Clang package, though still large.

Cons:

1. Young project with low adoption signal.
2. Needs careful review before depending on it.
3. May have limitations around C++ exceptions, threading, and standard library coverage.

Best use:

Evaluate as a lighter prototype after proving the UX with a known working path.

### Option C: Emscripten Toolchain in Browser

Emscripten provides mature C/C++ to WebAssembly tooling and virtual filesystem support. It also supports Web Workers and Wasm Workers for threading when browser requirements are met.

Pros:

1. Mature ecosystem.
2. Rich filesystem model, including in-memory and persistent browser storage options.
3. Strong documentation for worker and filesystem behavior.

Cons:

1. Running the full compiler toolchain in the browser is heavy.
2. Emscripten is better known as a developer-side build tool than a browser-embedded compiler.
3. Threading requires `SharedArrayBuffer`, which requires cross-origin isolation.

Best use:

Use Emscripten concepts and runtime pieces, but avoid embedding a full Emscripten compiler toolchain until there is a clear reason.

### Option D: WASI SDK

WASI SDK is the official WASI-enabled C/C++ toolchain.

Pros:

1. Official WASI-oriented Clang/LLVM distribution.
2. Good reference for the target ABI and expected compiler flags.
3. Useful for server-side or local reproducible compilation.

Cons:

1. Not itself a browser product.
2. Needs additional packaging to run the compiler inside the browser.

Best use:

Use as the target model and local reference toolchain, not the first browser integration.

## Recommended Architecture

### Browser Components

Use a three-part architecture:

1. UI thread: consent, editor, progress, logs, stop button, results.
2. Compiler worker: loads the compiler toolchain and compiles source into a `.wasm` artifact.
3. Runner worker: executes the produced `.wasm` with a minimal host capability interface.

The compiler and runner should be separate workers. If compiled code hangs, terminate only the runner worker. If compilation hangs, terminate only the compiler worker.

### Capability Model

The guest program should receive only explicit capabilities:

1. In-memory files for submitted source and generated outputs.
2. Stdout and stderr capture.
3. A fixed wall-clock timeout.
4. A fixed maximum memory budget where supported.
5. No DOM access.
6. No direct network access.
7. No ambient local filesystem access.

Do not expose `fetch`, `localStorage`, cookies, secrets, or arbitrary host callbacks to guest code.

### Filesystem Model

Use an in-memory virtual filesystem for MVP.

Optional later:

1. Cache compiler assets through Cache Storage.
2. Store toolchain and standard library assets in IndexedDB or OPFS.
3. Allow explicit file uploads through the browser File API.

Do not automatically read local files.

### Execution Flow

1. User opens a sandbox page.
2. Page explains CPU, memory, battery, and privacy implications.
3. User explicitly clicks "Start local sandbox".
4. UI loads a compiler worker.
5. Worker downloads or retrieves cached toolchain assets.
6. User submits source.
7. Compiler worker writes source into virtual FS.
8. Compiler worker invokes Clang.
9. Compiler returns either errors or a `.wasm` artifact.
10. Runner worker executes the artifact with a timeout.
11. UI displays stdout, stderr, exit code, timing, and resource summary.

## Browser Requirements

### Required for MVP

1. WebAssembly.
2. Web Workers.
3. ES modules.
4. Fetch and streaming asset loading.
5. Blob URLs or module workers for local worker creation.
6. Abort/terminate behavior through worker termination.

### Required for Cached Toolchains

1. Cache Storage and/or IndexedDB.
2. Storage quota checks.
3. Cache versioning.
4. Clear-cache UI.

### Required for Threads

If the compiler or guest execution uses WebAssembly threads:

1. `SharedArrayBuffer`.
2. Cross-origin isolation.
3. HTTP headers:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Cross-origin isolation has compatibility costs. It can affect cross-origin popups, OAuth, embedded resources, and third-party scripts. The first implementation should avoid requiring threads.

## Security Requirements

### User Consent

The feature must show:

1. It will use local CPU and memory.
2. Large compiler assets may be downloaded.
3. Battery usage may increase.
4. The computation runs locally in the browser.
5. The user can stop the task.

No sandbox work should start automatically on page load.

### Resource Limits

MVP limits:

1. Source size limit, for example 64 KB.
2. File count limit, for example 8 files.
3. Compile timeout, for example 10 seconds for MVP.
4. Run timeout, for example 2 seconds for compiled output.
5. Stdout/stderr output cap, for example 64 KB each.
6. Maximum compiler worker lifetime.

If a timeout is hit, terminate the worker and report the reason.

### Isolation

1. Run compilation in a worker.
2. Run compiled output in a separate worker.
3. Never expose DOM APIs to worker guest code.
4. Keep host imports minimal and audited.
5. Treat the compiler toolchain itself as a supply-chain dependency.
6. Pin versions and hashes for downloaded compiler assets.

### Privacy

1. Source code should stay local by default.
2. Do not upload source code unless the user explicitly asks to share it.
3. Do not log code snippets to analytics.
4. Do not persist source code unless the user chooses to save it.

### Abuse Prevention

Because this borrows user compute, the UI must prevent hidden or repeated compute:

1. No autoplay computation.
2. One active task per tab.
3. Visible progress and stop button.
4. Clear idle state when the worker is not running.
5. No background retry loop.

## Performance Requirements

### Bundle Strategy

Do not bundle the compiler into the main blog JavaScript.

Use lazy loading:

1. The sandbox page loads normally.
2. The compiler downloads only after user consent.
3. Heavy toolchain assets are versioned and cached.

### Expected Cost

Expect a large first-use download:

1. Wasmer Clang path: roughly tens of MB compressed, around 100 MB uncompressed according to Wasmer's post.
2. browsercc path: still large because it includes compiler, linker, and libraries.

The UI should show download size and cache status.

### Progressive Enhancement

If the compiler cannot load:

1. Show a static explanation.
2. Offer a precompiled demo.
3. Do not break the rest of the blog.

## Integration Requirements For Hybrid Blog

The feature should live under a lab-style route, for example:

```text
/tools/wasm-sandbox/
```

or:

```text
/demos/wasm-cpp-compiler/
```

Recommended first integration:

1. Add a static explanatory page.
2. Add a small client-side component loaded only on that page.
3. Add a worker-based precompiled Wasm runner.
4. Add compiler support only after runner tests pass.

Do not add this to the homepage or editor workflow until it is stable.

## Proposed Implementation Phases

### Phase 0: Research And Spike

Deliverables:

1. This requirements document.
2. A local-only spike outside public navigation.
3. A decision between Wasmer JS SDK and browsercc for the first compiler prototype.

Exit criteria:

1. Can compile "hello world" C code in a worker.
2. Can run the output in a separate worker.
3. Can terminate runaway code.
4. Can keep source local.

### Phase 1: Precompiled Wasm Runner

Deliverables:

1. Worker runner.
2. Minimal host imports.
3. Timeout handling.
4. stdout/stderr capture.
5. UI with consent and stop controls.

Exit criteria:

1. Precompiled test module runs.
2. Infinite-loop module is terminated.
3. Memory-heavy module fails safely.

### Phase 2: Tiny C/C++ Compilation

Deliverables:

1. Compiler worker.
2. Toolchain lazy load.
3. Virtual project directory.
4. Compile result display.
5. Runner handoff.

Exit criteria:

1. Compile and run C hello world.
2. Compile error is displayed cleanly.
3. C++ standard library smoke test works or documented as unsupported.
4. Toolchain cache can be cleared.

### Phase 3: Blog Demo Integration

Deliverables:

1. Public demo page.
2. Documentation post.
3. Test matrix result.
4. Version-pinned toolchain.

Exit criteria:

1. Works on current Chrome.
2. Works or degrades gracefully on Safari and Firefox.
3. Does not affect normal blog build or page load.

## Test Design

### Unit Tests

Use Vitest or an equivalent test runner for pure helpers:

1. Source-size validation.
2. File-count validation.
3. Compiler argument construction.
4. Timeout configuration.
5. Output truncation.
6. Error serialization.
7. Toolchain cache key generation.

### Worker Integration Tests

Use Playwright for browser behavior:

1. Worker starts only after consent.
2. Stop button terminates the worker.
3. Progress events appear in order.
4. stdout and stderr are displayed separately.
5. Compile errors do not crash the page.
6. Multiple rapid starts do not spawn unbounded workers.

### Sandbox Security Tests

Prepare malicious or adversarial inputs:

1. Infinite loop.
2. Very deep recursion.
3. Huge memory allocation.
4. Very large stdout.
5. Invalid Wasm artifact.
6. Attempted filesystem path traversal.
7. Attempted network import.
8. Source file above size limit.
9. Many tiny files above file-count limit.

Expected behavior:

1. Worker terminates or returns a controlled error.
2. UI remains responsive.
3. No data leaves the browser.
4. No draft/blog content is modified.

### Compiler Smoke Tests

Minimum examples:

1. C hello world.
2. C compile error.
3. C program using `argc` and `argv`.
4. C program writing stderr.
5. Small C++ program using `std::string`.
6. Small C++ program using `std::vector`.
7. Unsupported feature test, such as threading or exceptions, depending on selected toolchain.

### Performance Tests

Measure:

1. Toolchain download size.
2. Toolchain initialization time.
3. Compile time for hello world.
4. Compile time for a medium snippet.
5. Peak memory where measurable.
6. Cache hit startup time.
7. Worker termination latency.

Suggested budgets for first public demo:

1. First load under 60 seconds on a typical laptop connection.
2. Cached startup under 5 seconds.
3. Hello world compile under 10 seconds.
4. Runner timeout under 2 seconds for runaway output.

### Compatibility Tests

Manual browser matrix:

1. Chrome stable.
2. Safari stable.
3. Firefox stable.
4. Mobile Safari as graceful-degradation target.
5. Android Chrome as optional.

Record:

1. Does WebAssembly load?
2. Do module workers work?
3. Does the compiler toolchain load?
4. Does the browser kill the worker under memory pressure?
5. Is cross-origin isolation required?

## Acceptance Criteria Before Blog Integration

Do not integrate into public navigation until:

1. The user must click a consent button before compute starts.
2. A stop button reliably terminates the active worker.
3. Normal blog build is unaffected.
4. Toolchain code is lazy-loaded.
5. Version and source of compiler assets are documented.
6. Security tests pass.
7. Browser compatibility is documented.
8. There is a clear warning for CPU, battery, memory, and download size.

## Recommended First Technical Spike

Create a local branch or hidden route that does:

1. Run a precompiled Wasm module in a worker.
2. Display stdout and timing.
3. Terminate an infinite loop module.
4. Then evaluate Wasmer JS SDK Clang with a single `hello.c`.

Do not begin with a polished UI. Prove resource control first.

## Open Questions

1. Should the first compiler prototype use Wasmer JS SDK or browsercc?
2. Is C enough for the first demo, or is C++ required from the beginning?
3. Should compiler assets be hosted with the blog or pulled from a package CDN?
4. Will the eventual deployment platform support COOP/COEP headers if threads become necessary?
5. Should the sandbox page be excluded from normal sitemap/RSS until stable?
6. Should generated artifacts be downloadable, or only displayed in the page?

## Current Recommendation

Proceed, but cautiously.

The safest next step is a precompiled WebAssembly runner test inside a worker. After that passes, try a browser-side Clang spike using Wasmer JS SDK because it has a documented browser example and working C compilation path. Evaluate browsercc as a lighter alternative before committing to any dependency.

Keep this feature experimental, opt-in, and isolated from the main blog/editor workflow.
