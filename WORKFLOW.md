# Development Workflow

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

## 5. Push to Dev

```bash
# After review passes, push to dev
git push origin <branch-name>
```

## 6. Merge

Open a PR and verify, then:

```bash
# Sync with dev (resolve conflicts if needed)
git checkout dev
git pull origin dev
git merge <branch-name>

# If conflicts exist, resolve them, then commit
git push origin dev
```

## 7. Branch Cleanup

```bash
# After merge is complete, delete local branch
git branch -d <branch-name>
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
