# Wasm C++ Compiler Spike Record

This document records the step from a precompiled WebAssembly runner to a real browser-side C/C++ compiler experiment.

## Scope

Completed in this iteration:

1. Installed `browsercc`.
2. Installed `@bjorn3/browser_wasi_shim`.
3. Added a C/C++ compiler worker.
4. Extended the Wasm sandbox page with a real C/C++ compile-and-run panel.
5. Added compiler helper tests for language-specific file names, flags, and compiler timeout formatting.

Not included:

1. No deployment header changes.
2. No WebAssembly threads.
3. No multi-file project editor.
4. No persistent compiler cache UI.
5. No public guarantee that large C++ projects will compile.

## Tool Choice

The compiler spike uses:

```text
browsercc
@bjorn3/browser_wasi_shim
```

`browsercc` exposes a simple API:

```ts
compile({
  source,
  fileName,
  flags,
})
```

It returns a `WebAssembly.Module` when compilation succeeds. The demo then executes that module through the browser WASI shim.

This was chosen over the Wasmer SDK path for this spike because it provides a direct C/C++ source-string compile API and a documented WASI execution example.

## Runtime Route

The runnable demo remains:

```text
/tools/wasm-sandbox/
```

The page now has two panels:

1. Precompiled Wasm runner.
2. C/C++ compiler experiment.

The C/C++ panel defaults to a small C++20 program:

```cpp
#include <iostream>
#include <string>

int main() {
  std::string name;
  std::cin >> name;
  std::cout << "Hello, " << name << " from browser C++!" << std::endl;
  return 0;
}
```

## Worker Architecture

Added:

```text
src/workers/cppCompiler.worker.ts
```

The worker:

1. Validates source size and virtual filename.
2. Loads compiler assets only after the user clicks the run button.
3. Compiles C or C++ source with conservative flags.
4. Runs the resulting WASI module.
5. Captures stdout and stderr.
6. Returns exit code, compile time, run time, and elapsed time.

### Asset Resolution Fix

The first browser run failed with:

```text
expected magic word 00 61 73 6d, found 3c 21 64 6f
```

`3c 21 64 6f` is the start of `<!do`, meaning the compiler tried to instantiate an HTML fallback page instead of a `.wasm` binary.

Cause:

1. `browsercc`'s generated Emscripten loader tried to resolve `clang.wasm` relative to the bundled worker URL.
2. That plain URL did not map to the emitted Vite/Astro asset.
3. The server returned HTML, which WebAssembly rejected.

Fix:

1. Added `src/lib/browserccLocal.ts`.
2. Imported `clang.wasm`, `lld.wasm`, and `sysroot.tar` through Vite `?url` asset imports.
3. Passed explicit `locateFile` handlers to Clang and LLD.
4. Kept the `browsercc` compile flow but made asset URLs bundler-aware.

Verified emitted assets:

```text
dist/_astro/clang-*.wasm
dist/_astro/lld-*.wasm
dist/_astro/sysroot-*.tar
dist/_astro/cppCompiler.worker-*.js
```

## Compiler Flags

Current flags:

```text
C:   -std=c17 -O0
C++: -std=c++20 -O0 -fno-exceptions
```

Exceptions are disabled because browser-side WASI C++ support is narrower than a native toolchain, and the initial demo should keep the supported surface small.

## Safety Properties

Current controls:

1. Explicit consent button before compiler assets are loaded.
2. Compiler runs in a worker.
3. Compiled program runs inside the same worker through a WASI shim.
4. Main thread can terminate the worker.
5. Source is size-limited by shared sandbox validation.
6. stdout/stderr are truncated by shared output limits.
7. The compiler run has a 60 second timeout from the page.

Important limitation:

Worker termination is the hard stop mechanism. A browser may still spend time terminating a worker under heavy compiler load.

## Package Size Warning

`browsercc` is large because it includes:

1. Clang WebAssembly binary.
2. LLD WebAssembly binary.
3. WASI sysroot.
4. C/C++ standard libraries.

This is acceptable for a lab route only if it remains lazy-loaded and clearly disclosed in the UI.

## Tests Updated

Updated:

```text
src/lib/wasmSandbox.ts
src/lib/wasmSandbox.test.ts
```

New helper coverage:

1. `createCompileTimeout()`
2. `getCompilerFileName()`
3. `getCompilerFlags()`

## Verification Commands

Run:

```bash
npm run test
npm run build
```

Expected:

1. Unit tests pass.
2. Astro build passes.
3. `/tools/wasm-sandbox/` is generated.
4. Compiler worker bundles successfully.

Additional package smoke test:

1. A Node-side smoke test used a small `file://` fetch shim because Node's built-in `fetch` does not read local package assets.
2. `browsercc` successfully compiled a C++20 program.
3. The generated WASI module ran through `@bjorn3/browser_wasi_shim`.
4. Output was:

```text
Hello, browsercc from smoke test!
```

This validates the selected compiler package and WASI runner path. Browser testing is still required because the actual UI runs inside a Web Worker and loads package assets through the browser.

## Next Tests Needed

Before considering this feature stable:

1. Manual browser test in Chrome.
2. Manual browser test in Safari.
3. Manual browser test in Firefox.
4. Compile-error UX test.
5. Timeout/stop-button test while compiler assets are loading.
6. Large source rejection test.
7. stdout truncation test using compiled code.
