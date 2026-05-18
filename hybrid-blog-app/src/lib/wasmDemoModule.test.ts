import { describe, expect, it } from "vitest";
import { instantiateAnswerModule } from "./wasmDemoModule";

describe("demo WebAssembly module", () => {
  it("instantiates and exports answer() -> 42", async () => {
    const answer = await instantiateAnswerModule();

    expect(answer()).toBe(42);
  });
});
