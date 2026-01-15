# Handoff: Karabiner TypeScript Config

## Goal
Maintain and extend a TypeScript-based Karabiner-Elements configuration generator.

## Current Progress
**Clean state** - No active work in progress.

Recent completed work (commit `36c0712`):
- Fixed hold-for-new-window behavior for Ghostty using a variable guard pattern
- Added `halt?: boolean` to the `To` interface in types.ts

## Project Overview
- TypeScript config → compiles to `karabiner.json`
- Hyper key system: Caps Lock acts as layer modifier (tap = Escape)
- Two modes: direct commands (Hyper+key) and sublayers (Hyper+key, then key)
- Leader key timing uses `to_delayed_action` with 500ms windows

## Key Files
| File | Purpose |
|------|---------|
| `rules.ts` | All keyboard shortcuts |
| `utils.ts` | Helpers: `app()`, `open()`, `shell`, `osascript()` |
| `types.ts` | TypeScript types for Karabiner schema |
| `karabiner.json` | Generated output (don't edit) |

## What Worked (Previous Sessions)
- Variable guard pattern for preventing key repeat: set flag on action, check flag=0 before firing, reset on key up
- Dynamic variable names based on app names work well with `windowCyclingShortcuts`

## What Didn't Work (Previous Sessions)
- `halt: true` on `to_if_held_down` - doesn't prevent repeat, only stops propagation
- No built-in `repeat: false` for `to_if_held_down` in Karabiner-Elements

## Next Steps
No pending tasks. Ready for new work.

## Commands
```bash
yarn build              # Generate karabiner.json
yarn watch              # Auto-rebuild
yarn test               # Vitest validation
yarn test:interactive   # E2E tests (requires keyboard input)
```
