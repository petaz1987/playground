# Playground — Agent Instructions

## 1. Project

Playground is a small public collection of interactive AI and automation experiments.

Production domain:

`playground.staroba.biz`

The project is intentionally lightweight.

Primary goals:

- let visitors try small AI and automation experiments immediately,
- support LinkedIn posts with working interactive demos,
- keep experiments easy to add,
- optionally expose sanitized downloadable n8n workflows,
- minimize user friction and infrastructure complexity.

Do not turn Playground into a general SaaS platform or framework.

---

## 2. Working Principle

Prefer the smallest implementation that cleanly solves the current requirement.

Reusable is good.

Premature abstraction is not.

Do not add infrastructure, dependencies, configuration layers, generic systems, or features only because they might be useful later.

If a requirement can be implemented clearly with less code and fewer moving parts, prefer that solution.

---

## 3. Git Workflow

Work directly on the existing `main` branch.

Do not create or switch branches unless explicitly instructed.

The coding agent must NOT:

- commit,
- push,
- merge,
- rebase,
- tag,
- open pull requests,
- change Git remotes,
- rewrite Git history,
- run destructive Git commands.

Do not stage files unless explicitly requested.

All commits and pushes are performed manually after human review.

The human gate is mandatory:

`Agent implementation → review diff → human review → manual commit → manual push`

Never bypass this process.

---

## 4. Cost Policy

This is intentionally a low-cost project.

When working through Codex, use GPT-6 Luna as the maximum model tier unless Petr explicitly authorizes a different model.

Do not escalate to a more expensive model automatically.

If a task is difficult:

1. reduce the task size,
2. inspect the existing implementation,
3. improve the prompt or plan,
4. report the blocker.

Model escalation requires explicit approval.

---

## 5. Review Handoff

Repository:

`C:\Workspace\Playground`

Review directory:

`C:\Workspace\Playground - Review`

The review directory is outside the repository and must never become part of the project.

After completing an implementation task, create:

`C:\Workspace\Playground - Review\changes.diff`

The diff must contain the complete implementation change, including newly created files.

Do not assume that a normal `git diff` contains untracked files. Make sure the review artifact represents all additions, modifications, and deletions made by the task.

Overwrite the previous `changes.diff` unless instructed otherwise.

Do not place temporary review artifacts inside the repository.

At handoff, report:

- files created,
- files modified,
- files deleted,
- tests/checks run,
- test result,
- any known limitation or unresolved issue.

Do not commit or push after creating the review artifact.

---

## 6. Security Boundary

The browser must never call n8n directly.

Required architecture:

`Browser → Playground public API → authenticated server-to-server request → n8n`

Never expose to browser-side code:

- private n8n webhook URLs,
- webhook secrets,
- API keys,
- service credentials,
- internal service URLs,
- environment secrets.

Secrets belong only in server-side environment variables or appropriate protected credentials.

Never hard-code secrets.

Public API endpoints should provide appropriate:

- input validation,
- request timeout handling,
- safe error responses,
- abuse/rate-limit protection where required.

Do not expose internal errors, stack traces, credentials, or infrastructure details to public users.

---

## 7. Public n8n Workflows

An experiment may provide a downloadable Lite n8n workflow.

Any workflow intended for public download must be sanitized.

It must contain no:

- credentials,
- secrets,
- private webhook URLs,
- personal data,
- production database configuration,
- private infrastructure information.

Where credentials are required, the workflow should make it clear that the user must connect their own credentials.

---

## 8. Playground v1 Scope

Keep the platform itself deliberately small.

Supported experiment inputs initially:

- single-line text,
- multiline text.

Standard experiment output should support, where practical:

- rendered Markdown,
- structured JSON,
- copy action.

Experiments may optionally provide:

- direct download of a sanitized n8n workflow.

Do not introduce without an explicit requirement:

- authentication,
- user accounts,
- email collection,
- payments,
- saved user history,
- Playground database,
- admin interface,
- visual experiment builder,
- file uploads,
- image inputs,
- date pickers,
- sliders,
- generic configuration UI.

---

## 9. Experiment Architecture

Experiments should share a small reusable shell.

Adding a normal experiment should mainly require:

1. defining its route,
2. defining its text inputs,
3. connecting its server-side endpoint,
4. rendering its Markdown/JSON response,
5. optionally providing a workflow download.

Do not duplicate an entire page implementation for every experiment when the shared shell can handle it cleanly.

At the same time, do not build a complex plugin framework.

Optimize for a small number of experiments and straightforward extension.

---

## 10. UX Direction

The experiment itself is the primary experience.

Keep surrounding UI minimal.

The intended character is:

- playground,
- lab,
- developer experiment,
- slightly playful,
- credible and clean.

Avoid turning pages into conventional SaaS marketing landing pages.

A warm yellow / amber / orange visual accent and subtle pixel-inspired details are acceptable, but visual styling must not reduce readability or usability.

Do not overdesign.

---

## 11. Code Changes

Before modifying code:

1. read this file,
2. inspect `git status`,
3. inspect the relevant existing files,
4. understand the smallest required change.

While implementing:

- preserve existing behavior unless the task explicitly changes it,
- avoid unrelated refactoring,
- avoid adding dependencies without a clear need,
- keep functions and components focused,
- prefer understandable code over clever abstractions,
- follow existing project conventions once they exist.

Do not silently expand task scope.

If an important architectural decision is unclear, stop and report it instead of inventing a large solution.

---

## 12. Validation

Every implementation must be validated before handoff.

Run the relevant available checks, such as:

- build,
- type checking,
- lint,
- automated tests,
- focused functional checks.

Do not claim a check passed unless it was actually run successfully.

If a check cannot be run, state why.

A task is not complete merely because code was written.

It is ready for review only after the implementation and its validation have been completed and `changes.diff` has been generated.