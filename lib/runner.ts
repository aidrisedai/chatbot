// Runs the learner's code for real and captures its output.
// Python runs via Pyodide (loaded lazily from a CDN the first time);
// JavaScript runs in-page with a captured console.

export interface RunResult {
  output: string;
  error: string;
}

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

type Pyodide = {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
};

let pyodidePromise: Promise<Pyodide> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load the Python runtime (are you online?)."));
    document.head.appendChild(s);
  });
}

async function getPyodide(): Promise<Pyodide> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      const w = window as unknown as {
        loadPyodide?: (opts: { indexURL: string }) => Promise<Pyodide>;
      };
      if (!w.loadPyodide) {
        await loadScript(`${PYODIDE_BASE}pyodide.js`);
      }
      if (!w.loadPyodide) throw new Error("Python runtime unavailable.");
      return w.loadPyodide({ indexURL: PYODIDE_BASE });
    })();
  }
  return pyodidePromise;
}

export function canRun(language: string): boolean {
  const l = language.toLowerCase();
  return ["python", "py", "javascript", "js", "node"].includes(l);
}

export async function runCode(language: string, code: string): Promise<RunResult> {
  const l = language.toLowerCase();
  if (l === "javascript" || l === "js" || l === "node") return runJavaScript(code);
  if (l === "python" || l === "py") return runPython(code);
  return { output: "", error: `Can't run ${language} in the browser.` };
}

async function runPython(code: string): Promise<RunResult> {
  let out = "";
  try {
    const py = await getPyodide();
    py.setStdout({ batched: (s) => (out += s + "\n") });
    py.setStderr({ batched: (s) => (out += s + "\n") });
    await py.runPythonAsync(code);
    return { output: out.trimEnd(), error: "" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { output: out.trimEnd(), error: msg };
  }
}

function runJavaScript(code: string): RunResult {
  const logs: string[] = [];
  const fmt = (args: unknown[]) =>
    args
      .map((a) => {
        if (typeof a === "string") return a;
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      })
      .join(" ");
  const sandboxConsole = {
    log: (...a: unknown[]) => logs.push(fmt(a)),
    error: (...a: unknown[]) => logs.push(fmt(a)),
    warn: (...a: unknown[]) => logs.push(fmt(a)),
    info: (...a: unknown[]) => logs.push(fmt(a)),
  };
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("console", `"use strict";\n${code}`);
    fn(sandboxConsole);
    return { output: logs.join("\n"), error: "" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { output: logs.join("\n"), error: msg };
  }
}
