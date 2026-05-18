import { instantiateAnswerModule } from "../lib/wasmDemoModule";
import { normalizeIterations, truncateOutput } from "../lib/wasmSandbox";

interface RunMessage {
  type: "run";
  iterations: number;
}

self.addEventListener("message", async (event: MessageEvent<RunMessage>) => {
  if (event.data.type !== "run") return;

  const startedAt = performance.now();
  const iterations = normalizeIterations(event.data.iterations);

  try {
    self.postMessage({ type: "progress", message: "Instantiating WebAssembly module..." });

    const answer = await instantiateAnswerModule();

    self.postMessage({ type: "progress", message: `Running ${iterations.toLocaleString()} call(s)...` });

    let checksum = 0;
    for (let index = 0; index < iterations; index += 1) {
      checksum += answer() as number;
    }

    const elapsedMs = performance.now() - startedAt;
    const { output, truncated } = truncateOutput(
      [
        "WebAssembly module executed successfully.",
        `answer() returned: ${answer()}`,
        `iterations: ${iterations}`,
        `checksum: ${checksum}`,
        `elapsedMs: ${elapsedMs.toFixed(2)}`,
      ].join("\n"),
    );

    self.postMessage({
      type: "result",
      stdout: output,
      stderr: "",
      truncated,
      elapsedMs,
    });
  } catch (error) {
    const elapsedMs = performance.now() - startedAt;
    self.postMessage({
      type: "error",
      stderr: error instanceof Error ? error.message : String(error),
      elapsedMs,
    });
  }
});
