# Commit and Push

Commit all changes using conventional commits format and push to remote.

## Steps

1. Run `git status` to see all changes (staged, unstaged, untracked)
2. Run `git diff` to see the actual changes
3. Run `git log --oneline -5` to see recent commit message style
4. Analyze the changes and determine the appropriate conventional commit type:
   - `feat:` - new feature
   - `fix:` - bug fix
   - `docs:` - documentation only
   - `refactor:` - code change that neither fixes a bug nor adds a feature
   - `chore:` - maintenance tasks, dependencies, build changes
   - `test:` - adding or updating tests
   - `style:` - formatting, whitespace (no code change)
5. Stage all changes with `git add -A`
6. Create a commit with a concise message summarizing the "why" not the "what"
7. Include `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>` in the commit
8. Run `git push` to push to remote
9. Report the commit hash and summary to the user
