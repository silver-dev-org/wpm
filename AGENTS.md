# Agent guidelines

## Dependency and security changes

- Title dependency PRs, commits and branches neutrally, e.g. `chore(deps): bump <pkg> to <version>`. Keep advisory ids and descriptions of code as vulnerable, unpatched or exploitable out of everything that lands in the repo or on GitHub: PRs, commits, branch names, comments, configs, changelogs and ignore files.
- Leave out comments and ignore or allowlist entries that describe an unfixed issue.
- Take security concerns to maintainers privately (see `SECURITY.md`), never to public issues, PRs or discussions.
- Merge or close dependency update PRs promptly rather than leaving them open.
