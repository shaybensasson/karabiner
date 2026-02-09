import fs from "fs";
import { execSync } from "child_process";
import { KarabinerRules, KeyCode, ModifiersKeys } from "./types";
import {
  createHyperSubLayers,
  app,
  open,
  window,
  shellCmd,
  HyperSubLayerInput,
} from "./utils";

// ============================================================================
// Exported Configuration (for documentation generation)
// ============================================================================

/**
 * All hyper sublayers configuration.
 * This is exported so generate_map.ts can read the shortcuts for HTML generation.
 */
export const hyperSubLayers: { [key_code in KeyCode]?: HyperSubLayerInput } = {
  // Note: Arrow keys for window management are handled above with simultaneous detection (instant, no delay)
  // Note: We use caps-lock+F to Bring all windows to front in System Settings -> Keyboard shortcuts

  b: {
    title: "Browse",
    commands: {
      c: open("https://calendar.google.com/calendar/u/2/r?pli=1", "Google Calendar"),
      d: open("https://www.dropbox.com/home", "Dropbox"),
      g: open("https://gemini.google.com/u/1/app?pageId=none", "Gemini"),
      h: open("https://www.youtube.com/feed/history", "YouTube History"),
      o: open("https://chat.openai.com/chat", "ChatGPT (Web)"),
      p: open("http://localhost:4200/", "Prefect (localOW) Server"),
      r: open("https://reddit.com", "Reddit"),
      t: open("https://my.timeless.day/", "Timeless"),
      u: open("https://app.clickup.com/3843235/v/b/7-3843235-2", "ClickUp"),
      x: open("https://x.com", "X (Twitter)"),
      y: open("https://www.youtube.com", "YouTube"),
    },
  },

  q: {
    title: "Query",
    commands: {
      b: open("raycast://extensions/Codely/google-chrome/search-all", "Browser Search"),
      c: open("raycast://extensions/degouville/cursor-recent-projects/index", "Cursor Recent Projects"),
      e: open("raycast://extensions/raycast/emoji-symbols/search-emoji-symbols", "Emoji Search"),
      f: open("raycast://extensions/raycast/file-search/search-files", "File Search"),
      g: open("raycast://extensions/mblode/google-search/index", "Google Search"),
      i: open("raycast://extensions/destiner/iconify/view-icons", "Icon Search"),
      l: { description: "LastPass", to: [{ key_code: "5", modifiers: ["left_control", "left_command"] }] }, // The lastpass app must be running.
      m: open("raycast://extensions/raycast/navigation/search-menu-items", "Menu Items Search"),
      o: open("raycast://extensions/marcjulian/obsidian/searchNoteCommand", "Obsidian Note Search"),
      d: open("raycast://extensions/chyroc/the-blue-cloud/search-dropbox-files", "Dropbox Search"),
    },
  },

  o: {
    title: "Open Apps",
    commands: {
      c: app("Calendar"),
      d: open("~/Downloads", "Downloads"),
      f: open("raycast://script-commands/new-finder-instance", "New Finder"),
      v: open("raycast://script-commands/run-vlc-with-iptv", "VLC with IPTV"),
      l: app("LastPass for Desktop", "LastPass"),
      m: app("Superhuman"),
      s: app("Slack"),
      // t: could repurpose for Terminal.app (Ghostty is ◆+0 window cycling)
      w: app("WhatsApp"),
      r: open(
        "/System/Library/CoreServices/Finder.app/Contents/Resources/MyLibraries/myDocuments.cannedSearch",
        "Finder Recents",
      ),
      y: shellCmd("open -a Safari https://music.youtube.com", "YouTube Music"),
      z: open("raycast://extensions/raycast/zoom/start-meeting", "Start Zoom Meeting"),
    },
  },

  w: {
    title: "Window",
    commands: {
      b: window("bottom-half", "Bottom Half"),
      d: window("next-display", "Next Display"),
      t: window("top-half", "Top Half"),
    },
  },

  s: {
    title: "System",
    commands: {
      b: open("raycast://extensions/raycast/system/toggle-bluetooth", "Toggle Bluetooth"),
      c: open("raycast://extensions/raycast/system/open-camera", "Open Camera"),
      d: open("raycast://extensions/yakitrak/do-not-disturb/toggle?launchType=background", "Toggle DND"),
      t: open("raycast://extensions/raycast/system/toggle-system-appearance", "Toggle Dark Mode"),
      w: app("Weather"),
    },
  },

  // v: {
  //   title: "Move / Vim",
  //   commands: {
  //     d: { description: "⇧⌘D", to: [{ key_code: "d", modifiers: ["right_shift", "right_command"] }] },
  //     h: { description: "← Left Arrow", to: [{ key_code: "left_arrow" }] },
  //     i: { description: "Page Up", to: [{ key_code: "page_up" }] },
  //     j: { description: "↓ Down Arrow", to: [{ key_code: "down_arrow" }] },
  //     k: { description: "↑ Up Arrow", to: [{ key_code: "up_arrow" }] },
  //     l: { description: "→ Right Arrow", to: [{ key_code: "right_arrow" }] },
  //     m: { description: "Magicmove (Homerow)", to: [{ key_code: "f", modifiers: ["right_control"] }] },
  //     s: { description: "Scroll Mode (Homerow)", to: [{ key_code: "j", modifiers: ["right_control"] }] },
//     u: { description: "Page Down", to: [{ key_code: "page_down" }] },
  //   },
  // },

  r: {
    title: "Raycast",
    commands: {
      // c: open("raycast://extensions/thomas/color-picker/pick-color", "Color Picker"),
      e: open("raycast://extensions/raycast/emoji-symbols/search-emoji-symbols", "Emoji Search"),
      c: open("raycast://extensions/raycast/clipboard-history/clipboard-history", "Clipboard History"),
      n: open("raycast://script-commands/dismiss-notifications", "Dismiss Notifications"),
      p: open("raycast://extensions/raycast/raycast/confetti", "Confetti"),
      s: open("/Users/shay/.config/raycast/scripts/", "Scripts Folder"),
    },
  },

  a: {
    title: "AI",
    commands: {
      s: open("raycast://extensions/ShayBenSasson/rayeye/simplify", "Simplify"),
      l: open("raycast://extensions/ShayBenSasson/rayeye/create-list", "Create List"),
      p: open("raycast://extensions/ShayBenSasson/rayeye/make-professional", "Professionalize"),
      g: open("raycast://extensions/ShayBenSasson/rayeye/fix-grammar", "Fix Grammar"),
      c: open("raycast://extensions/ShayBenSasson/rayeye/make-concise", "Make Concise"),
      t: open("raycast://extensions/ShayBenSasson/rayeye/translate-to-hebrew", "Translate to Hebrew"),
    },
  },
};

/**
 * Direct hyper shortcuts (non-sublayer, instant with modifiers).
 * Single source of truth for both rule generation and documentation.
 */
export const directHyperShortcuts: {
  key: KeyCode;
  keyDisplay?: string;
  description: string;
  action?: string; // shell_command
  toKeyCode?: KeyCode; // key_code to send (alternative to action)
}[] = [
  { key: "left_arrow", keyDisplay: "←", description: "Window Left Half", action: "open -g raycast://extensions/raycast/window-management/left-half" },
  { key: "right_arrow", keyDisplay: "→", description: "Window Right Half", action: "open -g raycast://extensions/raycast/window-management/right-half" },
  { key: "up_arrow", keyDisplay: "↑", description: "Maximize Window", action: "open -g raycast://extensions/raycast/window-management/maximize" },
  { key: "down_arrow", keyDisplay: "↓", description: "Restore Window", action: "open -g raycast://extensions/raycast/window-management/restore" },
  { key: "page_up", description: "Window Top Right Quarter", action: "open -g raycast://extensions/raycast/window-management/top-right-quarter" },
  { key: "page_down", description: "Window Bottom Right Quarter", action: "open -g raycast://extensions/raycast/window-management/bottom-right-quarter" },
  { key: "home", description: "Window Top Left Quarter", action: "open -g raycast://extensions/raycast/window-management/top-left-quarter" },
  { key: "end", description: "Window Bottom Left Quarter", action: "open -g raycast://extensions/raycast/window-management/bottom-left-quarter" },
  { key: "1", description: "Google Calendar", action: "open 'https://calendar.google.com/calendar/u/2/r?pli=1'" },
  { key: "2", description: "Gmail", action: "open 'https://mail.google.com/mail/u/2/#inbox'" },
  { key: "3", description: "ClickUp Inbox", action: "open 'https://app.clickup.com/3843235/inbox?tab=primary'" },
  { key: "non_us_backslash", keyDisplay: "§", description: "Noiseless", action: "open 'raycast://script-commands/noiseless'" },
  { key: "escape", keyDisplay: "Esc", description: "Meckano", action: "open 'https://app.meckano.co.il'" },
  { key: "f1", keyDisplay: "F1", description: "Browse Gemini Web", action: "open 'https://gemini.google.com/u/1/app?pageId=none'" },
  { key: "f2", keyDisplay: "F2", description: "Browse ChatGPT Web", action: "open 'https://chat.openai.com/chat'" },
  { key: "f3", keyDisplay: "F3", description: "Keyboard Shortcuts PDF", action: "open '/Users/shay/github/karabiner/keyboard-shortcuts.pdf'" },
  { key: "f8", keyDisplay: "F8", description: "Spotify", action: "open -a 'Spotify.app'" },
  { key: "f12", keyDisplay: "F12", description: "Select Audio Output", action: "open 'raycast://extensions/benvp/audio-device/set-output-device'" },
];

/**
 * Window cycling shortcuts - single source of truth for rules AND documentation.
 * First press activates app, subsequent presses cycle windows.
 * Hold key: opens new instance (if newInstanceCommand is defined).
 */
export const windowCyclingShortcuts: {
  key: KeyCode;
  keyDisplay?: string;
  description: string;
  appName: string;
  variableName: string;
  newInstanceCommand?: string; // Shell command to open new instance (hold key on first press)
  cycleCommand?: string; // Custom shell command to cycle windows (default: Cmd+`)
  // Optional: hold-when-frontmost behavior (sends keystroke on hold when app is frontmost)
  bundleIdentifier?: string; // For frontmost app condition
  holdKey?: KeyCode; // Key to send on hold (when app is frontmost)
  holdModifiers?: ModifiersKeys[]; // Modifiers for hold key
}[] = [
  { key: "0", description: "Ghostty (cycle windows)", appName: "Ghostty.app", variableName: "ghostty_activated", bundleIdentifier: "com.mitchellh.ghostty", holdKey: "n", holdModifiers: ["left_command"] },
  { key: "9", description: "Cursor (cycle windows)", appName: "Cursor.app", variableName: "cursor_activated", newInstanceCommand: "/usr/local/bin/cursor --new-window" },
  { key: "8", description: "VSCode (cycle windows)", appName: "Visual Studio Code.app", variableName: "vscode_activated", newInstanceCommand: "/Users/shay/.local/bin/vscode --new-window" },
  { key: "4", description: "Obsidian (cycle windows)", appName: "Obsidian.app", variableName: "obsidian_activated", newInstanceCommand: "open -na 'Obsidian.app'" },
  { key: "f4", keyDisplay: "F4", description: "Chrome (cycle windows)", appName: "Google Chrome.app", variableName: "chrome_activated", newInstanceCommand: "open -na 'Google Chrome.app'" },
  { key: "f5", keyDisplay: "F5", description: "Zoom (cycle windows)", appName: "zoom.us.app", variableName: "zoom_activated" },
];

/**
 * Simple app shortcuts - tap to activate, hold to send keystroke (when app is frontmost).
 */
export const simpleAppShortcuts: {
  key: KeyCode;
  keyDisplay?: string;
  description: string;
  appName: string;
  bundleIdentifier: string;
  holdKey: KeyCode; // Key to send on hold (when app is frontmost)
  holdModifiers: ModifiersKeys[]; // Modifiers for hold key
}[] = [
  // Ghostty moved to windowCyclingShortcuts for window cycling support
];

/**
 * General key remappings - single source of truth for rules AND documentation.
 */
export const generalMappings: {
  keys: string; // Display key combo for docs
  description: string;
  fromKey: KeyCode;
  fromModifiers: ModifiersKeys[];
  toKey: KeyCode;
  toModifiers: ModifiersKeys[];
}[] = [
  { keys: "⌥Tab", description: "Previous Tab", fromKey: "tab", fromModifiers: ["left_option"], toKey: "tab", toModifiers: ["left_control", "left_shift"] },
  { keys: "⌘PageDown", description: "⌘↓ (scroll to bottom)", fromKey: "page_down", fromModifiers: ["left_command"], toKey: "down_arrow", toModifiers: ["left_command"] },
  { keys: "⌘PageUp", description: "⌘↑ (scroll to top)", fromKey: "page_up", fromModifiers: ["left_command"], toKey: "up_arrow", toModifiers: ["left_command"] },
  { keys: "⌘⇧PageDown", description: "⌘⇧↓ (select to bottom)", fromKey: "page_down", fromModifiers: ["left_command", "left_shift"], toKey: "down_arrow", toModifiers: ["left_command", "left_shift"] },
  { keys: "⌘⇧PageUp", description: "⌘⇧↑ (select to top)", fromKey: "page_up", fromModifiers: ["left_command", "left_shift"], toKey: "up_arrow", toModifiers: ["left_command", "left_shift"] },
];

/**
 * Static documentation entries for complex rules that can't be easily parameterized.
 */
export const staticShortcutDocs: { keys: string; description: string }[] = [
  { keys: "⇪ (hold)", description: "Hyper Key (⌃⌥⇧⌘)" },
  { keys: "⇪ (tap)", description: "Toggle Caps Lock" },
  { keys: "Esc", description: "Reset All Variables" },
  { keys: "⌘Q ⌘Q", description: "Quit App (double-tap)" },
  { keys: "⌘H", description: "Disabled (except IDE)" },
  { keys: "F11", description: "IDE: F11 | Other: F19" },
  { keys: "⇧L+⇧R", description: "Move Forward 1 Word (hold L, tap R)" },
  { keys: "⇧R+⇧L", description: "Move Backward 1 Word (hold R, tap L)" },
  // { keys: "⌫ (Finder)", description: "Go Back (⌘[)" },
];

/**
 * Generate Karabiner rules from directHyperShortcuts.
 */
function createDirectHyperRules(): KarabinerRules {
  return {
    description: "Direct Hyper shortcuts (instant)",
    manipulators: directHyperShortcuts.map((shortcut) => ({
      type: "basic" as const,
      from: {
        key_code: shortcut.key,
        modifiers: {
          optional: ["any"],
        },
      },
      to: [
        shortcut.action
          ? { shell_command: shortcut.action }
          : { key_code: shortcut.toKeyCode! },
        {
          set_variable: {
            name: "hyper",
            value: 0,
          },
        },
      ],
      conditions: [
        {
          type: "variable_if" as const,
          name: "hyper",
          value: 1,
        },
      ],
    })),
  };
}

/**
 * Generate window cycling rules from windowCyclingShortcuts config.
 * First press activates app (hold for new instance), subsequent presses cycle windows.
 * For apps with holdKey defined: hold sends keystroke when app is frontmost.
 */
function createWindowCyclingRules(): KarabinerRules[] {
  return windowCyclingShortcuts.map((shortcut) => {
    const cycleAction = shortcut.cycleCommand
      ? { shell_command: shortcut.cycleCommand }
      : {
          // ISO keyboard: use non_us_backslash (§) for Cmd+` window switching
          key_code: "non_us_backslash" as KeyCode,
          modifiers: ["command"] as ModifiersKeys[],
        };

    const holdSentVar = `${shortcut.variableName}_hold_sent`;
    const holdConfig =
      shortcut.holdKey && shortcut.bundleIdentifier
        ? {
            to_if_held_down: [
              {
                key_code: shortcut.holdKey,
                modifiers: shortcut.holdModifiers || [],
              },
              { set_variable: { name: holdSentVar, value: 1 } }, // Prevent repeat
            ],
            parameters: { "basic.to_if_held_down_threshold_milliseconds": 500 },
          }
        : {};

    // For apps with holdKey: need separate rules for frontmost/not-frontmost
    if (shortcut.holdKey && shortcut.bundleIdentifier) {
      // Common condition to prevent hold from repeating
      const holdNotSentCondition = { type: "variable_if" as const, name: holdSentVar, value: 0 };

      return {
        description: `Hyper+${shortcut.keyDisplay || shortcut.key}: ${shortcut.description}`,
        manipulators: [
          // Cycle: when variable=1 and app IS frontmost (with hold for keystroke)
          {
            type: "basic" as const,
            from: { key_code: shortcut.key, modifiers: { optional: ["any"] } },
            to: [cycleAction],
            ...holdConfig,
            conditions: [
              { type: "variable_if" as const, name: "hyper", value: 1 },
              { type: "variable_if" as const, name: shortcut.variableName, value: 1 },
              { type: "frontmost_application_if" as const, bundle_identifiers: [shortcut.bundleIdentifier] },
              holdNotSentCondition,
            ],
          },
          // Cycle: when variable=1 and app NOT frontmost (no hold)
          {
            type: "basic" as const,
            from: { key_code: shortcut.key, modifiers: { optional: ["any"] } },
            to: [cycleAction],
            conditions: [
              { type: "variable_if" as const, name: "hyper", value: 1 },
              { type: "variable_if" as const, name: shortcut.variableName, value: 1 },
              { type: "frontmost_application_unless" as const, bundle_identifiers: [shortcut.bundleIdentifier] },
            ],
          },
          // Activate: when variable=0 and app IS frontmost (with hold for keystroke)
          {
            type: "basic" as const,
            from: { key_code: shortcut.key, modifiers: { optional: ["any"] } },
            to: [
              { shell_command: `open -a '${shortcut.appName}'` },
              { set_variable: { name: shortcut.variableName, value: 1 } },
            ],
            ...holdConfig,
            conditions: [
              { type: "variable_if" as const, name: "hyper", value: 1 },
              { type: "variable_if" as const, name: shortcut.variableName, value: 0 },
              { type: "frontmost_application_if" as const, bundle_identifiers: [shortcut.bundleIdentifier] },
              holdNotSentCondition,
            ],
          },
          // Activate: when variable=0 and app NOT frontmost (no hold)
          {
            type: "basic" as const,
            from: { key_code: shortcut.key, modifiers: { optional: ["any"] } },
            to: [
              { shell_command: `open -a '${shortcut.appName}'` },
              { set_variable: { name: shortcut.variableName, value: 1 } },
            ],
            conditions: [
              { type: "variable_if" as const, name: "hyper", value: 1 },
              { type: "variable_if" as const, name: shortcut.variableName, value: 0 },
              { type: "frontmost_application_unless" as const, bundle_identifiers: [shortcut.bundleIdentifier] },
            ],
          },
        ],
      };
    }

    // Standard window cycling (no hold-when-frontmost)
    return {
      description: `Hyper+${shortcut.keyDisplay || shortcut.key}: ${shortcut.description}`,
      manipulators: [
        // Second+ press: switch window (when variable=1)
        {
          type: "basic" as const,
          from: { key_code: shortcut.key, modifiers: { optional: ["any"] } },
          to: [cycleAction],
          conditions: [
            { type: "variable_if" as const, name: "hyper", value: 1 },
            { type: "variable_if" as const, name: shortcut.variableName, value: 1 },
          ],
        },
        // First press: activate app and set flag, hold for new instance
        {
          type: "basic" as const,
          from: { key_code: shortcut.key, modifiers: { optional: ["any"] } },
          to: [
            { shell_command: `open -a '${shortcut.appName}'` },
            { set_variable: { name: shortcut.variableName, value: 1 } },
          ],
          // Hold key to open new instance (only on first press)
          ...(shortcut.newInstanceCommand && {
            to_if_held_down: [{ shell_command: shortcut.newInstanceCommand }],
            parameters: { "basic.to_if_held_down_threshold_milliseconds": 500 },
          }),
          conditions: [
            { type: "variable_if" as const, name: "hyper", value: 1 },
            { type: "variable_if" as const, name: shortcut.variableName, value: 0 },
          ],
        },
      ],
    };
  });
}

/**
 * Generate simple app shortcut rules from simpleAppShortcuts config.
 * Tap to activate app, hold to send keystroke (when app is frontmost).
 */
function createSimpleAppShortcutRules(): KarabinerRules[] {
  return simpleAppShortcuts.map((shortcut) => ({
    description: `Hyper+${shortcut.keyDisplay || shortcut.key}: ${shortcut.description}`,
    manipulators: [
      {
        type: "basic" as const,
        from: {
          key_code: shortcut.key,
          modifiers: { optional: ["any"] },
        },
        to: [{ shell_command: `open -a '${shortcut.appName}'` }],
        to_if_held_down: [
          {
            key_code: shortcut.holdKey,
            modifiers: shortcut.holdModifiers,
          },
        ],
        parameters: { "basic.to_if_held_down_threshold_milliseconds": 500 },
        conditions: [
          { type: "variable_if" as const, name: "hyper", value: 1 },
          { type: "frontmost_application_if" as const, bundle_identifiers: [shortcut.bundleIdentifier] },
        ],
      },
      // When app is NOT frontmost, just activate (no hold action)
      {
        type: "basic" as const,
        from: {
          key_code: shortcut.key,
          modifiers: { optional: ["any"] },
        },
        to: [{ shell_command: `open -a '${shortcut.appName}'` }],
        conditions: [
          { type: "variable_if" as const, name: "hyper", value: 1 },
          { type: "frontmost_application_unless" as const, bundle_identifiers: [shortcut.bundleIdentifier] },
        ],
      },
    ],
  }));
}

/**
 * Generate general key remapping rules from generalMappings config.
 */
function createGeneralMappingRules(): KarabinerRules {
  return {
    description: "General key remappings",
    manipulators: generalMappings.map((mapping) => ({
      type: "basic" as const,
      from: {
        key_code: mapping.fromKey,
        modifiers: {
          mandatory: mapping.fromModifiers,
          optional: ["caps_lock"],
        },
      },
      to: [
        {
          key_code: mapping.toKey,
          modifiers: mapping.toModifiers,
        },
      ],
    })),
  };
}

// ============================================================================
// Karabiner Rules
// ============================================================================

/**
 * Generate all variable names that need to be reset.
 * This includes hyper, all sublayer variables, window cycling variables, and hold-sent variables.
 */
function getAllVariableNames(): string[] {
  const sublayerKeys = Object.keys(hyperSubLayers) as KeyCode[];
  const sublayerVariables = sublayerKeys.map((key) => `hyper_sublayer_${key}`);
  const windowCyclingVariables = windowCyclingShortcuts.map((s) => s.variableName);
  const holdSentVariables = windowCyclingShortcuts
    .filter((s) => s.holdKey)
    .map((s) => `${s.variableName}_hold_sent`);

  return [
    "hyper",
    ...sublayerVariables,
    ...windowCyclingVariables,
    ...holdSentVariables,
    "cmd_q_pressed",
  ];
}

const rules: KarabinerRules[] = [
  // Reset all variables on escape - passes through escape to OS
  // Only when hyper is NOT active (so Hyper+Escape still works for Meckano)
  {
    description: "Reset all variables (escape)",
    manipulators: [
      {
        type: "basic",
        from: {
          key_code: "escape",
          modifiers: {
            optional: ["caps_lock"],
          },
        },
        conditions: [{ type: "variable_if", name: "hyper", value: 0 }],
        to: [
          // Reset all variables first
          ...getAllVariableNames().map((name) => ({
            set_variable: { name, value: 0 },
          })),
          // Then pass through escape to OS
          { key_code: "escape" },
        ],
      },
    ],
  },
  // Caps Lock → Hyper Key (tap alone → toggle Caps Lock)
  {
    description: "Caps Lock → Hyper Key (tap alone → Caps Lock)",
    manipulators: [
      {
        type: "basic",
        from: {
          key_code: "caps_lock",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [
          {
            set_variable: {
              name: "hyper",
              value: 1,
            },
          },
        ],
        to_after_key_up: [
          { set_variable: { name: "hyper", value: 0 } },
          // Reset all window cycling variables (generated from windowCyclingShortcuts)
          ...windowCyclingShortcuts.map((s) => ({
            set_variable: { name: s.variableName, value: 0 },
          })),
          // Reset hold-sent variables for shortcuts with holdKey (prevents repeat on hold)
          ...windowCyclingShortcuts
            .filter((s) => s.holdKey)
            .map((s) => ({
              set_variable: { name: `${s.variableName}_hold_sent`, value: 0 },
            })),
        ],
        to_if_alone: [
          {
            key_code: "caps_lock",
            hold_down_milliseconds: 200,
          },
        ],
        parameters: {
          "basic.to_if_alone_timeout_milliseconds": 200,
        },
      },
    ],
  },
  // Window cycling shortcuts (generated from windowCyclingShortcuts)
  ...createWindowCyclingRules(),
  // Simple app shortcuts (generated from simpleAppShortcuts)
  ...createSimpleAppShortcutRules(),
  // Direct hyper shortcuts (generated from directHyperShortcuts array)
  createDirectHyperRules(),

  // Require double-tap cmd+q to quit apps (prevents accidental quits)
  {
    description: "Double-tap Cmd+Q to quit",
    manipulators: [
      {
        type: "basic",
        from: {
          key_code: "q",
          modifiers: {
            mandatory: ["command"],
            optional: ["caps_lock"],
          },
        },
        to: [
          {
            set_variable: {
              name: "cmd_q_pressed",
              value: 1,
            },
          },
        ],
        to_delayed_action: {
          // Timeout expired without second press - reset
          to_if_invoked: [
            {
              set_variable: {
                name: "cmd_q_pressed",
                value: 0,
              },
            },
          ],
          // Another key pressed - keep variable active so second Cmd+Q can match
          to_if_canceled: [
            {
              set_variable: {
                name: "cmd_q_pressed",
                value: 1,
              },
            },
          ],
        },
        conditions: [
          {
            type: "variable_if",
            name: "cmd_q_pressed",
            value: 0,
          },
        ],
      },
      {
        type: "basic",
        from: {
          key_code: "q",
          modifiers: {
            mandatory: ["command"],
            optional: ["caps_lock"],
          },
        },
        to: [
          {
            key_code: "q",
            modifiers: ["left_command"],
          },
          {
            set_variable: {
              name: "cmd_q_pressed",
              value: 0,
            },
          },
        ],
        conditions: [
          {
            type: "variable_if",
            name: "cmd_q_pressed",
            value: 1,
          },
        ],
      },
    ],
  },
  // General key remappings (generated from generalMappings)
  createGeneralMappingRules(),
  // F11: passthrough in IDE, F19 (Show Desktop) elsewhere
  {
    description: "F11 → F19 (except VSCode/Cursor)",
    manipulators: [
      // F11 passes through in VSCode/Cursor
      {
        type: "basic",
        from: {
          key_code: "f11",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [{ key_code: "f11" }],
        conditions: [
          {
            type: "frontmost_application_if",
            bundle_identifiers: [
              "^com\\.microsoft\\.VSCode$",
              "^com\\.todesktop\\.230313mzl4w4u92$", // Cursor
            ],
          },
        ],
      },
      // F11 → F19 in all other apps (only when no modifiers held)
      // Modifier+F11 falls through to OS default (e.g., fn+F11 for media keys)
      {
        type: "basic",
        from: {
          key_code: "f11",
        },
        to: [{ key_code: "f19" }],
      },
    ],
  },
  // Disable cmd+h (hide app) except in VSCode/Cursor where it's used for search & replace
  {
    description: "Disable command-h (except VSCode/Cursor)",
    manipulators: [
      {
        type: "basic",
        from: {
          key_code: "h",
          modifiers: {
            mandatory: ["command"],
            optional: ["caps_lock"],
          },
        },
        to: [{ key_code: "vk_none" }],
        conditions: [
          {
            type: "frontmost_application_unless",
            bundle_identifiers: [
              "^com\\.microsoft\\.VSCode$",
              "^com\\.todesktop\\.230313mzl4w4u92$", // Cursor
            ],
          },
        ],
      },
    ],
  },
  // Shift keys move by word when other shift is held
  {
    description: "Shifts Move Forward and Backward by 1 word (when other shift held)",
    manipulators: [
      {
        type: "basic",
        from: {
          key_code: "right_shift",
          modifiers: {
            mandatory: ["left_shift"],
          },
        },
        to: [
          {
            key_code: "right_arrow",
            modifiers: ["option"],
          },
        ],
      },
      {
        type: "basic",
        from: {
          key_code: "left_shift",
          modifiers: {
            mandatory: ["right_shift"],
          },
        },
        to: [
          {
            key_code: "left_arrow",
            modifiers: ["option"],
          },
        ],
      },
    ],
  },
  ...createHyperSubLayers(hyperSubLayers),
  // Finder: Forward Delete → Move to Trash (Cmd+Delete)
  {
    description: "Finder: Forward Delete → Move to Trash",
    manipulators: [
      {
        type: "basic",
        from: {
          key_code: "delete_forward",
          modifiers: {
            optional: ["caps_lock"],
          },
        },
        to: [
          {
            key_code: "delete_or_backspace",
            modifiers: ["left_command"],
          },
        ],
        conditions: [
          {
            type: "frontmost_application_if",
            bundle_identifiers: ["^com\\.apple\\.finder$"],
          },
        ],
      },
    ],
  },
  // NOTE: shayb | 18-01-26 | causes problems downstream on e.g. raycast or when renaming files in Finder
  // Finder: Backspace (alone) → Go Back (Cmd+[)
  // {
  //   description: "Finder: Backspace → Go Back",
  //   manipulators: [
  //     {
  //       type: "basic",
  //       from: {
  //         key_code: "delete_or_backspace",
  //         modifiers: {
  //           optional: ["caps_lock"],
  //         },
  //       },
  //       to: [
  //         {
  //           key_code: "open_bracket",
  //           modifiers: ["left_command"],
  //         },
  //       ],
  //       conditions: [
  //         {
  //           type: "frontmost_application_if",
  //           bundle_identifiers: ["^com\\.apple\\.finder$"],
  //         },
  //       ],
  //     },
  //   ],
  // },
];

fs.writeFileSync(
  "karabiner.json",
  JSON.stringify(
    {
      global: {
        show_in_menu_bar: false,
      },
      profiles: [
        {
          name: "Default",
          complex_modifications: {
            rules,
          },
          virtual_hid_keyboard: {
            keyboard_type_v2: "iso",
          },
          parameters: {
            "basic.to_delayed_action_delay_milliseconds": 300,
          },
        },
      ],
    },
    null,
    2
  )
);

// Generate HTML and PDF documentation (only when run directly, not when imported)
const isMainModule = process.argv[1]?.endsWith("rules.ts");
if (isMainModule) {
  try {
    execSync("yarn tsx generate_map.ts --pdf", { stdio: "inherit" });
  } catch {
    console.error("Warning: Failed to generate HTML/PDF documentation");
  }
}
