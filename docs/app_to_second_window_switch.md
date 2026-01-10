# Apps with Multi-Window Support

Apps that benefit from the "activate or switch window" pattern (like ◆+0 for Ghostty).

## Multi-Window Apps (Recommended for Window Cycling)

| App | Shortcut | Bundle ID | Notes |
|-----|----------|-----------|-------|
| **Ghostty** | ◆+0 | `com.mitchellh.ghostty` | ✅ Implemented |
| **Cursor** | ◆+5 | `com.todesktop.230313mzl4w4u92` | ✅ Implemented |
| **VSCode** | ◆+6 | `com.microsoft.VSCode` | ✅ Implemented |
| **Google Chrome** | ◆+F4 | `com.google.Chrome` | ✅ Implemented |
| **Finder** | - | `com.apple.finder` | Multiple file windows |
| **Obsidian** | ◆+4 | `md.obsidian` | Multiple vaults |

## Single-Window Apps (No Window Cycling Needed)

| App | Shortcut | Notes |
|-----|----------|-------|
| ChatGPT | ◆+O+C | Single window app |
| Spotify | ◆+O+M | Single window |
| Slack | ◆+O+S | Single main window |
| WhatsApp | ◆+O+W | Single window |
| LastPass | ◆+O+L | Single window |
| VLC | ◆+O+V | Typically single |
| Zoom | ◆+O+Z | Windows only during calls |

## Implementation Status

- [x] Ghostty (◆+0)
- [x] Cursor (◆+5)
- [x] VSCode (◆+6)
- [x] Google Chrome (◆+F4)
- [ ] Finder (needs shortcut)
- [ ] Obsidian (◆+4)

## How It Works

First press: Activates the app
Subsequent presses (while holding ◆): Cycles through app windows via Cmd+§

Uses a variable (`<app>_activated`) to track state, reset when Caps Lock is released.
