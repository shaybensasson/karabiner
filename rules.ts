import fs from "fs";
import { KarabinerRules, KeyCode } from "./types";
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
      c: app("ChatGPT"),
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

  v: {
    title: "Move / Vim",
    commands: {
      d: { description: "⇧⌘D", to: [{ key_code: "d", modifiers: ["right_shift", "right_command"] }] },
      h: { description: "← Left Arrow", to: [{ key_code: "left_arrow" }] },
      i: { description: "Page Up", to: [{ key_code: "page_up" }] },
      j: { description: "↓ Down Arrow", to: [{ key_code: "down_arrow" }] },
      k: { description: "↑ Up Arrow", to: [{ key_code: "up_arrow" }] },
      l: { description: "→ Right Arrow", to: [{ key_code: "right_arrow" }] },
      m: { description: "Magicmove (Homerow)", to: [{ key_code: "f", modifiers: ["right_control"] }] },
      s: { description: "Scroll Mode (Homerow)", to: [{ key_code: "j", modifiers: ["right_control"] }] },
      u: { description: "Page Down", to: [{ key_code: "page_down" }] },
    },
  },

  r: {
    title: "Raycast",
    commands: {
      c: open("raycast://extensions/thomas/color-picker/pick-color", "Color Picker"),
      e: open("raycast://extensions/raycast/emoji-symbols/search-emoji-symbols", "Emoji Search"),
      h: open("raycast://extensions/raycast/clipboard-history/clipboard-history", "Clipboard History"),
      l: open("raycast://extensions/stellate/mxstbr-commands/create-mxs-is-shortlink", "Create Shortlink"),
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
  { key: "f8", keyDisplay: "F8", description: "Spotify", action: "open -a 'Spotify.app'" },
];

/**
 * Window cycling shortcuts - for documentation only.
 * These have custom implementations with smart window switching logic.
 */
export const windowCyclingShortcuts: {
  key: KeyCode;
  keyDisplay?: string;
  description: string;
}[] = [
  { key: "0", description: "Ghostty (cycle windows)" },
  { key: "5", description: "Cursor (cycle windows)" },
  { key: "6", description: "VSCode (cycle windows)" },
  { key: "f4", keyDisplay: "F4", description: "Chrome (cycle windows)" },
  { key: "f5", keyDisplay: "F5", description: "Zoom (cycle windows)" },
];

/**
 * General (non-hyper) shortcuts - for documentation only.
 * These rules have complex structures that don't fit a simple pattern.
 */
export const generalShortcuts: { keys: string; description: string }[] = [
  { keys: "⇪ (hold)", description: "Hyper Key (⌃⌥⇧⌘)" },
  { keys: "⇪ (tap)", description: "Toggle Caps Lock" },
  { keys: "◆ (alone)", description: "Escape" },
  { keys: "⌘Q ⌘Q", description: "Quit App (double-tap)" },
  { keys: "⌥Tab", description: "Previous Tab" },
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
          {
            set_variable: {
              name: "hyper",
              value: 0,
            },
          },
          {
            set_variable: {
              name: "ghostty_activated",
              value: 0,
            },
          },
          {
            set_variable: {
              name: "cursor_activated",
              value: 0,
            },
          },
          {
            set_variable: {
              name: "vscode_activated",
              value: 0,
            },
          },
          {
            set_variable: {
              name: "chrome_activated",
              value: 0,
            },
          },
          {
            set_variable: {
              name: "zoom_activated",
              value: 0,
            },
          },
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
  // Smart app switching: ◆+0 activates Ghostty, subsequent presses cycle windows
  {
    description: "Hyper+0: Ghostty (activate or switch window)",
    manipulators: [
      // Second+ press: switch window (when ghostty_activated=1)
      {
        type: "basic",
        from: {
          key_code: "0",
          modifiers: { optional: ["any"] },
        },
        to: [
          {
            // ISO keyboard: use non_us_backslash (§) for Cmd+` window switching
            key_code: "non_us_backslash",
            modifiers: ["command"],
          },
        ],
        conditions: [
          { type: "variable_if", name: "hyper", value: 1 },
          { type: "variable_if", name: "ghostty_activated", value: 1 },
        ],
      },
      // First press: activate Ghostty and set flag
      {
        type: "basic",
        from: {
          key_code: "0",
          modifiers: { optional: ["any"] },
        },
        to: [
          { shell_command: "open -a 'Ghostty.app'" },
          { set_variable: { name: "ghostty_activated", value: 1 } },
        ],
        conditions: [
          { type: "variable_if", name: "hyper", value: 1 },
          { type: "variable_if", name: "ghostty_activated", value: 0 },
        ],
      },
    ],
  },
  // Smart app switching: ◆+5 activates Cursor, subsequent presses cycle windows
  {
    description: "Hyper+5: Cursor (activate or switch window)",
    manipulators: [
      // Second+ press: switch window (when cursor_activated=1)
      {
        type: "basic",
        from: {
          key_code: "5",
          modifiers: { optional: ["any"] },
        },
        to: [
          {
            // ISO keyboard: use non_us_backslash (§) for Cmd+` window switching
            key_code: "non_us_backslash",
            modifiers: ["command"],
          },
        ],
        conditions: [
          { type: "variable_if", name: "hyper", value: 1 },
          { type: "variable_if", name: "cursor_activated", value: 1 },
        ],
      },
      // First press: activate Cursor and set flag
      {
        type: "basic",
        from: {
          key_code: "5",
          modifiers: { optional: ["any"] },
        },
        to: [
          { shell_command: "open -a 'Cursor.app'" },
          { set_variable: { name: "cursor_activated", value: 1 } },
        ],
        conditions: [
          { type: "variable_if", name: "hyper", value: 1 },
          { type: "variable_if", name: "cursor_activated", value: 0 },
        ],
      },
    ],
  },
  // Smart app switching: ◆+6 activates VSCode, subsequent presses cycle windows
  {
    description: "Hyper+6: VSCode (activate or switch window)",
    manipulators: [
      // Second+ press: switch window (when vscode_activated=1)
      {
        type: "basic",
        from: {
          key_code: "6",
          modifiers: { optional: ["any"] },
        },
        to: [
          {
            // ISO keyboard: use non_us_backslash (§) for Cmd+` window switching
            key_code: "non_us_backslash",
            modifiers: ["command"],
          },
        ],
        conditions: [
          { type: "variable_if", name: "hyper", value: 1 },
          { type: "variable_if", name: "vscode_activated", value: 1 },
        ],
      },
      // First press: activate VSCode and set flag
      {
        type: "basic",
        from: {
          key_code: "6",
          modifiers: { optional: ["any"] },
        },
        to: [
          { shell_command: "open -a 'Visual Studio Code.app'" },
          { set_variable: { name: "vscode_activated", value: 1 } },
        ],
        conditions: [
          { type: "variable_if", name: "hyper", value: 1 },
          { type: "variable_if", name: "vscode_activated", value: 0 },
        ],
      },
    ],
  },
  // Smart app switching: ◆+F4 activates Chrome, subsequent presses cycle windows
  {
    description: "Hyper+F4: Chrome (activate or switch window)",
    manipulators: [
      // Second+ press: switch window (when chrome_activated=1)
      {
        type: "basic",
        from: {
          key_code: "f4",
          modifiers: { optional: ["any"] },
        },
        to: [
          {
            // ISO keyboard: use non_us_backslash (§) for Cmd+` window switching
            key_code: "non_us_backslash",
            modifiers: ["command"],
          },
        ],
        conditions: [
          { type: "variable_if", name: "hyper", value: 1 },
          { type: "variable_if", name: "chrome_activated", value: 1 },
        ],
      },
      // First press: activate Chrome and set flag
      {
        type: "basic",
        from: {
          key_code: "f4",
          modifiers: { optional: ["any"] },
        },
        to: [
          { shell_command: "open -a 'Google Chrome.app'" },
          { set_variable: { name: "chrome_activated", value: 1 } },
        ],
        conditions: [
          { type: "variable_if", name: "hyper", value: 1 },
          { type: "variable_if", name: "chrome_activated", value: 0 },
        ],
      },
    ],
  },
  // Smart app switching: ◆+F5 activates Zoom, subsequent presses cycle windows
  {
    description: "Hyper+F5: Zoom (activate or switch window)",
    manipulators: [
      // Second+ press: switch window (when zoom_activated=1)
      {
        type: "basic",
        from: {
          key_code: "f5",
          modifiers: { optional: ["any"] },
        },
        to: [
          {
            // ISO keyboard: use non_us_backslash (§) for Cmd+` window switching
            key_code: "non_us_backslash",
            modifiers: ["command"],
          },
        ],
        conditions: [
          { type: "variable_if", name: "hyper", value: 1 },
          { type: "variable_if", name: "zoom_activated", value: 1 },
        ],
      },
      // First press: activate Zoom and set flag
      {
        type: "basic",
        from: {
          key_code: "f5",
          modifiers: { optional: ["any"] },
        },
        to: [
          { shell_command: "open -a 'zoom.us.app'" },
          { set_variable: { name: "zoom_activated", value: 1 } },
        ],
        conditions: [
          { type: "variable_if", name: "hyper", value: 1 },
          { type: "variable_if", name: "zoom_activated", value: 0 },
        ],
      },
    ],
  },
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
  // Option+Tab for previous tab (useful for switching tabs in VSCode, Cursor, Chrome, etc.)
  {
    description: "Option+Tab -> Ctrl+Shift+Tab (Previous Tab)",
    manipulators: [
      {
        type: "basic",
        from: {
          key_code: "tab",
          modifiers: {
            mandatory: ["option"],
            optional: ["caps_lock"],
          },
        },
        to: [
          {
            key_code: "tab",
            modifiers: ["left_control", "left_shift"],
          },
        ],
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
