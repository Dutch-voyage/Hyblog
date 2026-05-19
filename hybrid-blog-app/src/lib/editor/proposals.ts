import type { EditorGitHubConfig } from "./config";
import {
  type GitHubFetch,
  GitHubApiError,
  createFork,
  createPullRequest,
  decodeGitHubContent,
  ensureBranch,
  getBranchHeadSha,
  getContentFileOrNull,
  getRepository,
  getRepositoryOrNull,
  listOpenPullRequests,
  putContentFile,
} from "./github";
import {
  type ProposalIntent,
  EditorContentError,
  prepareEditorContent,
} from "./content";

export interface CreateProposalInput {
  token: string;
  login: string;
  collection: string;
  slug?: string | null;
  markdown: string;
  baseSha?: string | null;
  intent: ProposalIntent;
}

export interface CreateProposalResult {
  branch: string;
  head: string;
  path: string;
  prNumber: number;
  prUrl: string;
  repository: string;
  usedFork: boolean;
}

export class EditorProposalError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "EditorProposalError";
    this.status = status;
  }
}

function sanitizeBranchSegment(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "editor"
  );
}

function isPushAllowed(permission?: { admin?: boolean; push?: boolean }) {
  return Boolean(permission?.admin || permission?.push);
}

function toHttpError(error: unknown): EditorProposalError {
  if (error instanceof EditorProposalError) return error;
  if (error instanceof EditorContentError) {
    return new EditorProposalError(error.status, error.message);
  }
  if (error instanceof GitHubApiError) {
    return new EditorProposalError(error.status, error.message);
  }
  if (error instanceof Error) {
    return new EditorProposalError(500, error.message);
  }
  return new EditorProposalError(500, "Unknown editor proposal error.");
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function ensureUserFork(input: {
  token: string;
  config: Pick<EditorGitHubConfig, "owner" | "repo">;
  login: string;
  pollDelaysMs: number[];
  fetchImpl: GitHubFetch;
}) {
  const existingFork = await getRepositoryOrNull(
    input.token,
    input.login,
    input.config.repo,
    input.fetchImpl,
  );

  if (existingFork) {
    if (!existingFork.fork) {
      throw new EditorProposalError(
        409,
        `Your account already has a repository named ${input.config.repo}, but it is not a fork.`,
      );
    }
    return existingFork;
  }

  await createFork({
    token: input.token,
    config: input.config,
    fetchImpl: input.fetchImpl,
  });

  for (const waitMs of input.pollDelaysMs) {
    if (waitMs > 0) await delay(waitMs);
    const fork = await getRepositoryOrNull(input.token, input.login, input.config.repo, input.fetchImpl);
    if (fork) return fork;
  }

  throw new EditorProposalError(202, "GitHub is still preparing your fork. Try submitting again shortly.");
}

async function ensureProposalBranch(input: {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  baseSha: string;
  fallbackBranch?: string;
  fetchImpl: GitHubFetch;
}) {
  try {
    await ensureBranch({
      token: input.token,
      owner: input.owner,
      repo: input.repo,
      branch: input.branch,
      sha: input.baseSha,
      fetchImpl: input.fetchImpl,
    });
  } catch (error) {
    if (!input.fallbackBranch || !(error instanceof GitHubApiError)) throw error;

    const fallbackSha = await getBranchHeadSha(
      input.token,
      input.owner,
      input.repo,
      input.fallbackBranch,
      input.fetchImpl,
    );
    await ensureBranch({
      token: input.token,
      owner: input.owner,
      repo: input.repo,
      branch: input.branch,
      sha: fallbackSha,
      fetchImpl: input.fetchImpl,
    });
  }
}

export async function createEditorProposal(
  input: CreateProposalInput,
  options: {
    config: Pick<EditorGitHubConfig, "owner" | "repo" | "baseBranch">;
    fetchImpl?: GitHubFetch;
    pollDelaysMs?: number[];
  },
): Promise<CreateProposalResult> {
  const fetchImpl = options.fetchImpl ?? fetch;

  try {
    const prepared = prepareEditorContent(input);
    const currentFile = await getContentFileOrNull(
      input.token,
      options.config.owner,
      options.config.repo,
      prepared.path,
      options.config.baseBranch,
      fetchImpl,
    );

    if (input.baseSha) {
      if (!currentFile) {
        throw new EditorProposalError(404, "This content file no longer exists in the source repository.");
      }

      if (currentFile.sha !== input.baseSha) {
        throw new EditorProposalError(
          409,
          "This file changed on GitHub after you opened the editor. Reload before submitting.",
        );
      }
    } else if (currentFile) {
      throw new EditorProposalError(409, "A content file already exists for this slug. Choose another slug.");
    }

    const originRepo = await getRepository(
      input.token,
      options.config.owner,
      options.config.repo,
      fetchImpl,
    );
    const canPushOrigin = isPushAllowed(originRepo.permissions);
    const branch = `cms/${sanitizeBranchSegment(input.login)}/${sanitizeBranchSegment(prepared.slug)}`;
    const originBaseSha = await getBranchHeadSha(
      input.token,
      options.config.owner,
      options.config.repo,
      options.config.baseBranch,
      fetchImpl,
    );

    const target = canPushOrigin
      ? {
          owner: options.config.owner,
          repo: options.config.repo,
          usedFork: false,
          fallbackBranch: options.config.baseBranch,
        }
      : {
          ...(await ensureUserFork({
            token: input.token,
            config: options.config,
            login: input.login,
            pollDelaysMs: options.pollDelaysMs ?? [500, 1000, 1500],
            fetchImpl,
          })),
          owner: input.login,
          repo: options.config.repo,
          usedFork: true,
          fallbackBranch: options.config.baseBranch,
        };

    await ensureProposalBranch({
      token: input.token,
      owner: target.owner,
      repo: target.repo,
      branch,
      baseSha: originBaseSha,
      fallbackBranch: target.fallbackBranch,
      fetchImpl,
    });

    const branchFile = await getContentFileOrNull(
      input.token,
      target.owner,
      target.repo,
      prepared.path,
      branch,
      fetchImpl,
    );
    const shaForUpdate = branchFile?.sha ?? currentFile?.sha;

    await putContentFile({
      token: input.token,
      owner: target.owner,
      repo: target.repo,
      path: prepared.path,
      branch,
      sha: shaForUpdate,
      content: prepared.markdown,
      message: `content(${prepared.status}): ${prepared.path}`,
      fetchImpl,
    });

    const head = target.usedFork ? `${input.login}:${branch}` : `${options.config.owner}:${branch}`;
    const existingPr = (
      await listOpenPullRequests({
        token: input.token,
        config: options.config,
        head,
        fetchImpl,
      })
    )[0];

    const pr =
      existingPr ??
      (await createPullRequest({
        token: input.token,
        config: options.config,
        title: `content(${prepared.status}): ${prepared.title}`,
        body: [
          "Submitted from the built-in Markdown editor.",
          "",
          `- Path: \`${prepared.path}\``,
          `- Status: \`${prepared.status}\``,
          `- Author: @${input.login}`,
        ].join("\n"),
        head,
        fetchImpl,
      }));

    return {
      branch,
      head,
      path: prepared.path,
      prNumber: pr.number,
      prUrl: pr.html_url,
      repository: `${target.owner}/${target.repo}`,
      usedFork: target.usedFork,
    };
  } catch (error) {
    throw toHttpError(error);
  }
}

export function decodeContentForEditor(file: Awaited<ReturnType<typeof getContentFileOrNull>>) {
  return file ? decodeGitHubContent(file) : null;
}
