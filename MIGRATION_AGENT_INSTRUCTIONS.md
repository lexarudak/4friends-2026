# Migration Agent Instructions

> Attach this file when asking Copilot to implement a new Next.js API endpoint.  
> Also attach `BE_LEGACY.md` for full legacy context.

---

## Your role

You are helping migrate a ColdFusion/MySQL backend to **Next.js 15 Route Handlers** + **Prisma** + **Neon (Postgres)**.  
Before writing any new code, you **must** do a legacy audit for the endpoint being implemented.

---

## For every new endpoint — follow this checklist

### 1. Find the legacy equivalent

- Look up the matching ColdFusion component in `BE_LEGACY.md`.
- Identify: function name, CFC file, HTTP method, request shape, response shape.

### 2. Audit the legacy logic — report concerns in these categories

#### 🔴 Security

- Is there auth validation? Is it sufficient?
- Are there SQL injection risks (unparameterised queries)?
- Is there user-ID spoofing risk (e.g. client sends `userid` that is trusted without re-checking token)?
- Are there missing authorisation checks (e.g. user can read/write another user's data)?

#### 🟡 Logic / correctness

- Are there race conditions (e.g. check-then-insert without a transaction)?
- Are side effects hidden inside read endpoints (e.g. point recalculation inside GET)?
- Is validation complete? Are edge cases handled (nulls, empty strings, wrong types)?
- Is winner/score validation correct for all match types (normal, draw, extra time)?

#### 🟠 Performance

- Are there N+1 query patterns (query inside a loop)?
- Are there missing indexes implied by the queries?
- Are there operations that should be async/background instead of blocking the request?

#### 🔵 Data model

- Does the legacy schema have denormalised data that needs to be normalised in Prisma?
- Are there implicit constraints not enforced at DB level?
- Are column names inconsistent or ambiguous?

#### ⚪ Compatibility

- Does the legacy response shape differ from what the frontend currently expects?
- Are there fields the frontend uses that are not in the obvious query result?
- Are keys returned in uppercase (ColdFusion default) that the frontend may depend on?

---

### 3. Propose the new implementation

Only after the audit, propose:

- **Prisma schema snippet** for any tables involved (if not yet defined).
- **Route Handler** at the correct `app/api/` path.
- **Auth pattern** using NextAuth v5 `auth()` instead of cookie token lookup.
- **Response shape** — match legacy keys unless there is a good reason to change (flag any changes explicitly).

---

## Standing decisions (already agreed)

| Topic               | Decision                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| Auth                | NextAuth v5 `auth()` — no manual token table                                                      |
| DB                  | Neon (Postgres) + Prisma ORM                                                                      |
| Deployment          | Vercel — all handlers are serverless                                                              |
| Point recalculation | Move to a Vercel Cron job — never a side effect of a read request                                 |
| External API sync   | Move to a Vercel Cron job — replace CF scheduler                                                  |
| Response casing     | Keep legacy UPPERCASE keys for fields the frontend already consumes; use camelCase for new fields |
| Save bets           | Use `suggest.cfc::Save` as the canonical reference (newer, has team code validation)              |
| Login               | Use `loginUserMain.cfc` as the canonical reference (sets cookie with domain)                      |

---

## Response format

Always respond with these sections in order:

```
## Legacy audit: <endpoint name>

### What it does
<one paragraph summary>

### Concerns
<grouped by category emoji, only non-empty categories>

### Proposed implementation
<Prisma snippet if needed>
<Route Handler code>
```
