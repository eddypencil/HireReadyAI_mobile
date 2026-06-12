const WANDBOX_API = "https://wandbox.org/api/compile.json";

export const WANDBOX_LANGUAGES = {
  python: { compiler: "cpython-3.14.0", language: "Python", monacoLang: "python" },
  javascript: { compiler: "nodejs-20.17.0", language: "JavaScript", monacoLang: "javascript" },
  typescript: { compiler: "typescript-5.6.2", language: "TypeScript", monacoLang: "typescript" },
  cpp: { compiler: "gcc-13.2.0", language: "C++", monacoLang: "cpp" },
  c: { compiler: "gcc-13.2.0-c", language: "C", monacoLang: "c" },
  java: { compiler: "openjdk-jdk-22+36", language: "Java", monacoLang: "java" },
  rust: { compiler: "rust-1.82.0", language: "Rust", monacoLang: "rust" },
  go: { compiler: "go-1.23.2", language: "Go", monacoLang: "go" },
  csharp: { compiler: "dotnetcore-8.0.402", language: "C#", monacoLang: "csharp" },
  ruby: { compiler: "ruby-3.4.9", language: "Ruby", monacoLang: "ruby" },
  php: { compiler: "php-8.3.12", language: "PHP", monacoLang: "php" },
  swift: { compiler: "swift-6.0.1", language: "Swift", monacoLang: "swift" },
  kotlin: { compiler: "scala-3.5.1", language: "Scala", monacoLang: "scala" },
  r: { compiler: "r-4.4.1", language: "R", monacoLang: "r" },
  bash: { compiler: "bash", language: "Bash script", monacoLang: "shell" },
  sql: { compiler: "sqlite-3.46.1", language: "SQL", monacoLang: "sql" },
  lua: { compiler: "lua-5.4.7", language: "Lua", monacoLang: "lua" },
  julia: { compiler: "julia-1.10.5", language: "Julia", monacoLang: "julia" },
  default: { compiler: "nodejs-20.17.0", language: "JavaScript", monacoLang: "javascript" },
};

export async function executeCode(code, language) {
  const langKey = language?.toLowerCase() || "default";
  const runtime = WANDBOX_LANGUAGES[langKey] || WANDBOX_LANGUAGES.default;

  try {
    const startTime = Date.now();
    const res = await fetch(WANDBOX_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ compiler: runtime.compiler, code, save: false }),
    });

    const executionTimeMs = Date.now() - startTime;

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Wandbox API error (${res.status}): ${err}` };
    }

    const data = await res.json();

    return {
      success: data.status === "0",
      stdout: data.program_message || "",
      stderr: data.program_error || data.compiler_error || "",
      output: (data.program_message || "") + (data.program_error || ""),
      executionTime: executionTimeMs,
      memoryUsage: null,
      exitCode: data.status === "0" ? 0 : 1,
      signal: data.signal || null,
      error: data.compiler_error || data.program_error || null,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message ?? "Failed to execute code via Wandbox API",
    };
  }
}
