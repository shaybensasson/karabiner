# Duplicate App Shortcuts Report

This report identifies apps/services that have multiple keyboard shortcuts defined across different categories in `rules.ts`.

## Categories

1. **Direct Hyper** (`directHyperShortcuts`) - Instant ◆+key shortcuts
2. **Window Cycling** (manual rules) - ◆+key with activate/cycle behavior
3. **Sublayers** (`hyperSubLayers`) - ◆+key+key chord shortcuts

---

## Apps with Multiple Shortcuts

### Spotify
| Shortcut | Category | Action |
|----------|----------|--------|
| ◆+F8 | Direct Hyper | Opens Spotify |
| ◆+O+M | Sublayer (Open Apps) | Opens Spotify |

**Recommendation:** Remove ◆+O+M since ◆+F8 is faster (single key vs chord).

---

### Zoom
| Shortcut | Category | Action |
|----------|----------|--------|
| ◆+F5 | Window Cycling | Activates Zoom, cycles windows |
| ◆+O+Z | Sublayer (Open Apps) | Opens Zoom |

**Recommendation:** Remove ◆+O+Z since ◆+F5 has window cycling which is more useful for Zoom's multiple windows (main app, meeting, chat).

---

### Ghostty
| Shortcut | Category | Action |
|----------|----------|--------|
| ◆+0 | Window Cycling | Activates Ghostty, cycles windows |
| ◆+O+T | Sublayer (Open Apps) | Opens Ghostty |

**Recommendation:** Remove ◆+O+T since ◆+0 has window cycling for terminal windows.

---

### Google Calendar
| Shortcut | Category | Action |
|----------|----------|--------|
| ◆+1 | Direct Hyper | Opens Google Calendar |
| ◆+B+C | Sublayer (Browse) | Opens Google Calendar |

**Recommendation:** Keep both - ◆+1 for quick access, ◆+B+C for discoverability within Browse sublayer.

---

### ClickUp
| Shortcut | Category | Action |
|----------|----------|--------|
| ◆+3 | Direct Hyper | Opens ClickUp Inbox |
| ◆+B+U | Sublayer (Browse) | Opens ClickUp Board |

**Note:** These open different views (Inbox vs Board), so both are intentional.

---

### Emoji Search
| Shortcut | Category | Action |
|----------|----------|--------|
| ◆+Q+E | Sublayer (Query) | Emoji Search |
| ◆+R+E | Sublayer (Raycast) | Emoji Search |

**Recommendation:** Remove one - suggest keeping ◆+R+E (Raycast sublayer is more intuitive for Raycast extensions).

---

### LastPass
| Shortcut | Category | Action |
|----------|----------|--------|
| ◆+Q+L | Sublayer (Query) | Triggers Ctrl+Shift+5 (LastPass browser shortcut) |
| ◆+O+L | Sublayer (Open Apps) | Opens LastPass desktop app |

**Note:** These are different actions - browser extension vs desktop app. Both are intentional.

---

## Summary

| App | Shortcuts | Status |
|-----|-----------|--------|
| Spotify | 2 | Redundant - recommend removing ◆+O+M |
| Zoom | 2 | Redundant - recommend removing ◆+O+Z |
| Ghostty | 2 | Redundant - recommend removing ◆+O+T |
| Google Calendar | 2 | Intentional (quick access + discoverability) |
| ClickUp | 2 | Intentional (different views) |
| Emoji Search | 2 | Redundant - recommend removing ◆+Q+E |
| LastPass | 2 | Intentional (browser vs desktop) |

## Action Items

- [ ] Remove `◆+O+M` (Spotify) - use ◆+F8 instead
- [ ] Remove `◆+O+Z` (Zoom) - use ◆+F5 instead
- [ ] Remove `◆+O+T` (Ghostty) - use ◆+0 instead
- [ ] Remove `◆+Q+E` (Emoji Search) - use ◆+R+E instead
