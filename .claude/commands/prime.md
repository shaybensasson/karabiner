# Karabiner TypeScript Config

TypeScript wrapper generating Karabiner-Elements JSON. Define mappings in TS, compile to JSON.

## Files

| File | Purpose |
|------|---------|
| `rules.ts` | Main config with all keyboard rules |
| `utils.ts` | Helper functions (sublayers, commands) |
| `types.ts` | TypeScript types for Karabiner schema |
| `karabiner.json` | Generated output (symlinked to ~/.config/karabiner/) |

## Commands

```bash
yarn build   # Generate karabiner.json
yarn watch   # Auto-rebuild on changes
```

## Architecture

### Hyper Key
Caps Lock → activates layers. Tap alone → Escape.

### Leader Key Style
`to_delayed_action` enables tap-release-tap chords (500ms window per step):
1. Tap Caps Lock → `hyper=1`
2. Release → 500ms timer starts
3. Tap sublayer key → `sublayer_x=1`, new 500ms timer
4. Tap command key → executes, resets all variables

Timeout: `LEADER_KEY_TIMEOUT_MS` in utils.ts

### Sublayers vs Direct Commands

```typescript
createHyperSubLayers({
  // Direct: Hyper + key (has `to` property)
  spacebar: open("raycast://..."),

  // Sublayer: Hyper + key + key (nested object)
  o: {
    g: app("Google Chrome"),
    s: app("Slack"),
  },
})
```

## Helper Functions

| Function | Usage |
|----------|-------|
| `app(name)` | `app("Slack")` |
| `open(url)` | `open("https://...")` or `open("raycast://...")` |
| `window(name)` | `window("maximize")` |
| `shell\`cmd\`` | `shell\`open -a Finder\`` |
| `osascript(script)` | AppleScript execution |

## Karabiner JSON Primitives

- `set_variable` - Set variable (hyper, hyper_sublayer_x)
- `variable_if` - Condition checking variable value
- `to_delayed_action.to_if_invoked` - Fires on timeout
- `to_delayed_action.to_if_canceled` - Fires when key pressed
- `parameters.basic.to_delayed_action_delay_milliseconds` - Timeout

## Common Tasks

**Add app to sublayer:**
```typescript
o: { n: app("NewApp") }
```

**New sublayer:**
```typescript
x: { a: app("App"), b: open("url") }
```

**Custom key mapping:**
```typescript
k: {
  description: "Custom",
  to: [{ key_code: "a", modifiers: ["left_command"] }],
}
```

## Key Types (types.ts)

- `KeyCode` - Valid keys (a-z, 0-9, arrows, function keys)
- `To` - Action (key_code, shell_command, set_variable)
- `Manipulator` - Full rule (from/to/conditions)
- `LayerCommand` - Simplified {to, description}
