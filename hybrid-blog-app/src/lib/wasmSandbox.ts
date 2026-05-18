export interface SandboxLimits {
  maxSourceBytes: number;
  maxFiles: number;
  maxOutputBytes: number;
  runTimeoutMs: number;
  maxIterations: number;
}

export interface SandboxSourceFile {
  name: string;
  content: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export type CompilerLanguage = "c" | "cpp";

export const defaultSandboxLimits: SandboxLimits = {
  maxSourceBytes: 64 * 1024,
  maxFiles: 8,
  maxOutputBytes: 64 * 1024,
  runTimeoutMs: 2_000,
  maxIterations: 5_000_000,
};

export const compilerTimeoutMs = 60_000;

export function getUtf8ByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

export function getTotalSourceBytes(files: SandboxSourceFile[]) {
  return files.reduce((total, file) => total + getUtf8ByteLength(file.content), 0);
}

export function isSafeVirtualPath(path: string) {
  if (!path || path.length > 120) return false;
  if (path.startsWith("/") || path.includes("\\") || path.includes("..")) return false;
  return /^[a-zA-Z0-9._/-]+$/.test(path);
}

export function normalizeIterations(value: number, limits: SandboxLimits = defaultSandboxLimits) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(Math.floor(value), 1), limits.maxIterations);
}

export function validateSandboxFiles(
  files: SandboxSourceFile[],
  limits: SandboxLimits = defaultSandboxLimits,
): ValidationResult {
  const errors: string[] = [];

  if (files.length === 0) {
    errors.push("At least one source file is required.");
  }

  if (files.length > limits.maxFiles) {
    errors.push(`Too many files. Maximum is ${limits.maxFiles}.`);
  }

  for (const file of files) {
    if (!isSafeVirtualPath(file.name)) {
      errors.push(`Unsafe virtual path: ${file.name}`);
    }
  }

  const totalBytes = getTotalSourceBytes(files);
  if (totalBytes > limits.maxSourceBytes) {
    errors.push(`Source is too large. Maximum is ${limits.maxSourceBytes} bytes.`);
  }

  return { ok: errors.length === 0, errors };
}

export function truncateOutput(output: string, limit = defaultSandboxLimits.maxOutputBytes) {
  const encoded = new TextEncoder().encode(output);
  if (encoded.byteLength <= limit) {
    return { output, truncated: false };
  }

  const truncated = new TextDecoder().decode(encoded.slice(0, limit));
  return {
    output: `${truncated}\n[output truncated at ${limit} bytes]`,
    truncated: true,
  };
}

export function createRunTimeout(runTimeoutMs = defaultSandboxLimits.runTimeoutMs) {
  return `Sandbox timed out after ${runTimeoutMs}ms.`;
}

export function createCompileTimeout(timeoutMs = compilerTimeoutMs) {
  return `C/C++ compiler timed out after ${timeoutMs}ms.`;
}

export function getCompilerFileName(language: CompilerLanguage) {
  return language === "cpp" ? "main.cpp" : "main.c";
}

export function getCompilerFlags(language: CompilerLanguage) {
  return language === "cpp" ? ["-std=c++20", "-O0", "-fno-exceptions"] : ["-std=c17", "-O0"];
}
