# Wasm Sandbox Unit Tests And Demo Record

This document records the first implementation step after `wasm_user_compute_sandbox_requirements.md`.

## Scope

Completed in this iteration:

1. Added unit-tested sandbox policy helpers.
2. Added a runnable browser demo.
3. Kept the demo limited to a precompiled WebAssembly module.
4. Deferred browser-side C/C++ compilation until the runner and resource controls are proven.

Not included:

1. No Clang or C++ compiler integration yet.
2. No heavy toolchain downloads.
3. No WebAssembly threads.
4. No deployment header changes.
5. No hidden or automatic compute.

## Unit Tests

Added:

```text
src/lib/wasmDemoModule.ts
src/lib/wasmDemoModule.test.ts
src/lib/wasmSandbox.ts
src/lib/wasmSandbox.test.ts
```

The helper module covers:

1. UTF-8 source byte counting.
2. Total source size calculation.
3. Safe virtual path validation.
4. Source file validation.
5. Iteration clamping.
6. Output truncation.
7. Timeout message formatting.
8. Demo WebAssembly module instantiation.
9. The exported `answer()` function returning `42`.

The test suite uses Vitest.

New script:

```json
"test": "vitest run"
```

## Runnable Demo

Added:

```text
src/workers/wasmRunner.worker.ts
src/pages/tools/wasm-sandbox/index.astro
```

The demo route is:

```text
/tools/wasm-sandbox/
```

The demo:

1. Requires the user to click an explicit consent/run button.
2. Starts a Web Worker.
3. Instantiates a tiny precompiled WebAssembly module.
4. Calls the exported `answer()` function repeatedly.
5. Displays stdout-like results, elapsed time, iterations, and checksum.
6. Provides a stop button.
7. Terminates the worker on timeout.

The precompiled module is intentionally tiny. It exports:

```text
answer() -> 42
```

This proves worker isolation and local compute flow before adding a browser-hosted compiler.

## Navigation

Updated:

```text
src/site.config.json
```

Added `工具` pointing to:

```text
/tools/wasm-sandbox/
```

## Safety Notes

Current safety properties:

1. No computation starts on page load.
2. Compute runs in a worker, not on the main UI thread.
3. The worker has no DOM access.
4. The demo exposes no local filesystem capability.
5. The demo exposes no network capability to guest Wasm.
6. The main thread can terminate the worker.
7. The run timeout is centralized in sandbox limits.

Known limitations:

1. Worker termination is coarse-grained; the worker cannot gracefully stop while inside a tight synchronous loop.
2. Browser-specific worker termination latency is not yet measured.
3. This does not yet validate a compiler toolchain.
4. This does not yet run C/C++ source code.

## Verification Commands

Run:

```bash
npm run test
npm run build
```

Expected:

1. Unit tests pass.
2. Astro check passes with 0 errors, 0 warnings, and 0 hints.
3. Static build includes `/tools/wasm-sandbox/`.

## Next Step

After this demo is stable, the next technical spike should compare:

1. Wasmer JS SDK Clang.
2. `browsercc`.

The first compiler spike should compile and run only a small C `hello world` program before attempting C++.
