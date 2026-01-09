import fs from "fs";
import { KarabinerRules, KeyCode } from "./types";
import {
  createHyperSubLayers,
  app,
  open,
  window,
  shell,
  LEADER_KEY_TIMEOUT_MS,
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
      c: open("https://calendar.google.com/calendar/u/2/r?pli=1"),
      d: open("app.dropbox.com"),
      g: open("https://gemini.google.com/u/1/app?pageId=none"),
      h: open("https://www.youtube.com/feed/history"),
      o: open("https://chat.openai.com/chat"),
      p: open("https://neurohelp-pitch.vercel.app/?log=debug"),
      r: open("https://reddit.com"),
      t: open("https://my.timeless.day/"),
      u: open("https://app.clickup.com/3843235/v/b/7-3843235-2"),
      x: open("https://x.com"),
      y: open("https://www.youtube.com"),
    },
  },

  q: {
    title: "Query",
    commands: {
      e: open("raycast://extensions/raycast/emoji-symbols/search-emoji-symbols"),
      f: open("raycast://extensions/raycast/file-search/search-files"),
      g: open("raycast://extensions/mblode/google-search/index"),
      l: {
        description: "LastPass",
        to: [{ key_code: "5", modifiers: ["left_control", "left_shift"] }],
      },q
    },
  },

  o: {
    title: "Open Apps",
    commands: {
      c: app("ChatGPT"),
      d: open("~/Downloads"),
      f: app("raycast://script-commands/new-finder-instance"),
      i: app("raycast://script-commands/run-vlc-with-iptv"),
      l: app("LastPass for Desktop"),
      m: app("Spotify"),
      s: app("Slack"),
      t: app("Ghostty"),
      v: app("VLC"),
      w: app("WhatsApp"),
      y: shell`open -a Safari https://music.youtube.com`,
      z: app("zoom.us"),
    },
  },

  w: {
    title: "Window",
    commands: {
      b: window("bottom-half"),
      d: window("next-display"),
      t: window("top-half"),
    },
  },

  s: {
    title: "System",
    commands: {
      b: open("raycast://extensions/raycast/system/toggle-bluetooth"),
      c: open("raycast://extensions/raycast/system/open-camera"),
      d: open("raycast://extensions/yakitrak/do-not-disturb/toggle?launchType=background"),
      t: open("raycast://extensions/raycast/system/toggle-system-appearance"),
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
      c: open("raycast://extensions/thomas/color-picker/pick-color"),
      e: open("raycast://extensions/raycast/emoji-symbols/search-emoji-symbols"),
      h: open("raycast://extensions/raycast/clipboard-history/clipboard-history"),
      l: open("raycast://extensions/stellate/mxstbr-commands/create-mxs-is-shortlink"),
      n: open("raycast://script-commands/dismiss-notifications"),
      p: open("raycast://extensions/raycast/raycast/confetti"),
      s: open("/Users/shay/.config/raycast/scripts/"),
    },
  },
};

/**
 * Direct hyper shortcuts (non-sublayer, instant with modifiers).
 * Single source of truth for both rule generation and documentation.
 */
export const directHyperShortcuts: {
  key: KeyCode;
  keyDisplay: string;
  description: string;
  action: string; // shell_command
}[] = [
  { key: "left_arrow", keyDisplay: "←", description: "Window Left Half", action: "open -g raycast://extensions/raycast/window-management/left-half" },
  { key: "right_arrow", keyDisplay: "→", description: "Window Right Half", action: "open -g raycast://extensions/raycast/window-management/right-half" },
  { key: "up_arrow", keyDisplay: "↑", description: "Maximize Window", action: "open -g raycast://extensions/raycast/window-management/maximize" },
  { key: "down_arrow", keyDisplay: "↓", description: "Restore Window", action: "open -g raycast://extensions/raycast/window-management/restore" },
  { key: "1", keyDisplay: "1", description: "Google Calendar", action: "open 'https://calendar.google.com/calendar/u/2/r?pli=1'" },
  { key: "2", keyDisplay: "2", description: "Gmail", action: "open 'https://mail.google.com/mail/u/2/#inbox'" },
  { key: "3", keyDisplay: "3", description: "ClickUp Inbox", action: "open 'https://app.clickup.com/3843235/inbox?tab=primary'" },
  { key: "f3", keyDisplay: "F3", description: "Google Chrome", action: "open -a 'Google Chrome.app'" },
  { key: "non_us_backslash", keyDisplay: "§", description: "Noiseless", action: "open 'raycast://script-commands/noiseless'" },
  { key: "escape", keyDisplay: "Esc", description: "Meckano", action: "open 'https://app.meckano.co.il'" },
];

/**
 * General (non-hyper) shortcuts - for documentation only.
 * These rules have complex structures that don't fit a simple pattern.
 */
export const generalShortcuts: { keys: string; description: string }[] = [
  { keys: "◆ (alone)", description: "Escape" },
  { keys: "⌘Q ⌘Q", description: "Quit App (double-tap)" },
  { keys: "⌥Tab", description: "Previous Tab" },
  { keys: "⌘H", description: "Disabled (except IDE)" },
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
          mandatory: [
            "left_command",
            "left_control",
            "left_option",
            "left_shift",
          ] as const,
        },
      },
      to: [{ shell_command: shortcut.action }],
    })),
  };
}

// ============================================================================
// Karabiner Rules
// ============================================================================

const rules: KarabinerRules[] = [
  // Define the Hyper key itself (leader key style - tap and release, then press next key within timeout)
  {
    description: "Hyper Key (⌃⌥⇧⌘)",
    manipulators: [
      {
        description:
          "Caps Lock -> Hyper Key (leader key style + modifiers for instant arrow keys)",
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
          // Also send actual hyper modifiers for instant key detection
          {
            key_code: "left_shift",
            modifiers: ["left_command", "left_control", "left_option"],
          },
        ],
        // Leader key style: don't reset immediately on key up, use delayed action instead
        to_delayed_action: {
          // If timeout expires without pressing another key, reset hyper
          to_if_invoked: [
            {
              set_variable: {
                name: "hyper",
                value: 0,
              },
            },
          ],
          // If another key is pressed, keep hyper active (the sublayer/command will handle cleanup)
          to_if_canceled: [
            {
              set_variable: {
                name: "hyper",
                value: 1,
              },
            },
          ],
        },
        to_after_key_up: [
          {
            set_variable: {
              name: "hyper",
              value: 0,
            },
          },
        ],
        to_if_alone: [
          {
            key_code: "escape",
          },
        ],
        parameters: {
          "basic.to_delayed_action_delay_milliseconds": LEADER_KEY_TIMEOUT_MS,
        },
        type: "basic",
      },
      //      {
      //        type: "basic",
      //        description: "Disable CMD + Tab to force Hyper Key usage",
      //        from: {
      //          key_code: "tab",
      //          modifiers: {
      //            mandatory: ["left_command"],
      //          },
      //        },
      //        to: [
      //          {
      //            key_code: "tab",
      //          },
      //        ],
      //      },
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
        parameters: {
          "basic.to_delayed_action_delay_milliseconds": 300,
        },
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
            "basic.to_delayed_action_delay_milliseconds": 500,
          },
        },
      ],
    },
    null,
    2
  )
);
