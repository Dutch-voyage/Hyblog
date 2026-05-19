import type { EditorGitHubConfig } from "./config";

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url?: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  fork?: boolean;
  default_branch?: string;
  html_url?: string;
  permissions?: {
    admin?: boolean;
    push?: boolean;
    pull?: boolean;
  };
}

export interface GitHubContentFile {
  content: string;
  encoding: string;
  name: string;
  path: string;
  sha: string;
  type: "file";
}

export interface GitHubPullRequest {
  html_url: string;
  number: number;
  state: string;
}

export interface GitHubApiErrorBody {
  message?: string;
  documentation_url?: string;
}

export class GitHubApiError extends Error {
  status: number;
  body: GitHubApiErrorBody | null;

  constructor(status: number, message: string, body: GitHubApiErrorBody | null = null) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
    this.body = body;
  }
}

export type GitHubFetch = typeof fetch;

function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function encodeRefPath(ref: string) {
  return encodeURI(ref);
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function githubJson<T>(
  token: string,
  path: string,
  init: RequestInit = {},
  fetchImpl: GitHubFetch = fetch,
) {
  const response = await fetchImpl(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
      ...(init.headers ?? {}),
    },
  });
  const body = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof body === "object" && body && "message" in body
        ? String((body as GitHubApiErrorBody).message)
        : `GitHub API request failed with ${response.status}`;
    throw new GitHubApiError(response.status, message, body as GitHubApiErrorBody | null);
  }

  return body as T;
}

export async function exchangeOAuthCode(input: {
  clientId: string;
  clientSecret: string;
  code: string;
  fetchImpl?: GitHubFetch;
}) {
  const response = await (input.fetchImpl ?? fetch)("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      code: input.code,
    }),
  });
  const body = (await parseResponse(response)) as
    | { access_token?: string; error?: string; error_description?: string }
    | null;

  if (!response.ok || !body?.access_token) {
    throw new GitHubApiError(
      response.status,
      body?.error_description ?? body?.error ?? "GitHub OAuth token exchange failed.",
      body ? { message: body.error_description ?? body.error } : null,
    );
  }

  return body.access_token;
}

export function buildGitHubAuthorizeUrl(input: {
  clientId: string;
  state: string;
  redirectUri: string;
}) {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("scope", "repo");
  url.searchParams.set("state", input.state);
  return url.toString();
}

export function getAuthenticatedUser(token: string, fetchImpl: GitHubFetch = fetch) {
  return githubJson<GitHubUser>(token, "/user", {}, fetchImpl);
}

export async function getRepository(
  token: string,
  owner: string,
  repo: string,
  fetchImpl: GitHubFetch = fetch,
) {
  return githubJson<GitHubRepo>(token, `/repos/${owner}/${repo}`, {}, fetchImpl);
}

export async function getRepositoryOrNull(
  token: string,
  owner: string,
  repo: string,
  fetchImpl: GitHubFetch = fetch,
) {
  try {
    return await getRepository(token, owner, repo, fetchImpl);
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getContentFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  ref: string,
  fetchImpl: GitHubFetch = fetch,
) {
  const query = new URLSearchParams({ ref });
  const content = await githubJson<GitHubContentFile | GitHubContentFile[]>(
    token,
    `/repos/${owner}/${repo}/contents/${encodePath(path)}?${query}`,
    {},
    fetchImpl,
  );

  if (Array.isArray(content) || content.type !== "file") {
    throw new GitHubApiError(400, "Expected a file at the requested content path.");
  }

  return content;
}

export async function getContentFileOrNull(
  token: string,
  owner: string,
  repo: string,
  path: string,
  ref: string,
  fetchImpl: GitHubFetch = fetch,
) {
  try {
    return await getContentFile(token, owner, repo, path, ref, fetchImpl);
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) return null;
    throw error;
  }
}

export function decodeGitHubContent(file: GitHubContentFile) {
  if (file.encoding !== "base64") {
    throw new GitHubApiError(400, "GitHub returned unsupported content encoding.");
  }

  return Buffer.from(file.content.replace(/\s/g, ""), "base64").toString("utf8");
}

export async function getBranchHeadSha(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  fetchImpl: GitHubFetch = fetch,
) {
  const ref = await githubJson<{ object: { sha: string } }>(
    token,
    `/repos/${owner}/${repo}/git/ref/heads/${encodeRefPath(branch)}`,
    {},
    fetchImpl,
  );
  return ref.object.sha;
}

export async function ensureBranch(input: {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  sha: string;
  fetchImpl?: GitHubFetch;
}) {
  const fetchImpl = input.fetchImpl ?? fetch;
  try {
    await getBranchHeadSha(input.token, input.owner, input.repo, input.branch, fetchImpl);
    return;
  } catch (error) {
    if (!(error instanceof GitHubApiError) || error.status !== 404) {
      throw error;
    }
  }

  try {
    await githubJson(
      input.token,
      `/repos/${input.owner}/${input.repo}/git/refs`,
      {
        method: "POST",
        body: JSON.stringify({
          ref: `refs/heads/${input.branch}`,
          sha: input.sha,
        }),
      },
      fetchImpl,
    );
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 422) return;
    throw error;
  }
}

export async function putContentFile(input: {
  token: string;
  owner: string;
  repo: string;
  path: string;
  branch: string;
  message: string;
  content: string;
  sha?: string;
  fetchImpl?: GitHubFetch;
}) {
  return githubJson(
    input.token,
    `/repos/${input.owner}/${input.repo}/contents/${encodePath(input.path)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message: input.message,
        content: Buffer.from(input.content, "utf8").toString("base64"),
        branch: input.branch,
        ...(input.sha ? { sha: input.sha } : {}),
      }),
    },
    input.fetchImpl ?? fetch,
  );
}

export async function listOpenPullRequests(input: {
  token: string;
  config: Pick<EditorGitHubConfig, "owner" | "repo" | "baseBranch">;
  head: string;
  fetchImpl?: GitHubFetch;
}) {
  const query = new URLSearchParams({
    state: "open",
    base: input.config.baseBranch,
    head: input.head,
  });

  return githubJson<GitHubPullRequest[]>(
    input.token,
    `/repos/${input.config.owner}/${input.config.repo}/pulls?${query}`,
    {},
    input.fetchImpl ?? fetch,
  );
}

export async function createPullRequest(input: {
  token: string;
  config: Pick<EditorGitHubConfig, "owner" | "repo" | "baseBranch">;
  title: string;
  body: string;
  head: string;
  fetchImpl?: GitHubFetch;
}) {
  return githubJson<GitHubPullRequest>(
    input.token,
    `/repos/${input.config.owner}/${input.config.repo}/pulls`,
    {
      method: "POST",
      body: JSON.stringify({
        title: input.title,
        body: input.body,
        head: input.head,
        base: input.config.baseBranch,
        maintainer_can_modify: true,
      }),
    },
    input.fetchImpl ?? fetch,
  );
}

export async function createFork(input: {
  token: string;
  config: Pick<EditorGitHubConfig, "owner" | "repo">;
  fetchImpl?: GitHubFetch;
}) {
  return githubJson<GitHubRepo>(
    input.token,
    `/repos/${input.config.owner}/${input.config.repo}/forks`,
    {
      method: "POST",
      body: JSON.stringify({ default_branch_only: true }),
    },
    input.fetchImpl ?? fetch,
  );
}
