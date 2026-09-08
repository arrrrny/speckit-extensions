---
description: "Rename a bug directory to match its GitHub issue number (when sync_issue_numbers is enabled)"
---

# Rename Bug

Rename a bug directory so its name matches the GitHub issue number, e.g.
`crash-on-startup` → `127-crash-on-startup`. This only applies when
`sync_issue_numbers: true` (the default in `bug-config.yml`). When
`sync_issue_numbers: false`, the directory uses just the slug and this
command is a no-op.

## User Input

```text
$ARGUMENTS
```

Accept any of:

- `slug=<bug-slug>` or `--slug <bug-slug>` or a bare slug-like token.
- A path that contains the slug (e.g. `.specify/bugs/login-timeout/`).
- **Nothing** — fall back to context (see below).

## Slug Resolution

Read `.specify/extensions/bug/bug-config.yml` to check `sync_issue_numbers`.
When `false`, stop immediately — the directory uses just the slug and no
renaming is needed. When `true` (the default), resolve `BUG_SLUG` in this
order, stopping at the first match:

1. **Explicit user input** — a slug passed in `$ARGUMENTS` (any of the forms
   above).
2. **Conversation context** — if the current session has just run
   `__SPECKIT_COMMAND_BUG_ASSESS__`, `__SPECKIT_COMMAND_BUG_FETCH__`,
   `__SPECKIT_COMMAND_BUG_FIX__`, or `__SPECKIT_COMMAND_BUG_TEST__`, the slug
   it reported is the working slug. Reuse it without re-prompting.
3. **Single candidate on disk** — list `.specify/bugs/*/assessment.md`. If
   exactly one matching `assessment.md` is found, use the slug from its
   parent directory.
4. **Disambiguate**:
   - **Interactive mode**: ask the user which bug to rename and list the
     candidates.
   - **Automated mode**: stop with an error listing the candidates. Do not
     guess.

Once resolved, set `BUG_SLUG` and `BUG_DIR = .specify/bugs/<BUG_SLUG>`.
Confirm `BUG_DIR/assessment.md` exists; if it does not, stop and tell the
user to run `__SPECKIT_COMMAND_BUG_ASSESS__` first.

## Prerequisites

- `BUG_DIR/assessment.md` MUST exist. If it does not, stop and instruct the
  user to run `__SPECKIT_COMMAND_BUG_ASSESS__` first.
- `git` must be available and the current directory must be inside a Git
  repository.
- `gh` CLI must be installed and authenticated (`gh auth status`).

## Execution

1. **Resolve the GitHub issue number**
   - If `BUG_DIR/issue.md` exists, extract the issue number from it (the
     `**Issue**: <number>` line).
   - Otherwise, look up the issue on GitHub. The slug may appear in the
     issue title or body, so search:
     ```bash
     gh issue list --repo <owner>/<repo> --state all --search "<slug>" --json number,title --limit 5
     ```
   - If a matching issue is found, note its **number**.
   - If no matching issue can be found, use `000` as the fallback issue
     number and record this in the report-back.

2. **Build the new slug**
   - When an issue number was found: `<issue-number>-<slug>` (e.g.
     `127-crash-on-startup`).
   - When no issue was found: `000-<slug>` (e.g. `000-crash-on-startup`).
   - If the new slug is identical to the current `BUG_SLUG`, stop — the
     directory is already correctly named.
   - If the target directory `.specify/bugs/<new-slug>/` already exists, stop
     and report the conflict; do not overwrite.

3. **Rename the directory**
   ```bash
   mv "BUG_DIR" ".specify/bugs/<new-slug>"
   ```
   - Update `BUG_DIR` to point at the new path.
   - Stage the rename with `git add -A` so the move is tracked.

4. **Update internal references**
   - The files inside the directory (`assessment.md`, `fix.md`, `test.md`,
     `issue.md`, etc.) contain `**Slug**: <old-slug>` lines. Replace the old
     slug with the new slug everywhere inside the directory:
     ```bash
     sed -i '' "s|<old-slug>|<new-slug>|g" BUG_DIR/*.md
     ```
     (On Linux, omit the `''` after `sed -i`.)
   - If `BUG_DIR/tdd/` exists, also update any references inside it.

5. **Report back** with:
   - The old slug and the new slug.
   - Whether the rename was driven by a found GitHub issue number or the
     `000-` fallback (note: `000-` means no matching issue was found — run
     `gh issue view` to locate it).
   - The new directory path `.specify/bugs/<new-slug>/`.
   - Any conflicts or issues encountered.

## Guardrails

- This command only renames directories; it never edits source code.
- It never overwrites an existing directory — stop on conflict.
- If `sync_issue_numbers: false`, the command is a no-op and reports that
  immediately.
- The `000-` fallback is explicit: it signals that no matching GitHub issue
  was found, so the user can locate the real issue and re-run.
- Always stage the rename with `git add` so the move is tracked in the
  current branch.
