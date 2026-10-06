---
title: "Authentication — kaushalrajgupta.is-a.dev"
description: "Public portfolio reads, origin-restricted AI chat, and an unauthenticated URL-shortening tool."
canonical: "https://kaushalrajgupta.is-a.dev/auth.md"
last-updated: "2026-10-06"
author: "Kaushal Raj Gupta"
---

# Authentication

**Short version: there are no credentials to obtain.** kaushalrajgupta.is-a.dev issues no
API keys, runs no OAuth flow, and has no signup, token endpoint, or client
registration. If you are an agent looking for a way to authenticate, you do not
need one.

## Public endpoints — no authentication

Every read endpoint is open, unauthenticated, and side-effect free. Call them
directly:

| Endpoint | Method | Returns |
| --- | --- | --- |
| `/llms.txt` | GET | Structured context about Kaushal Raj Gupta |
| `/index.md`, `/about.md`, `/contact.md`, `/privacy.md`, `/developers.md` | GET | Markdown with YAML frontmatter |
| `/sitemap.xml` | GET | Every canonical URL |
| `/openapi.json` | GET | OpenAPI 3.1 description of this API |
| `/.well-known/ai-catalog.json` | GET | Agentic Resource Discovery catalog |
| `/.well-known/api-catalog` | GET | RFC 9727 linkset |

Any canonical page also returns markdown when you send `Accept: text/markdown`,
append `.md`, add `?mode=agent`, or identify yourself with a known AI crawler
User-Agent.

## POST /api/chat — origin-locked, not key-authenticated

The one endpoint that consumes upstream model quota is protected by an origin
check rather than a credential:

```bash
curl -N -X POST https://kaushalrajgupta.is-a.dev/api/chat \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://kaushalrajgupta.is-a.dev' \
  -d '{"messages":[{"role":"user","content":"What does Kaushal work on?"}]}'
```

Requests must carry an `Origin` or `Referer` whose parsed origin exactly matches
`https://kaushalrajgupta.is-a.dev`. Other origins receive an RFC 9457
`403` response with code `origin_not_allowed`. This is an origin check, not user
authentication. The server requires its own `OPENAI_API_KEY`; visitors never supply one.

The endpoint is rate limited to **10 requests per IP per minute**; exceeding it
returns `429`. Back off rather than retrying immediately.

## URL shortening

`POST /api/shorten` accepts JSON `{ "url": "https://example.com" }` without
credentials. It creates a public short link through is.gd only when requested.
Do not submit private or signed URLs. It returns `{ "shorturl": "..." }` on
success or `{ "error": "..." }` with a non-2xx status on failure. The limit is
10 requests per IP per minute per function instance, with temporary in-memory
caching. This unversioned utility is separate from the read-only v1 APIs.

## Programmatic integrations

Contact [Kaushal on LinkedIn](https://www.linkedin.com/in/kaushalrajgupta/) to discuss integrations.

## What does not exist

To save you probing for them: no `/.well-known/oauth-authorization-server`, no
`/.well-known/oauth-protected-resource`, no token endpoint, no client
registration, no refresh tokens, no scopes, and no sandbox with separate
credentials. Read endpoints have no side effects; chat consumes model quota and
URL shortening creates public links.
