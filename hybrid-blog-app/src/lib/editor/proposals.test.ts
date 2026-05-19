import { describe, expect, it } from "vitest";
import { createEditorProposal, EditorProposalError } from "./proposals";

const config = {
  owner: "Dutch-voyage",
  repo: "Hyblog",
  baseBranch: "main",
};

const markdown = `---
title: "Hello Editor"
description: "A draft from the editor."
pubDate: 2026-05-18
authors:
  - "owner"
tags:
  - "cms"
status: "draft"
formats:
  - "blog"
---

Body text.`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function makeFetch(
  handler: (request: { method: string; url: URL; body: string | null }) => Response,
) {
  const calls: Array<{ method: string; pathname: string; body: string | null; search: string }> = [];
  const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const method = init?.method ?? "GET";
    const body = typeof init?.body === "string" ? init.body : null;
    calls.push({ method, pathname: url.pathname, search: url.search, body });
    return handler({ method, url, body });
  };

  return { fetchImpl: fetchImpl as typeof fetch, calls };
}

describe("editor GitHub proposals", () => {
  it("creates an origin branch PR for users with push permission", async () => {
    const { fetchImpl, calls } = makeFetch(({ method, url }) => {
      if (url.pathname.includes("/contents/") && url.searchParams.get("ref") === "main") {
        return json({ message: "Not Found" }, 404);
      }
      if (method === "GET" && url.pathname === "/repos/Dutch-voyage/Hyblog") {
        return json({ permissions: { push: true } });
      }
      if (method === "GET" && url.pathname === "/repos/Dutch-voyage/Hyblog/git/ref/heads/main") {
        return json({ object: { sha: "base-sha" } });
      }
      if (method === "GET" && url.pathname.includes("/git/ref/heads/cms/owner/hello-editor")) {
        return json({ message: "Not Found" }, 404);
      }
      if (method === "POST" && url.pathname === "/repos/Dutch-voyage/Hyblog/git/refs") {
        return json({});
      }
      if (method === "GET" && url.pathname.includes("/contents/")) {
        return json({ message: "Not Found" }, 404);
      }
      if (method === "PUT" && url.pathname.includes("/contents/")) {
        return json({});
      }
      if (method === "GET" && url.pathname === "/repos/Dutch-voyage/Hyblog/pulls") {
        expect(url.searchParams.get("head")).toBe("Dutch-voyage:cms/owner/hello-editor");
        return json([]);
      }
      if (method === "POST" && url.pathname === "/repos/Dutch-voyage/Hyblog/pulls") {
        return json({ html_url: "https://github.com/Dutch-voyage/Hyblog/pull/1", number: 1, state: "open" }, 201);
      }
      return json({ message: `Unhandled ${method} ${url.pathname}` }, 500);
    });

    const result = await createEditorProposal(
      {
        token: "token",
        login: "owner",
        collection: "posts",
        markdown,
        intent: "draft",
      },
      { config, fetchImpl },
    );

    expect(result.usedFork).toBe(false);
    expect(result.head).toBe("Dutch-voyage:cms/owner/hello-editor");
    expect(result.prUrl).toContain("/pull/1");
    expect(calls.some((call) => call.method === "PUT" && call.pathname.includes("/contents/"))).toBe(true);
  });

  it("creates a fork PR for users without push permission", async () => {
    let forkLookups = 0;
    const { fetchImpl } = makeFetch(({ method, url }) => {
      if (url.pathname.includes("/contents/") && url.searchParams.get("ref") === "main") {
        return json({ message: "Not Found" }, 404);
      }
      if (method === "GET" && url.pathname === "/repos/Dutch-voyage/Hyblog") {
        return json({ permissions: { pull: true } });
      }
      if (method === "GET" && url.pathname === "/repos/Dutch-voyage/Hyblog/git/ref/heads/main") {
        return json({ object: { sha: "base-sha" } });
      }
      if (method === "GET" && url.pathname === "/repos/alice/Hyblog") {
        forkLookups += 1;
        return forkLookups === 1
          ? json({ message: "Not Found" }, 404)
          : json({ fork: true, default_branch: "main" });
      }
      if (method === "POST" && url.pathname === "/repos/Dutch-voyage/Hyblog/forks") {
        return json({ fork: true }, 202);
      }
      if (method === "GET" && url.pathname === "/repos/alice/Hyblog/git/ref/heads/cms/alice/hello-editor") {
        return json({ message: "Not Found" }, 404);
      }
      if (method === "POST" && url.pathname === "/repos/alice/Hyblog/git/refs") {
        return json({});
      }
      if (method === "GET" && url.pathname.includes("/contents/")) {
        return json({ message: "Not Found" }, 404);
      }
      if (method === "PUT" && url.pathname.includes("/repos/alice/Hyblog/contents/")) {
        return json({});
      }
      if (method === "GET" && url.pathname === "/repos/Dutch-voyage/Hyblog/pulls") {
        expect(url.searchParams.get("head")).toBe("alice:cms/alice/hello-editor");
        return json([]);
      }
      if (method === "POST" && url.pathname === "/repos/Dutch-voyage/Hyblog/pulls") {
        return json({ html_url: "https://github.com/Dutch-voyage/Hyblog/pull/2", number: 2, state: "open" }, 201);
      }
      return json({ message: `Unhandled ${method} ${url.pathname}` }, 500);
    });

    const result = await createEditorProposal(
      {
        token: "token",
        login: "alice",
        collection: "posts",
        markdown,
        intent: "draft",
      },
      { config, fetchImpl, pollDelaysMs: [0] },
    );

    expect(result.usedFork).toBe(true);
    expect(result.repository).toBe("alice/Hyblog");
  });

  it("rejects stale existing edits", async () => {
    const { fetchImpl } = makeFetch(({ url }) => {
      if (url.pathname.includes("/contents/") && url.searchParams.get("ref") === "main") {
        return json({
          type: "file",
          encoding: "base64",
          content: Buffer.from(markdown).toString("base64"),
          name: "hello-editor.md",
          path: "hybrid-blog-app/src/content/posts/hello-editor.md",
          sha: "new-sha",
        });
      }
      return json({ message: "Unexpected request" }, 500);
    });

    await expect(
      createEditorProposal(
        {
          token: "token",
          login: "owner",
          collection: "posts",
          slug: "hello-editor",
          markdown,
          baseSha: "old-sha",
          intent: "publish",
        },
        { config, fetchImpl },
      ),
    ).rejects.toMatchObject({ status: 409 });
  });

  it("reports async fork preparation as retryable", async () => {
    const { fetchImpl } = makeFetch(({ method, url }) => {
      if (url.pathname.includes("/contents/") && url.searchParams.get("ref") === "main") {
        return json({ message: "Not Found" }, 404);
      }
      if (method === "GET" && url.pathname === "/repos/Dutch-voyage/Hyblog") {
        return json({ permissions: { pull: true } });
      }
      if (method === "GET" && url.pathname === "/repos/Dutch-voyage/Hyblog/git/ref/heads/main") {
        return json({ object: { sha: "base-sha" } });
      }
      if (method === "GET" && url.pathname === "/repos/alice/Hyblog") {
        return json({ message: "Not Found" }, 404);
      }
      if (method === "POST" && url.pathname === "/repos/Dutch-voyage/Hyblog/forks") {
        return json({ fork: true }, 202);
      }
      return json({ message: `Unhandled ${method} ${url.pathname}` }, 500);
    });

    await expect(
      createEditorProposal(
        {
          token: "token",
          login: "alice",
          collection: "posts",
          markdown,
          intent: "draft",
        },
        { config, fetchImpl, pollDelaysMs: [0] },
      ),
    ).rejects.toBeInstanceOf(EditorProposalError);
  });
});
