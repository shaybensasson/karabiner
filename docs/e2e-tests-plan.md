# E2E Testing System for Karabiner Key Mappings

## Overview

Create an end-to-end testing system that validates Karabiner key mappings by:
1. Simulating "from" keystrokes programmatically
2. Capturing "to" outputs via log file (transformed shell commands)
3. Organizing tests per sublayer/subgroup

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Test Specs      │───▶│ Swift KeySim CLI │───▶│ Karabiner       │
│ (Vitest)        │    │ (CGEvents)       │    │ Elements        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                               ┌─────────────────┐
                                               │ Test Action Log │
                                               │ /tmp/karabiner- │
                                               │ test.log        │
                                               └─────────────────┘
```

**Key Design Decision:** Instead of automating EventViewer GUI, we create a test profile that replaces `shell_command` actions with logging commands. This captures what *would* execute without triggering actual apps/URLs.

## File Structure

```
test/
├── tools/
│   ├── keysim.swift              # Swift CGEvent keystroke simulator
│   └── build.sh                  # Compile Swift tool
├── utils/
│   ├── keysim.ts                 # Node wrapper for Swift tool
│   ├── log-parser.ts             # Parse action log
│   ├── profile-manager.ts        # Switch Karabiner profiles
│   └── test-profile-generator.ts # Generate test profile
├── specs/
│   ├── sublayers/
│   │   ├── browse.test.ts        # ◆ B sublayer
│   │   ├── query.test.ts         # ◆ Q sublayer
│   │   ├── open-apps.test.ts     # ◆ O sublayer
│   │   ├── window.test.ts        # ◆ W sublayer
│   │   ├── system.test.ts        # ◆ S sublayer
│   │   ├── vim.test.ts           # ◆ V sublayer
│   │   └── raycast.test.ts       # ◆ R sublayer
│   ├── direct-hyper.test.ts      # Direct ◆ + key tests
│   └── general.test.ts           # Non-hyper shortcuts
├── setup.ts                      # Global setup/teardown
└── vitest.config.ts
```

## Implementation Steps

### Phase 1: Swift Keystroke Simulator
- Create `test/tools/keysim.swift` using CGEvents
- Map Karabiner key names to CGKeyCode values
- Support key down/up for modifiers (Caps Lock hold)
- Support tap sequences for leader key style

### Phase 2: Test Profile Generator
- Create `test/utils/test-profile-generator.ts`
- Transform shell commands to logging:
  - `open -a 'App'` → `echo "ACTION:app:App" >> /tmp/karabiner-test.log`
  - `open https://...` → `echo "ACTION:url:..." >> /tmp/karabiner-test.log`
  - `key_code: "f13"` → `echo "ACTION:key:f13" >> /tmp/karabiner-test.log`
- Generate as separate "Test" profile in karabiner.json

### Phase 3: Test Utilities
- `keysim.ts`: Node wrapper calling Swift binary
- `log-parser.ts`: Read/clear/wait for action log entries
- `profile-manager.ts`: Switch between Default/Test profiles via `karabiner_cli`

### Phase 4: Vitest Setup
- Add vitest to package.json
- Configure vitest.config.ts
- Create setup.ts with beforeAll (switch to test profile) / afterAll (restore default)
- Check accessibility permissions

### Phase 5: Test Specs
Create test files for each subgroup:
- `browse.test.ts`: ◆ B + {c,d,g,h,o,p,r,t,u,x,y}
- `query.test.ts`: ◆ Q + {e,f,g,l}
- `open-apps.test.ts`: ◆ O + {c,d,f,i,l,m,s,t,v,w,y,z}
- etc.

## Critical Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Add vitest, test scripts |
| `karabiner.json` | Will have "Test" profile added |

## New Files

| File | Purpose |
|------|---------|
| `test/tools/keysim.swift` | CGEvent keystroke simulation |
| `test/tools/build.sh` | Compile Swift binary |
| `test/utils/*.ts` | Test utilities |
| `test/specs/**/*.test.ts` | Test specifications |
| `test/vitest.config.ts` | Vitest configuration |

## Sample Test

```typescript
// test/specs/sublayers/open-apps.test.ts
describe('Open Apps Sublayer (◆ O)', () => {
  beforeEach(() => clearActionLog());

  it('◆ O S → opens Slack', async () => {
    await simulateSublayerSequence('o', 's');
    const result = await waitForAction('app', 'Slack', 1000);
    expect(result).toBe(true);
  });
});
```

## Prerequisites

1. **Swift 5.5+** - for compiling keysim.swift
2. **Accessibility permissions** - CGEvents require it (will prompt user)
3. **Karabiner-Elements running** - target under test

## Timing Considerations

- Leader key timeout: 500ms (from `LEADER_KEY_TIMEOUT_MS`)
- Between keys: 50ms delay
- After sequence: 200ms wait before checking log
- Action timeout: 1000ms

## Verification

1. Run `yarn test:setup` to generate test profile and compile Swift tool
2. Run `yarn test` to execute all tests
3. Tests will:
   - Switch to Test profile
   - Simulate keystroke sequences
   - Verify expected actions in log
   - Switch back to Default profile
