# Development Workflow

> **Use the agent team by default, without being asked.** For any non-trivial task, delegate
> to the subagents in `.claude/agents/` (`ts-developer`, `rn-developer`, `test-developer`,
> `ui-designer`, `code-reviewer`) — the user should never have to say "use the agents."
> The user has authorized this whole flow **in these files**: branch → implement via agents →
> gate → `code-reviewer` approval → push → PR to `dev` → merge to `dev`, all **without asking**.
> Stop only on failures (lint/tsc/jest red, review requests changes, unresolvable conflict) or
> the release-only steps (promoting `dev → main`, production Firebase Hosting deploy), which are
> **stop-and-ask**. The authoritative summary lives in root `CLAUDE.md` → "Agent workflow (use
> by default)"; this file is the step-by-step.

Apply this workflow sequentially for every task.

## 1. Branch Creation

```bash
# Create branch from dev for new work
git checkout dev
git pull origin dev
git checkout -b <branch-name>
```

Branch naming:
- `feat/<short-description>` — new feature
- `fix/<short-description>` — bug fix
- `refactor/<short-description>` — refactoring
- `chore/<short-description>` — other tasks

## 2. Task Creation

Create a task for each subtask using `TaskCreate` and assign an agent:

| Task | Agent |
|------|-------|
| UI/widget development | `rn-developer` |
| TypeScript / domain layer | `ts-developer` |
| Test writing | `test-developer` |
| Code review | `code-reviewer` |
| Design decisions | `ui-designer` |

## 3. Development

1. Assign work to relevant agents via `TaskCreate`
2. Agents complete their work
3. Regularly run `git add` + `git commit`
4. Keep commit messages clear and atomic

## 4. Code Review (Before Merge)

Before sending to dev, after finishing work:

```bash
# Call code-reviewer agent
Agent(subagent_type: "code-reviewer", prompt: "...")
```

Code-reviewer will check:
- DDD / Clean Architecture rules
- TypeScript strictness
- Cross-layer imports (dependency rule)
- Missing error handling
- Duplicate code
- Test coverage

### Feedback Loop
- If agent finds issues → write to relevant task → have agent fix → send for review again
- If no issues → proceed

## 5. Push & Open PR (target `dev`)

```bash
# After code-reviewer approves and the gate is green, push and open a PR to dev
git push -u origin <branch-name>
gh pr create --base dev --title "<conventional title>" --body "<summary>"
```

`main` is release-only — never target it from a PR here.

## 6. Merge to `dev`

```bash
# Squash-merge once CI/checks are green, then sync local dev
gh pr merge <pr-number> --squash --delete-branch
git checkout dev && git pull
```

The remote branch is deleted by `--delete-branch`; report the PR # and merged commit.

## 7. Branch Cleanup

```bash
# If a stale local branch remains after the squash merge
git branch -D <branch-name>
```

---

## Rules

- **Dependency rule**: Layers import only downward, never upward
- **Error handling**: Use `Result<T, Failure>`, never throw exceptions
- **Tests**: For domain/infrastructure changes, write tests with `test-developer`
- **Build**: After work is done, run local build (`npx expo export --platform web`)
- **Lint**: `npm run lint` and `npx tsc --noEmit` must pass with no errors

## Communication

- `dev` is the base branch for all work
- All PRs go to `dev`, `main` is only for releases
