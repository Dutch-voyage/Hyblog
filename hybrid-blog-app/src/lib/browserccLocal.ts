import { Clang, LLD, setUpSysroot, type CompilationJob, type CompilationResult } from "browsercc";
import clangWasmUrl from "../../node_modules/browsercc/dist/clang.wasm?url";
import lldWasmUrl from "../../node_modules/browsercc/dist/lld.wasm?url";
import sysrootUrl from "../../node_modules/browsercc/dist/sysroot.tar?url";

interface Invocation {
  compilerArgs: string[];
  compilerArtifact: string;
  linkerArgs: string[];
  linkerArtifact: string;
}

function getQuotedArgs(line: string) {
  return (line.match(/"([^"]*)"/g) ?? []).map((value) => value.slice(1, -1)).slice(1);
}

function getOutputFileName(args: string[]) {
  const outputFlagIndex = args.findIndex((arg) => arg === "-o");
  return args[outputFlagIndex + 1];
}

async function getCompilerInvocation(inputName: string, inputFile: string, flags: string[]) {
  let stderr = "";
  const clang = await Clang({
    thisProgram: "clang++",
    locateFile: (path: string) => (path === "clang.wasm" ? clangWasmUrl : path),
    printErr: (data: string) => {
      stderr += `${data}\n`;
    },
  });

  clang.FS.writeFile(inputName, inputFile);
  clang.FS.mkdirTree("/lib/wasm32-wasi");
  clang.FS.mkdirTree("/include/c++/v1");
  clang.FS.writeFile("/lib/wasm32-wasi/crt1-command.o", new Uint8Array(0));
  clang.FS.writeFile("/lib/wasm32-wasi/crt1-reactor.o", new Uint8Array(0));

  const exitCode = clang.callMain([inputName, ...flags, "-###"]);
  if (exitCode !== 0) {
    throw new Error(`Clang driver failed with code ${exitCode}:\n${stderr}`);
  }

  const lines = stderr.split("\n");
  const compilerArgs = getQuotedArgs(lines.find((line) => line.includes("-cc1")) ?? "");
  const linkerArgs = getQuotedArgs(lines.find((line) => line.includes("wasm-ld")) ?? "");

  return {
    compilerArgs,
    compilerArtifact: getOutputFileName(compilerArgs),
    linkerArgs,
    linkerArtifact: getOutputFileName(linkerArgs),
  } satisfies Invocation;
}

export async function compileWithLocalBrowserccAssets({
  source,
  fileName,
  flags,
  extraFiles,
}: CompilationJob): Promise<CompilationResult> {
  let stderr = "";
  const clangPromise = Clang({
    thisProgram: "clang++",
    locateFile: (path: string) => (path === "clang.wasm" ? clangWasmUrl : path),
    printErr: (data: string) => {
      stderr += `${data}\n`;
    },
  });
  const lldPromise = LLD({
    thisProgram: "wasm-ld",
    locateFile: (path: string) => (path === "lld.wasm" ? lldWasmUrl : path),
    printErr: (data: string) => {
      stderr += `${data}\n`;
    },
  });

  const sysroot = await (await fetch(sysrootUrl)).arrayBuffer();
  const invocation = await getCompilerInvocation(fileName, source, flags);
  const clang = await clangPromise;

  clang.FS.writeFile(fileName, source);
  setUpSysroot(clang, sysroot, extraFiles);

  let exitCode = clang.callMain(invocation.compilerArgs);
  if (exitCode !== 0) {
    return { compileOutput: stderr, module: null };
  }

  const binary = clang.FS.readFile(invocation.compilerArtifact, { encoding: "binary" });
  const lld = await lldPromise;

  lld.FS.writeFile(invocation.compilerArtifact, binary);
  setUpSysroot(lld, sysroot, extraFiles);

  exitCode = lld.callMain(invocation.linkerArgs);
  if (exitCode !== 0) {
    return { compileOutput: stderr, module: null };
  }

  const output = lld.FS.readFile(invocation.linkerArtifact, { encoding: "binary" });
  return {
    compileOutput: stderr,
    module: await WebAssembly.compile(output),
  };
}
