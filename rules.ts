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
      p: open("https://neurohelp-pitch.vercel.app/?log=debug", "NeuroHelp Pitch"),
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
      e: open("raycast://extensions/raycast/emoji-symbols/search-emoji-symbols", "Emoji Search"),
      f: open("raycast://extensions/raycast/file-search/search-files", "File Search"),
      g: open("raycast://extensions/mblode/google-search/index", "Google Search"),
      l: { description: "LastPass", to: [{ key_code: "5", modifiers: ["left_control", "left_command"] }] }, // The lastpass app must be running.
    },
  },

  o: {
    title: "Open Apps",
    commands: {
      c: app("Calendar"),
      d: open("~/Downloads", "Downloads"),
      f: open("raycast://script-commands/new-finder-instance", "New Finder"),
      i: open("raycast://script-commands/run-vlc-with-iptv", "IPTV"),
      l: app("LastPass for Desktop", "LastPass"),
      // m: app("Spotify"), // Replaced by ◆+F8 (direct shortcut)
      s: app("Slack"),
      // t: app("Ghostty"), // Replaced by ◆+0 (window cycling). Could repurpose for Terminal.app
      v: app("VLC"),
      w: app("WhatsApp"),
      y: shellCmd("open -a Safari https://music.youtube.com", "YouTube Music"),
      // z: app("zoom.us", "Zoom"), // Replaced by ◆+F5 (window cycling)
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
  { key: "1", description: "Google Calendar", action: "open 'https://calendar.google.com/calendar/u/2/r?pli=1'" },
  { key: "2", description: "Gmail", action: "open 'https://mail.google.com/mail/u/2/#inbox'" },
  { key: "3", description: "ClickUp Inbox", action: "open 'https://app.clickup.com/3843235/inbox?tab=primary'" },
  { key: "4", description: "Obsidian", action: "open -a 'Obsidian.app'" },
  { key: "non_us_backslash", keyDisplay: "§", description: "Noiseless", action: "open 'raycast://script-commands/noiseless'" },
  { key: "escape", keyDisplay: "Esc", description: "Meckano", action: "open 'https://app.meckano.co.il'" },
  { key: "f1", keyDisplay: "F1", description: "F13", toKeyCode: "f13" },
  { key: "f2", keyDisplay: "F2", description: "F14", toKeyCode: "f14" },
  { key: "f3", keyDisplay: "F3", description: "Keyboard Shortcuts PDF", action: "open '/Users/shay/github/karabiner/keyboard-shortcuts.pdf'" },
  { key: "f8", keyDisplay: "F8", description: "Spotify", action: "open -a 'Spotify.app'" },
];

/**
 * Window cycling shortcuts - single source of truth for rules AND documentation.
 * First press activates app, subsequent presses cycle windows.
 */
export const windowCyclingShortcuts: {
  key: KeyCode;
  keyDisplay?: string;
  description: string;
  appName: string;
  variableName: string;
}[] = [
  { key: "0", description: "Ghostty (cycle windows)", appName: "Ghostty.app", variableName: "ghostty_activated" },
  { key: "9", description: "Cursor (cycle windows)", appName: "Cursor.app", variableName: "cursor_activated" },
  { key: "f4", keyDisplay: "F4", description: "Chrome (cycle windows)", appName: "Google Chrome.app", variableName: "chrome_activated" },
  { key: "f5", keyDisplay: "F5", description: "Zoom (cycle windows)", appName: "zoom.us.app", variableName: "zoom_activated" },
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
];

/**
 * Static documentation entries for complex rules that can't be easily parameterized.
 */
export const staticShortcutDocs: { keys: string; description: string }[] = [
  { keys: "⇪ (hold)", description: "Hyper Key (⌃⌥⇧⌘)" },
  { keys: "⇪ (tap)", description: "Toggle Caps Lock" },
  { keys: "⌘Q ⌘Q", description: "Quit App (double-tap)" },
  { keys: "⌘H", description: "Disabled (except IDE)" },
  { keys: "⇧R (alone)", description: "Move Forward 1 Word" },
  { keys: "⇧L (alone)", description: "Move Backward 1 Word" },
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
 * First press activates app, subsequent presses cycle windows.
 */
function createWindowCyclingRules(): KarabinerRules[] {
  return windowCyclingShortcuts.map((shortcut) => ({
    description: `Hyper+${shortcut.keyDisplay || shortcut.key}: ${shortcut.description}`,
    manipulators: [
      // Second+ press: switch window (when variable=1)
      {
        type: "basic" as const,
        from: {
          key_code: shortcut.key,
          modifiers: { optional: ["any"] },
        },
        to: [
          {
            // ISO keyboard: use non_us_backslash (§) for Cmd+` window switching
            key_code: "non_us_backslash" as KeyCode,
            modifiers: ["command"],
          },
        ],
        conditions: [
          { type: "variable_if" as const, name: "hyper", value: 1 },
          { type: "variable_if" as const, name: shortcut.variableName, value: 1 },
        ],
      },
      // First press: activate app and set flag
      {
        type: "basic" as const,
        from: {
          key_code: shortcut.key,
          modifiers: { optional: ["any"] },
        },
        to: [
          { shell_command: `open -a '${shortcut.appName}'` },
          { set_variable: { name: shortcut.variableName, value: 1 } },
        ],
        conditions: [
          { type: "variable_if" as const, name: "hyper", value: 1 },
          { type: "variable_if" as const, name: shortcut.variableName, value: 0 },
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

const rules: KarabinerRules[] = [
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
  // Shift keys move by word when tapped alone
  {
    description: "Shifts Move Forward and Backward by 1 word",
    manipulators: [
      {
        type: "basic",
        from: {
          key_code: "right_shift",
        },
        to: [
          {
            key_code: "right_shift",
          },
        ],
        to_if_alone: [
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
        },
        to: [
          {
            key_code: "left_shift",
          },
        ],
        to_if_alone: [
          {
            key_code: "left_arrow",
            modifiers: ["option"],
          },
        ],
      },
    ],
  },
  ...createHyperSubLayers(hyperSubLayers),
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
