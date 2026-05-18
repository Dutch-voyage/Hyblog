import { describe, expect, it } from "vitest";
import {
  createRunTimeout,
  createCompileTimeout,
  defaultSandboxLimits,
  getCompilerFileName,
  getCompilerFlags,
  getTotalSourceBytes,
  getUtf8ByteLength,
  isSafeVirtualPath,
  normalizeIterations,
  truncateOutput,
  validateSandboxFiles,
} from "./wasmSandbox";

describe("wasm sandbox policy helpers", () => {
  it("measures UTF-8 byte length instead of character count", () => {
    expect(getUtf8ByteLength("abc")).toBe(3);
    expect(getUtf8ByteLength("编译")).toBe(6);
  });

  it("sums source file bytes", () => {
    expect(
      getTotalSourceBytes([
        { name: "a.c", content: "int main(){}" },
        { name: "b.c", content: "return 0;" },
      ]),
    ).toBe(21);
  });

  it("accepts safe relative virtual paths", () => {
    expect(isSafeVirtualPath("main.c")).toBe(true);
    expect(isSafeVirtualPath("src/demo/main.cpp")).toBe(true);
  });

  it("rejects unsafe virtual paths", () => {
    expect(isSafeVirtualPath("/etc/passwd")).toBe(false);
    expect(isSafeVirtualPath("../secret.txt")).toBe(false);
    expect(isSafeVirtualPath("src\\main.c")).toBe(false);
  });

  it("validates file count, path safety, and source size", () => {
    const result = validateSandboxFiles(
      [
        { name: "main.c", content: "a".repeat(11) },
        { name: "../secret.c", content: "x" },
      ],
      { ...defaultSandboxLimits, maxFiles: 1, maxSourceBytes: 10 },
    );

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([
      "Too many files. Maximum is 1.",
      "Unsafe virtual path: ../secret.c",
      "Source is too large. Maximum is 10 bytes.",
    ]);
  });

  it("requires at least one source file", () => {
    expect(validateSandboxFiles([]).errors).toContain("At least one source file is required.");
  });

  it("clamps iteration count", () => {
    expect(normalizeIterations(Number.NaN)).toBe(1);
    expect(normalizeIterations(-10)).toBe(1);
    expect(normalizeIterations(12.9)).toBe(12);
    expect(normalizeIterations(999, { ...defaultSandboxLimits, maxIterations: 100 })).toBe(100);
  });

  it("truncates oversized output", () => {
    const result = truncateOutput("abcdef", 3);

    expect(result.truncated).toBe(true);
    expect(result.output).toBe("abc\n[output truncated at 3 bytes]");
  });

  it("leaves small output untouched", () => {
    const result = truncateOutput("abc", 10);

    expect(result.truncated).toBe(false);
    expect(result.output).toBe("abc");
  });

  it("formats timeout errors", () => {
    expect(createRunTimeout(250)).toBe("Sandbox timed out after 250ms.");
  });

  it("formats compiler timeout errors", () => {
    expect(createCompileTimeout(1_000)).toBe("C/C++ compiler timed out after 1000ms.");
  });

  it("returns compiler file names by language", () => {
    expect(getCompilerFileName("c")).toBe("main.c");
    expect(getCompilerFileName("cpp")).toBe("main.cpp");
  });

  it("returns conservative compiler flags by language", () => {
    expect(getCompilerFlags("c")).toEqual(["-std=c17", "-O0"]);
    expect(getCompilerFlags("cpp")).toEqual(["-std=c++20", "-O0", "-fno-exceptions"]);
  });
});
