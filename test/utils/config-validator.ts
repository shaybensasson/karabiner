import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KARABINER_CONFIG_PATH = join(__dirname, "../../karabiner.json");

interface To {
  shell_command?: string;
  key_code?: string;
  modifiers?: string[];
  set_variable?: { name: string; value: number | string | boolean };
}

interface Manipulator {
  type: string;
  from: { key_code?: string; modifiers?: { mandatory?: string[]; optional?: string[] } };
  to?: To[];
  conditions?: Array<{ type: string; name: string; value: number | string | boolean }>;
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
}

interface KarabinerConfig {
  profiles?: Profile[];
}

/**
 * Load and parse the karabiner.json config
 */
export function loadConfig(): KarabinerConfig {
  const content = readFileSync(KARABINER_CONFIG_PATH, "utf-8");
  return JSON.parse(content);
}

/**
 * Get all manipulators from the Default profile
 */
export function getManipulators(profileName: string = "Default"): Manipulator[] {
  const config = loadConfig();
  const profile = config.profiles?.find((p) => p.name === profileName);
  if (!profile) throw new Error(`Profile "${profileName}" not found`);

  const manipulators: Manipulator[] = [];
  for (const rule of profile.complex_modifications?.rules || []) {
    manipulators.push(...(rule.manipulators || []));
  }
  return manipulators;
}

/**
 * Find a direct hyper shortcut by key code
 */
export function findDirectHyperShortcut(
  keyCode: string,
  profileName: string = "Default"
): Manipulator | undefined {
  const manipulators = getManipulators(profileName);
  return manipulators.find(
    (m) =>
      m.from.key_code === keyCode &&
      m.conditions?.some(
        (c) => c.type === "variable_if" && c.name === "hyper" && c.value === 1
      )
  );
}

/**
 * Find a sublayer command by sublayer key and command key
 */
export function findSublayerCommand(
  sublayerKey: string,
  commandKey: string,
  profileName: string = "Default"
): Manipulator | undefined {
  const manipulators = getManipulators(profileName);
  const sublayerVarName = `hyper_sublayer_${sublayerKey}`;

  return manipulators.find(
    (m) =>
      m.from.key_code === commandKey &&
      m.conditions?.some(
        (c) => c.type === "variable_if" && c.name === sublayerVarName && c.value === 1
      )
  );
}

/**
 * Get the shell command from a manipulator's to array
 */
export function getShellCommand(manipulator: Manipulator): string | undefined {
  return manipulator.to?.find((t) => t.shell_command)?.shell_command;
}

/**
 * Get the key code from a manipulator's to array
 */
export function getToKeyCode(manipulator: Manipulator): string | undefined {
  return manipulator.to?.find((t) => t.key_code && !t.set_variable)?.key_code;
}

/**
 * Check if a shell command opens an app
 */
export function extractAppName(shellCommand: string): string | undefined {
  const match = shellCommand.match(/open\s+(?:-[a-z]\s+)*-a\s+['"]?([^'"]+?)(?:\.app)?['"]?(?:\s|$)/);
  return match?.[1];
}

/**
 * Check if a shell command opens a URL
 */
export function extractUrl(shellCommand: string): string | undefined {
  const match = shellCommand.match(/(https?:\/\/[^\s'"]+)/);
  return match?.[1];
}

/**
 * Check if a shell command is a Raycast command
 */
export function extractRaycastCommand(shellCommand: string): string | undefined {
  const match = shellCommand.match(/raycast:\/\/([^\s'"]+)/);
  return match?.[1];
}

/**
 * Validate that a direct hyper shortcut exists and has the expected action
 */
export interface ValidationResult {
  valid: boolean;
  found: boolean;
  actualAction?: string;
  expectedAction?: string;
  error?: string;
}

export function validateDirectHyperShortcut(
  keyCode: string,
  expectedAction: { type: "app" | "url" | "raycast" | "key"; value: string }
): ValidationResult {
  const manipulator = findDirectHyperShortcut(keyCode);

  if (!manipulator) {
    return { valid: false, found: false, error: `No hyper shortcut found for key: ${keyCode}` };
  }

  const shellCmd = getShellCommand(manipulator);
  const toKeyCode = getToKeyCode(manipulator);

  let actualValue: string | undefined;
  let actualType: string;

  if (expectedAction.type === "key") {
    actualValue = toKeyCode;
    actualType = "key";
  } else if (shellCmd) {
    if (expectedAction.type === "app") {
      actualValue = extractAppName(shellCmd);
      actualType = "app";
    } else if (expectedAction.type === "url") {
      actualValue = extractUrl(shellCmd);
      actualType = "url";
    } else if (expectedAction.type === "raycast") {
      actualValue = extractRaycastCommand(shellCmd);
      actualType = "raycast";
    }
  }

  const valid = actualValue?.includes(expectedAction.value) ?? false;

  return {
    valid,
    found: true,
    actualAction: actualValue || shellCmd || toKeyCode,
    expectedAction: expectedAction.value,
  };
}

export function validateSublayerCommand(
  sublayerKey: string,
  commandKey: string,
  expectedAction: { type: "app" | "url" | "raycast" | "key" | "file"; value: string }
): ValidationResult {
  const manipulator = findSublayerCommand(sublayerKey, commandKey);

  if (!manipulator) {
    return {
      valid: false,
      found: false,
      error: `No sublayer command found for: ${sublayerKey} + ${commandKey}`,
    };
  }

  const shellCmd = getShellCommand(manipulator);
  const toKeyCode = getToKeyCode(manipulator);

  let actualValue: string | undefined;

  if (expectedAction.type === "key") {
    actualValue = toKeyCode;
  } else if (shellCmd) {
    if (expectedAction.type === "app") {
      actualValue = extractAppName(shellCmd);
    } else if (expectedAction.type === "url") {
      actualValue = extractUrl(shellCmd);
    } else if (expectedAction.type === "raycast") {
      actualValue = extractRaycastCommand(shellCmd);
    } else if (expectedAction.type === "file") {
      // For file/folder opens, check if the path is in the command
      actualValue = shellCmd.includes(expectedAction.value) ? expectedAction.value : undefined;
    }
  }

  const valid = actualValue?.includes(expectedAction.value) ?? false;

  return {
    valid,
    found: true,
    actualAction: actualValue || shellCmd || toKeyCode,
    expectedAction: expectedAction.value,
  };
}
