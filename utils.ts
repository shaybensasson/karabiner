import { To, KeyCode, Manipulator, KarabinerRules } from "./types";

/**
 * Leader key timeout in milliseconds.
 * After pressing the hyper key (or a sublayer key), you have this many ms to press the next key.
 */
export const LEADER_KEY_TIMEOUT_MS = 500;

/**
 * Double tap delay in milliseconds.
 * After pressing the hyper key and a sublayer key, you have this many ms to press the sublayer key again.
 */

export const DOUBLE_TAP_DELAY_MS = 500;

/**
 * Custom way to describe a command in a layer
 */
export interface LayerCommand {
  to: To[];
  description?: string;
}

/**
 * A sublayer with commands mapped to key codes
 */
export type HyperKeySublayer = {
  // The ? is necessary, otherwise we'd have to define something for _every_ key code
  [key_code in KeyCode]?: LayerCommand;
};

/**
 * A sublayer with metadata (title) for documentation generation
 */
export interface SubLayerWithMeta {
  title: string;
  commands: HyperKeySublayer;
}

/**
 * Input type for createHyperSubLayers - can be:
 * - LayerCommand (direct command)
 * - HyperKeySublayer (sublayer without title - legacy)
 * - SubLayerWithMeta (sublayer with title)
 */
export type HyperSubLayerInput = LayerCommand | HyperKeySublayer | SubLayerWithMeta;

/**
 * Check if input is a SubLayerWithMeta
 */
export function isSubLayerWithMeta(input: HyperSubLayerInput): input is SubLayerWithMeta {
  return "title" in input && "commands" in input;
}

/**
 * Check if input is a direct LayerCommand
 */
export function isLayerCommand(input: HyperSubLayerInput): input is LayerCommand {
  return "to" in input;
}

/**
 * Create a Hyper Key sublayer, where every command is prefixed with a key
 * e.g. Hyper + O ("Open") is the "open applications" layer, I can press
 * e.g. Hyper + O + G ("Google Chrome") to open Chrome
 *
 * Leader key style: tap hyper, release, tap sublayer key, release, tap command key
 */
export function createHyperSubLayer(
  sublayer_key: KeyCode,
  commands: HyperKeySublayer,
  allSubLayerVariables: string[]
): Manipulator[] {
  const subLayerVariableName = generateSubLayerVariableName(sublayer_key);

  return [
    // When Hyper + sublayer_key is pressed, set the variable to 1
    // Leader key style: use delayed action instead of immediate reset on key_up
    {
      description: `Toggle Hyper sublayer ${sublayer_key} (leader key style)`,
      type: "basic",
      from: {
        key_code: sublayer_key,
        modifiers: {
          optional: ["any"],
        },
      },
      to: [
        {
          set_variable: {
            name: subLayerVariableName,
            value: 1,
          },
        },
      ],
      // Leader key style: don't reset immediately on key up, use delayed action instead
      to_delayed_action: {
        // If timeout expires without pressing another key, reset sublayer and hyper
        to_if_invoked: [
          {
            set_variable: {
              name: subLayerVariableName,
              value: 0,
            },
          },
          {
            set_variable: {
              name: "hyper",
              value: 0,
            },
          },
        ],
        // If another key is pressed, keep sublayer active (the command will handle cleanup)
        to_if_canceled: [
          {
            set_variable: {
              name: subLayerVariableName,
              value: 1,
            },
          },
        ],
      },
      parameters: {
        "basic.to_delayed_action_delay_milliseconds": LEADER_KEY_TIMEOUT_MS,
      },
      // This enables us to press other sublayer keys in the current sublayer
      // (e.g. Hyper + O > M even though Hyper + M is also a sublayer)
      // basically, only trigger a sublayer if no other sublayer is active
      // Also check that THIS sublayer is not already active (for double-tap same key)
      conditions: [
        {
          type: "variable_if",
          name: subLayerVariableName,
          value: 0,
        },
        ...allSubLayerVariables
          .filter(
            (subLayerVariable) => subLayerVariable !== subLayerVariableName
          )
          .map((subLayerVariable) => ({
            type: "variable_if" as const,
            name: subLayerVariable,
            value: 0,
          })),
        {
          type: "variable_if",
          name: "hyper",
          value: 1,
        },
      ],
    },
    // Define the individual commands that are meant to trigger in the sublayer
    ...(Object.keys(commands) as (keyof typeof commands)[]).map(
      (command_key): Manipulator => {
        const command = commands[command_key]!;
        return {
          ...command,
          // Add cleanup: reset sublayer and hyper after command execution
          to: [
            ...(command.to || []),
            {
              set_variable: {
                name: subLayerVariableName,
                value: 0,
              },
            },
            {
              set_variable: {
                name: "hyper",
                value: 0,
              },
            },
          ],
          type: "basic" as const,
          from: {
            key_code: command_key,
            modifiers: {
              optional: ["any"],
            },
          },
          // Only trigger this command if the variable is 1 (i.e., if sublayer is active)
          conditions: [
            {
              type: "variable_if",
              name: subLayerVariableName,
              value: 1,
            },
          ],
        };
      }
    ),
  ];
}

/**
 * Validate that no mirror pairs exist (e.g., if ◆+A B exists, then ◆+B A should not exist).
 * This prevents confusing shortcuts where the order of keys could be mixed up.
 */
function validateSubLayerKeyConflicts(subLayers: {
  [key_code in KeyCode]?: HyperSubLayerInput;
}): void {
  // Build a map of all pairs: leader -> secondary[]
  const pairs = new Map<string, Set<string>>();
  for (const [leaderKey, sublayer] of Object.entries(subLayers)) {
    // Skip direct commands (they have a 'to' property)
    if (isLayerCommand(sublayer)) continue;
    // Handle SubLayerWithMeta (has 'commands' property)
    const commands = isSubLayerWithMeta(sublayer) ? sublayer.commands : sublayer;
    pairs.set(leaderKey, new Set(Object.keys(commands)));
  }

  // Check for mirror pairs
  const conflicts: string[] = [];
  const checked = new Set<string>();

  for (const [leaderA, secondaryKeys] of pairs) {
    for (const secondaryB of secondaryKeys) {
      // Check if the mirror exists: leaderB has secondaryA
      const leaderBSecondaries = pairs.get(secondaryB);
      if (leaderBSecondaries?.has(leaderA)) {
        // Create a unique key to avoid duplicate reports
        const pairKey = [leaderA, secondaryB].sort().join("-");
        if (!checked.has(pairKey)) {
          checked.add(pairKey);
          conflicts.push(
            `  - Mirror pair conflict: ◆+${leaderA.toUpperCase()} ${secondaryB.toUpperCase()} and ◆+${secondaryB.toUpperCase()} ${leaderA.toUpperCase()}`
          );
        }
      }
    }
  }

  if (conflicts.length > 0) {
    throw new Error(
      `Karabiner config validation failed!\n` +
        `Mirror pairs are not allowed (could cause confusion):\n` +
        conflicts.join("\n")
    );
  }
}

/**
 * Create all hyper sublayers. This needs to be a single function, as well need to
 * have all the hyper variable names in order to filter them and make sure only one
 * activates at a time
 */
export function createHyperSubLayers(subLayers: {
  [key_code in KeyCode]?: HyperSubLayerInput;
}): KarabinerRules[] {
  // Validate that leader keys aren't used as secondary keys
  validateSubLayerKeyConflicts(subLayers);

  const allSubLayerVariables = (
    Object.keys(subLayers) as (keyof typeof subLayers)[]
  ).map((sublayer_key) => generateSubLayerVariableName(sublayer_key));

  return Object.entries(subLayers).map(([key, value]) => {
    // Direct command (has 'to' property)
    if (isLayerCommand(value)) {
      return {
        description: `Hyper Key + ${key}`,
        manipulators: [
          {
            ...value,
            // Add cleanup: reset hyper after command execution
            to: [
              ...(value.to || []),
              {
                set_variable: {
                  name: "hyper",
                  value: 0,
                },
              },
            ],
            type: "basic" as const,
            from: {
              key_code: key as KeyCode,
              modifiers: {
                optional: ["any"],
              },
            },
            conditions: [
              {
                type: "variable_if",
                name: "hyper",
                value: 1,
              },
              ...allSubLayerVariables.map((subLayerVariable) => ({
                type: "variable_if" as const,
                name: subLayerVariable,
                value: 0,
              })),
            ],
          },
        ],
      };
    }

    // Sublayer with metadata (has 'title' and 'commands')
    if (isSubLayerWithMeta(value)) {
      return {
        description: `Hyper Key sublayer "${key}" (${value.title})`,
        manipulators: createHyperSubLayer(
          key as KeyCode,
          value.commands,
          allSubLayerVariables
        ),
      };
    }

    // Legacy sublayer (plain object with commands)
    return {
      description: `Hyper Key sublayer "${key}"`,
      manipulators: createHyperSubLayer(
        key as KeyCode,
        value as HyperKeySublayer,
        allSubLayerVariables
      ),
    };
  });
}

function generateSubLayerVariableName(key: KeyCode) {
  return `hyper_sublayer_${key}`;
}

/**
 * Shortcut for "open" shell command
 */
export function open(what: string, description?: string): LayerCommand {
  return {
    to: [{ shell_command: `open ${what}` }],
    description: description ?? what,
  };
}

/**
 * Shortcut for "osascript" shell command (AppleScript)
 */
export function osascript(...scripts: string[]): LayerCommand {
  return {
    to: scripts.map((script) => ({
      shell_command: `osascript -e '${script}'`,
    })),
    description: `Run AppleScript: ${scripts.join(" & ")}`,
  };
}

/**
 * Utility function to create a LayerCommand from a tagged template literal
 * where each line is a shell command to be executed.
 */
export function shell(
  strings: TemplateStringsArray,
  ...values: unknown[]
): LayerCommand {
  const commands = strings.reduce((acc, str, i) => {
    const value = i < values.length ? values[i] : "";
    const lines = (str + value)
      .split("\n")
      .filter((line) => line.trim() !== "");
    acc.push(...lines);
    return acc;
  }, [] as string[]);

  return {
    to: commands.map((command) => ({
      shell_command: command.trim(),
    })),
    description: commands.join(" && "),
  };
}

/**
 * Shortcut for a shell command with description
 */
export function shellCmd(command: string, description?: string): LayerCommand {
  return {
    to: [{ shell_command: command }],
    description: description ?? command,
  };
}

/**
 * Shortcut for managing window sizing
 */
export function window(name: string, description?: string): LayerCommand {
  return {
    to: [
      {
        shell_command: `open -g raycast://extensions/raycast/window-management/${name}`,
      },
    ],
    description: description ?? name,
  };
}

/**
 * Shortcut for "Open an app" command (of which there are a bunch)
 */
export function app(name: string, description?: string): LayerCommand {
  return open(`-a '${name}.app'`, description ?? name);
}
