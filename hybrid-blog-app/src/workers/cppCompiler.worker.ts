import { ConsoleStdout, File, OpenFile, WASI, WASIProcExit } from "@bjorn3/browser_wasi_shim";
import { compileWithLocalBrowserccAssets } from "../lib/browserccLocal";
import {
  type CompilerLanguage,
  defaultSandboxLimits,
  getCompilerFileName,
  getCompilerFlags,
  truncateOutput,
  validateSandboxFiles,
} from "../lib/wasmSandbox";

interface CompileRunMessage {
  type: "compile-run";
  language: CompilerLanguage;
  source: string;
  stdin: string;
}

function appendDecodedOutput(current: string, data: Uint8Array) {
  return current + new TextDecoder().decode(data);
}

self.addEventListener("message", async (event: MessageEvent<CompileRunMessage>) => {
  if (event.data.type !== "compile-run") return;

  const startedAt = performance.now();
  const { language, source, stdin } = event.data;
  const fileName = getCompilerFileName(language);
  const validation = validateSandboxFiles([{ name: fileName, content: source }]);

  if (!validation.ok) {
    self.postMessage({
      type: "error",
      phase: "validation",
      stderr: validation.errors.join("\n"),
      elapsedMs: performance.now() - startedAt,
    });
    return;
  }

  try {
    self.postMessage({
      type: "progress",
      message: "Loading browser C/C++ compiler assets. First run can be large and slow...",
    });

    const compileStartedAt = performance.now();
    const { module, compileOutput } = await compileWithLocalBrowserccAssets({
      source,
      fileName,
      flags: getCompilerFlags(language),
    });
    const compileMs = performance.now() - compileStartedAt;

    if (!module) {
      self.postMessage({
        type: "compile-error",
        compileOutput: truncateOutput(compileOutput).output,
        elapsedMs: performance.now() - startedAt,
        compileMs,
      });
      return;
    }

    self.postMessage({ type: "progress", message: "Compilation succeeded. Running WASI module..." });

    let stdout = "";
    let stderr = "";
    const stdinBytes = new TextEncoder().encode(stdin);
    const fds = [
      new OpenFile(new File(stdinBytes)),
      new ConsoleStdout((data: Uint8Array) => {
        stdout = appendDecodedOutput(stdout, data);
      }),
      new ConsoleStdout((data: Uint8Array) => {
        stderr = appendDecodedOutput(stderr, data);
      }),
    ];

    const runStartedAt = performance.now();
    const wasi = new WASI([fileName], [], fds);
    const instance = await WebAssembly.instantiate(module, {
      wasi_snapshot_preview1: wasi.wasiImport,
    });

    let exitCode = 0;
    try {
      exitCode = wasi.start(instance as WebAssembly.Instance & {
        exports: { memory: WebAssembly.Memory; _start: () => unknown };
      });
    } catch (error) {
      if (error instanceof WASIProcExit) {
        exitCode = error.code;
      } else {
        throw error;
      }
    }

    const runMs = performance.now() - runStartedAt;
    const stdoutResult = truncateOutput(stdout, defaultSandboxLimits.maxOutputBytes);
    const stderrResult = truncateOutput(stderr, defaultSandboxLimits.maxOutputBytes);

    self.postMessage({
      type: "result",
      stdout: stdoutResult.output,
      stderr: stderrResult.output,
      truncated: stdoutResult.truncated || stderrResult.truncated,
      exitCode,
      elapsedMs: performance.now() - startedAt,
      compileMs,
      runMs,
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      phase: "runtime",
      stderr: error instanceof Error ? error.message : String(error),
      elapsedMs: performance.now() - startedAt,
    });
  }
});
