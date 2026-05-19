export interface EditorGitHubConfig {
  clientId: string;
  clientSecret: string;
  owner: string;
  repo: string;
  baseBranch: string;
  callbackUrl?: string;
}

function readEnv(name: string) {
  return import.meta.env[name] ?? process.env[name];
}

function requiredEnv(name: string) {
  const value = readEnv(name);
  if (!value) throw new Error(`${name} is required for the editor GitHub integration.`);
  return value;
}

export function getEditorGitHubConfig(): EditorGitHubConfig {
  return {
    clientId: requiredEnv("GITHUB_CLIENT_ID"),
    clientSecret: requiredEnv("GITHUB_CLIENT_SECRET"),
    owner: readEnv("GITHUB_REPO_OWNER") ?? "Dutch-voyage",
    repo: readEnv("GITHUB_REPO_NAME") ?? "Hyblog",
    baseBranch: readEnv("GITHUB_BASE_BRANCH") ?? "main",
    callbackUrl: readEnv("GITHUB_CALLBACK_URL"),
  };
}

export function getEditorEnvironmentStatus() {
  const required = ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "SESSION_SECRET"] as const;
  const missing = required.filter((name) => !readEnv(name));
  const sessionSecret = readEnv("SESSION_SECRET");

  if (sessionSecret && sessionSecret.length < 32) {
    missing.push("SESSION_SECRET");
  }

  return {
    configured: missing.length === 0,
    missing,
  };
}

export function getEditorRepositoryConfig() {
  return {
    owner: readEnv("GITHUB_REPO_OWNER") ?? "Dutch-voyage",
    repo: readEnv("GITHUB_REPO_NAME") ?? "Hyblog",
    baseBranch: readEnv("GITHUB_BASE_BRANCH") ?? "main",
  };
}
