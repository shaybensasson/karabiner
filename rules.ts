import fs from "fs";
import { KarabinerRules } from "./types";
import { createHyperSubLayers, app, open, window, shell, osascript, LEADER_KEY_TIMEOUT_MS, DOUBLE_TAP_DELAY_MS } from "./utils";

const rules: KarabinerRules[] = [
  // Define the Hyper key itself (leader key style - tap and release, then press next key within timeout)
  {
    description: "Hyper Key (⌃⌥⇧⌘)",
    manipulators: [
      {
        description: "Caps Lock -> Hyper Key (leader key style + modifiers for instant arrow keys)",
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
  // Window management with hyper + arrow keys (instant, uses actual modifiers)
  {
    description: "Hyper + Arrow keys for window management",
    manipulators: [
      {
        type: "basic",
        from: {
          key_code: "left_arrow",
          modifiers: {
            mandatory: ["left_command", "left_control", "left_option", "left_shift"],
          },
        },
        to: [
          { shell_command: "open -g raycast://extensions/raycast/window-management/left-half" },
        ],
      },
      {
        type: "basic",
        from: {
          key_code: "right_arrow",
          modifiers: {
            mandatory: ["left_command", "left_control", "left_option", "left_shift"],
          },
        },
        to: [
          { shell_command: "open -g raycast://extensions/raycast/window-management/right-half" },
        ],
      },
      {
        type: "basic",
        from: {
          key_code: "up_arrow",
          modifiers: {
            mandatory: ["left_command", "left_control", "left_option", "left_shift"],
          },
        },
        to: [
          { shell_command: "open -g raycast://extensions/raycast/window-management/maximize" },
        ],
      },
      {
        type: "basic",
        from: {
          key_code: "down_arrow",
          modifiers: {
            mandatory: ["left_command", "left_control", "left_option", "left_shift"],
          },
        },
        to: [
          { shell_command: "open -g raycast://extensions/raycast/window-management/restore" },
        ],
      },
    ],
  },
  // Double-tap Hyper+O to open Obsidian (requires capslock held, fast double-tap)
  // {
  //   description: "Double-tap Hyper+O to open Obsidian",
  //   manipulators: [
  //     {
  //       type: "basic",
  //       from: {
  //         key_code: "o",
  //         modifiers: {
  //           mandatory: ["left_command", "left_control", "left_option", "left_shift"],
  //         },
  //       },
  //       to: [
  //         {
  //           set_variable: {
  //             name: "hyper_o_pressed",
  //             value: 1,
  //           },
  //         },
  //       ],
  //       to_delayed_action: {
  //         to_if_invoked: [
  //           {
  //             set_variable: {
  //               name: "hyper_o_pressed",
  //               value: 0,
  //             },
  //           },
  //         ],
  //         to_if_canceled: [
  //           {
  //             set_variable: {
  //               name: "hyper_o_pressed",
  //               value: 1,
  //             },
  //           },
  //         ],
  //       },
  //       conditions: [
  //         {
  //           type: "variable_if",
  //           name: "hyper_o_pressed",
  //           value: 0,
  //         },
  //       ],
  //       parameters: {
  //         "basic.to_delayed_action_delay_milliseconds": DOUBLE_TAP_DELAY_MS, // double-tap window
  //       },
  //     },
  //     {
  //       type: "basic",
  //       from: {
  //         key_code: "o",
  //         modifiers: {
  //           mandatory: ["left_command", "left_control", "left_option", "left_shift"],
  //         },
  //       },
  //       to: [
  //         {
  //           shell_command: "open -a 'Obsidian.app'",
  //         },
  //         {
  //           set_variable: {
  //             name: "hyper_o_pressed",
  //             value: 0,
  //           },
  //         },
  //       ],
  //       conditions: [
  //         {
  //           type: "variable_if",
  //           name: "hyper_o_pressed",
  //           value: 1,
  //         },
  //         {
  //           type: "variable_if",
  //           name: "hyper",
  //           value: 1,
  //         },
  //       ],
  //     },
  //   ],
  // },
  // Double-tap Hyper+B to open browser bookmarks (requires capslock held, fast double-tap)
  // {
  //   description: "Double-tap Hyper+B to open browser bookmarks",
  //   manipulators: [
  //     {
  //       type: "basic",
  //       from: {
  //         key_code: "b",
  //         modifiers: {
  //           mandatory: ["left_command", "left_control", "left_option", "left_shift"],
  //         },
  //       },
  //       to: [
  //         {
  //           set_variable: {
  //             name: "hyper_b_pressed",
  //             value: 1,
  //           },
  //         },
  //       ],
  //       to_delayed_action: {
  //         to_if_invoked: [
  //           {
  //             set_variable: {
  //               name: "hyper_b_pressed",
  //               value: 0,
  //             },
  //           },
  //         ],
  //         to_if_canceled: [
  //           {
  //             set_variable: {
  //               name: "hyper_b_pressed",
  //               value: 1,
  //             },
  //           },
  //         ],
  //       },
  //       conditions: [
  //         {
  //           type: "variable_if",
  //           name: "hyper_b_pressed",
  //           value: 0,
  //         },
  //       ],
  //       parameters: {
  //         "basic.to_delayed_action_delay_milliseconds": DOUBLE_TAP_DELAY_MS, // double-tap window
  //       },
  //     },
  //     {
  //       type: "basic",
  //       from: {
  //         key_code: "b",
  //         modifiers: {
  //           mandatory: ["left_command", "left_control", "left_option", "left_shift"],
  //         },
  //       },
  //       to: [
  //         {
  //           shell_command: "open raycast://extensions/raycast/browser-bookmarks/index",
  //         },
  //         {
  //           set_variable: {
  //             name: "hyper_b_pressed",
  //             value: 0,
  //           },
  //         },
  //       ],
  //       conditions: [
  //         {
  //           type: "variable_if",
  //           name: "hyper_b_pressed",
  //           value: 1,
  //         },
  //         {
  //           type: "variable_if",
  //           name: "hyper",
  //           value: 1,
  //         },
  //       ],
  //     },
  //   ],
  // },
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
  ...createHyperSubLayers({
    // Note: Arrow keys for window management are handled above with simultaneous detection (instant, no delay)

    // spacebar: open(
    //   "raycast://extensions/stellate/mxstbr-commands/create-notion-todo"
    // ),
    // NOTE: shayb | 08-01-26 | we are using this for
    
    // NOTE: shayb | 08-01-26 | we use caps-lock+F to Bring all windows to front in our System Settings -> Keyboard shortcuts
    // see https://gemini.google.com/u/1/app/bc1eb29aedd643ec?pageId=none
    
    // b = "B"rowse
    b: {
      c: open("https://calendar.google.com/calendar/u/2/r?pli=1"), // Google NeuroHelp "C"alendar
      r: open("https://reddit.com"),
      h: open("https://www.youtube.com/feed/history"), // YouTube "H"istory
      m: open("https://app.meckano.co.il/"), // M"E"ckano
      
      y: open("https://www.youtube.com"), // "Y"outube
      
      x: open("https://x.com"),
      // m: open("https://music.youtube.com"),                     // YouTube "M"usic

      u: open("https://app.clickup.com/3843235/v/b/7-3843235-2"), // Click"U"p
      t: open("https://my.timeless.day/"),
      // b: open("raycast://extensions/raycast/browser-bookmarks/index"), // Moved to double-tap hyper+b rule
      p: open("https://neurohelp-pitch.vercel.app/?log=debug"), // NeuroHelp Pitch (e"X"perimental)
      
      o: open("https://chat.openai.com/chat"),                  // "C"hatGPT
      g: open("https://gemini.google.com/u/1/app?pageId=none"), // Gemini
    },
    // q = "Q"uery
    // Should all be deep links
    q: {
      g: open("raycast://extensions/mblode/google-search/index"), // "G"oogle Search
      e: open("raycast://extensions/raycast/emoji-symbols/search-emoji-symbols"), // "E"moji Search
      l: {
        description: "Find: LastPass",
        to: [
          {
            key_code: "5",
            modifiers: ["left_control", "left_shift"],
          },
        ],
      },
      f: open("raycast://extensions/raycast/file-search/search-files"), // "F"ind Files
      // todo: create it in raycast
    },
    // o = "Open" applications
    o: {
      a: app("Safari"),
      l: app("LastPass for Desktop"),
      b: app("Google Chrome"),
      // Local
      d: open("~/Downloads"),                                    // "O"pen Downloads
      // c: app("Calendar"),
      c: app("ChatGPT"), 
      // v: app("Zed"),
      // d: app("Discord"),
      s: app("Slack"),
      // e: app("Superhuman"),
      // n: app("Notion"),
      t: app("Ghostty"),
      // Open todo list managed via *H*ypersonic
      // h: open(
      //   "notion://www.notion.so/stellatehq/7b33b924746647499d906c55f89d5026"
      // ),
      z: app("zoom.us"),
      // "M"arkdown (Reflect.app)
      // m: app("Reflect"),
      // r: app("Reflect"),
      f: app("Finder"),
      // "i"Message
      // i: app("Texts"),
      m: app("Spotify"),
      // a: app("iA Presenter"),
      w: app("WhatsApp"),
      // o: app("Obsidian"), // Moved to double-tap hyper+o rule
      y: shell`open -a Safari https://music.youtube.com`,          // "Y"outube Music (Safari)

      i: app("raycast://script-commands/run-vlc-with-iptv"),
      v: app("VLC"),

      // l: open(
      //   "raycast://extensions/stellate/mxstbr-commands/open-mxs-is-shortlink"
      // ),
    },

    // TODO: This doesn't quite work yet.
    // l = "Layouts" via Raycast's custom window management
    // l: {
    //   // Coding layout
    //   c: shell`
    //     open -a "Visual Studio Code.app"
    //     sleep 0.2
    //     open -g "raycast://customWindowManagementCommand?position=topLeft&relativeWidth=0.5"

    //     open -a "Terminal.app"
    //     sleep 0.2
    //     open -g "raycast://customWindowManagementCommand?position=topRight&relativeWidth=0.5"
    //   `,
    // },

    // w = "Window"
    w: {
      semicolon: {
        description: "Window: Hide",
        to: [
          {
            key_code: "h",
            modifiers: ["right_command"],
          },
        ],
      },
      // y: window("previous-display"),
      d: window("next-display"),
      // k: window("top-half"),
      // j: window("bottom-half"),
      // Arrow keys moved to direct hyper shortcuts (capslock+arrow)
      
      u: {
        description: "Window: Previous Tab",
        to: [
          {
            key_code: "tab",
            modifiers: ["right_control", "right_shift"],
          },
        ],
      },
      i: {
        description: "Window: Next Tab",
        to: [
          {
            key_code: "tab",
            modifiers: ["right_control"],
          },
        ],
      },
      // TODO: shayb | 07-01-26 | fix
      n: {
        description: "Window: Next Window",
        to: [
          {
          key_code: "grave_accent_and_tilde",
            modifiers: ["right_command"],
          },
        ],
      },
      b: {
        description: "Window: Back",
        to: [
          {
            key_code: "open_bracket",
            modifiers: ["right_command"],
          },
        ],
      },
      // Note: No literal connection. Both f and n are already taken.
      m: {
        description: "Window: Forward",
        to: [
          {
            key_code: "close_bracket",
            modifiers: ["right_command"],
          },
        ],
      },
    },

    // s = "System"
    s: {
      u: {
        to: [
          {
            key_code: "volume_increment",
          },
        ],
      },
      j: {
        to: [
          {
            key_code: "volume_decrement",
          },
        ],
      },
      // i: {
      //   to: [
      //     {
      //       key_code: "display_brightness_increment",
      //     },
      //   ],
      // },
      // k: {
      //   to: [
      //     {
      //       key_code: "display_brightness_decrement",
      //     },
      //   ],
      // },
      l: {
        to: [
          {
            key_code: "q",
            modifiers: ["right_control", "right_command"],
          },
        ],
      },
      p: {
        to: [
          {
            key_code: "play_or_pause",
          },
        ],
      },
      semicolon: {
        to: [
          {
            key_code: "fastforward",
          },
        ],
      },
      // FUTURE: shayb | 07-01-26 | Should we?
      // e: open(
      //   `raycast://extensions/thomas/elgato-key-light/toggle?launchType=background`
      // ),
      // "D"o not disturb toggle
      d: open(
        `raycast://extensions/yakitrak/do-not-disturb/toggle?launchType=background`
      ),
      // "T"heme
      t: open(`raycast://extensions/raycast/system/toggle-system-appearance`),
      c: open("raycast://extensions/raycast/system/open-camera"),
      // 'v'oice
      v: {
        to: [
          {
            key_code: "spacebar",
            modifiers: ["left_option"],
          },
        ],
      },
    },

    // v = "moVe" which isn't "m" because we want it to be on the left hand
    // so that hjkl work like they do in vim
    v: {
      h: {
        to: [{ key_code: "left_arrow" }],
      },
      j: {
        to: [{ key_code: "down_arrow" }],
      },
      k: {
        to: [{ key_code: "up_arrow" }],
      },
      l: {
        to: [{ key_code: "right_arrow" }],
      },
      // Magicmove via homerow.app
      m: {
        to: [{ key_code: "f", modifiers: ["right_control"] }],
        // TODO: Trigger Vim Easymotion when VSCode is focused
      },
      // Scroll mode via homerow.app
      s: {
        to: [{ key_code: "j", modifiers: ["right_control"] }],
      },
      d: {
        to: [{ key_code: "d", modifiers: ["right_shift", "right_command"] }],
      },
      u: {
        to: [{ key_code: "page_down" }],
      },
      i: {
        to: [{ key_code: "page_up" }],
      },
    },

    // c = Musi*c* which isn't "m" because we want it to be on the left hand
    c: {
      p: {
        to: [{ key_code: "play_or_pause" }],
      },
      n: {
        to: [{ key_code: "fastforward" }],
      },
      b: {
        to: [{ key_code: "rewind" }],
      },
    },

    // r = "Raycast"
    r: {
      c: open("raycast://extensions/thomas/color-picker/pick-color"),
      n: open("raycast://script-commands/dismiss-notifications"),
      l: open(
        "raycast://extensions/stellate/mxstbr-commands/create-mxs-is-shortlink"
      ),
      e: open(
        "raycast://extensions/raycast/emoji-symbols/search-emoji-symbols"
      ),
      p: open("raycast://extensions/raycast/raycast/confetti"),
      // a: open("raycast://extensions/raycast/raycast-ai/ai-chat"),
      // s: open("raycast://extensions/peduarte/silent-mention/index"),
      s: open("/Users/shay/.config/raycast/scripts/"),          // "R"aycast Scripts (Cursor)
      h: open(
        "raycast://extensions/raycast/clipboard-history/clipboard-history"
      ),
      // 1: open(
      //   "raycast://extensions/VladCuciureanu/toothpick/connect-favorite-device-1"
      // ),
      // 2: open(
      //   "raycast://extensions/VladCuciureanu/toothpick/connect-favorite-device-2"
      // ),
    },
  }),
  // {
  //   description: "Change Backspace to Spacebar when Minecraft is focused",
  //   manipulators: [
  //     {
  //       type: "basic",
  //       from: {
  //         key_code: "delete_or_backspace",
  //       },
  //       to: [
  //         {
  //           key_code: "spacebar",
  //         },
  //       ],
  //       conditions: [
  //         {
  //           type: "frontmost_application_if",
  //           file_paths: [
  //             "^/Users/mxstbr/Library/Application Support/minecraft/runtime/java-runtime-gamma/mac-os-arm64/java-runtime-gamma/jre.bundle/Contents/Home/bin/java$",
  //           ],
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
            "basic.to_delayed_action_delay_milliseconds": 500,
          },
        },
      ],
    },
    null,
    2
  )
);
