import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KARABINER_CONFIG_PATH = join(__dirname, "../../karabiner.json");
const ACTION_LOG_PATH = "/tmp/karabiner-test.log";

interface To {
  shell_command?: string;
  key_code?: string;
  modifiers?: string[];
  set_variable?: { name: string; value: number | string | boolean };
  hold_down_milliseconds?: number;
}

interface Manipulator {
  type: string;
  from: unknown;
  to?: To[];
  to_if_alone?: To[];
  to_if_held_down?: To[];
  to_after_key_up?: To[];
  to_delayed_action?: {
    to_if_invoked?: To[];
    to_if_canceled?: To[];
  };
  conditions?: unknown[];
  parameters?: unknown;
  description?: string;
}

interface Rule {
  description?: string;
  manipulators?: Manipulator[];
}

interface Profile {
  name: string;
  complex_modifications?: {
    rules?: Rule[];
  };
  virtual_hid_keyboard?: unknown;
  parameters?: unknown;
}

interface KarabinerConfig {
  global?: unknown;
  profiles?: Profile[];
}

/**
 * Transform a shell_command into a logging command.
 */
function transformShellCommand(cmd: string): string {
  // Parse different command types
  if (cmd.startsWith("open -a ") || cmd.startsWith("open -g -a ")) {
    // App opening: open -a 'Google Chrome.app' or open -a Slack
    // Handle quoted app names (supports spaces in names)
    let match = cmd.match(/open\s+(?:-g\s+)?-a\s+(['"])(.+?)\1/);
    if (match) {
      const appName = match[2].trim().replace(/\.app$/i, "");
      return `echo "ACTION:app:${appName}" >> ${ACTION_LOG_PATH}`;
    }
    // Handle unquoted app names (no spaces)
    match = cmd.match(/open\s+(?:-g\s+)?-a\s+(\S+)/);
    if (match) {
      const appName = match[1].trim().replace(/\.app$/i, "");
      return `echo "ACTION:app:${appName}" >> ${ACTION_LOG_PATH}`;
    }
  }

  if (cmd.includes("raycast://")) {
    // Raycast command
    const match = cmd.match(/raycast:\/\/([^\s'"]+)/);
    if (match) {
      return `echo "ACTION:raycast:${match[1]}" >> ${ACTION_LOG_PATH}`;
    }
  }

  if (cmd.startsWith("open ") && (cmd.includes("http://") || cmd.includes("https://"))) {
    // URL opening
    const match = cmd.match(/https?:\/\/[^\s'"]+/);
    if (match) {
      const url = new URL(match[0]);
      return `echo "ACTION:url:${url.hostname}${url.pathname}" >> ${ACTION_LOG_PATH}`;
    }
  }

  if (cmd.startsWith("open ~/") || cmd.startsWith("open /")) {
    // File/folder opening
    const match = cmd.match(/open\s+(['"]?)([^'"]+)\1/);
    if (match) {
      return `echo "ACTION:file:${match[2]}" >> ${ACTION_LOG_PATH}`;
    }
  }

  // Generic shell command
  const escaped = cmd.replace(/"/g, '\\"').substring(0, 50);
  return `echo "ACTION:shell:${escaped}" >> ${ACTION_LOG_PATH}`;
}

/**
 * Transform a key_code output into a logging command.
 */
function transformKeyCode(keyCode: string, modifiers?: string[]): To {
  const modStr = modifiers?.length ? `+${modifiers.join("+")}` : "";
  return {
    shell_command: `echo "ACTION:key:${keyCode}${modStr}" >> ${ACTION_LOG_PATH}`,
  };
}

/**
 * Transform a To array, replacing shell_command and key_code actions with logging.
 */
function transformToArray(toArray: To[] | undefined): To[] | undefined {
  if (!toArray) return undefined;

  return toArray.map((to) => {
    // Transform shell_command
    if (to.shell_command) {
      return {
        ...to,
        shell_command: transformShellCommand(to.shell_command),
      };
    }

    // Transform key_code (but keep set_variable and other actions)
    if (to.key_code && !to.set_variable) {
      return transformKeyCode(to.key_code, to.modifiers);
    }

    return to;
  });
}

/**
 * Transform a manipulator, replacing all action outputs with logging.
 */
function transformManipulator(manipulator: Manipulator): Manipulator {
  return {
    ...manipulator,
    to: transformToArray(manipulator.to),
    to_if_alone: transformToArray(manipulator.to_if_alone),
    to_if_held_down: transformToArray(manipulator.to_if_held_down),
    to_after_key_up: transformToArray(manipulator.to_after_key_up),
    to_delayed_action: manipulator.to_delayed_action
      ? {
          to_if_invoked: transformToArray(manipulator.to_delayed_action.to_if_invoked),
          to_if_canceled: transformToArray(manipulator.to_delayed_action.to_if_canceled),
        }
      : undefined,
  };
}

/**
 * Generate a test profile from the Default profile.
 */
export function generateTestProfile(): void {
  // Read existing config
  const configContent = readFileSync(KARABINER_CONFIG_PATH, "utf-8");
  const config: KarabinerConfig = JSON.parse(configContent);

  if (!config.profiles) {
    throw new Error("No profiles found in karabiner.json");
  }

  // Find the Default profile
  const defaultProfile = config.profiles.find((p) => p.name === "Default");
  if (!defaultProfile) {
    throw new Error("Default profile not found in karabiner.json");
  }

  // Remove existing Test profile if present
  config.profiles = config.profiles.filter((p) => p.name !== "Test");

  // Clone and transform the Default profile
  const testProfile: Profile = JSON.parse(JSON.stringify(defaultProfile));
  testProfile.name = "Test";

  // Transform all manipulators
  if (testProfile.complex_modifications?.rules) {
    testProfile.complex_modifications.rules = testProfile.complex_modifications.rules.map(
      (rule) => ({
        ...rule,
        manipulators: rule.manipulators?.map(transformManipulator),
      })
    );
  }

  // Add the Test profile
  config.profiles.push(testProfile);

  // Write the updated config
  writeFileSync(KARABINER_CONFIG_PATH, JSON.stringify(config, null, 2));

  console.log("Test profile generated successfully!");
  console.log(`Actions will be logged to: ${ACTION_LOG_PATH}`);
}

/**
 * Remove the test profile from karabiner.json.
 */
export function removeTestProfile(): void {
  const configContent = readFileSync(KARABINER_CONFIG_PATH, "utf-8");
  const config: KarabinerConfig = JSON.parse(configContent);

  if (!config.profiles) return;

  const hadTestProfile = config.profiles.some((p) => p.name === "Test");
  config.profiles = config.profiles.filter((p) => p.name !== "Test");

  if (hadTestProfile) {
    writeFileSync(KARABINER_CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log("Test profile removed.");
  }
}

// CLI entry point
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const command = process.argv[2];

  if (command === "remove") {
    removeTestProfile();
  } else {
    generateTestProfile();
  }
}
