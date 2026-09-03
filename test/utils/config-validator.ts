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
  repeat?: boolean;
  set_variable?: { name: string; value: number | string | boolean };
}

interface Manipulator {
  type: string;
  from: { key_code?: string; modifiers?: { mandatory?: string[]; optional?: string[] } };
  to?: To[];
  to_if_alone?: To[];
  to_if_held_down?: To[];
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
  // Match: open [-g] -a 'App Name.app' or open -na 'App Name.app' or open -a "App Name"
  // Use greedy matching and explicitly handle .app suffix
  const match = shellCommand.match(/open\s+(?:-[a-z]+\s+)*-n?a\s+['"]([^'"]+)['"]|open\s+(?:-[a-z]+\s+)*-n?a\s+(\S+)/);
  let appName = match?.[1] || match?.[2];
  // Remove .app suffix if present
  if (appName?.endsWith(".app")) {
    appName = appName.slice(0, -4);
  }
  if (appName) return appName;

  // Fallback: extract binary name from CLI commands (e.g., /usr/local/bin/cursor --new-window)
  const cliMatch = shellCommand.match(/(?:^|\/)([^/\s]+)\s+--new-window/);
  if (cliMatch) return cliMatch[1];

  return undefined;
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

  if (expectedAction.type === "key") {
    actualValue = toKeyCode;
  } else if (shellCmd) {
    if (expectedAction.type === "app") {
      actualValue = extractAppName(shellCmd);
    } else if (expectedAction.type === "url") {
      actualValue = extractUrl(shellCmd);
    } else if (expectedAction.type === "raycast") {
      actualValue = extractRaycastCommand(shellCmd);
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

// ============================================================================
// Window Cycling Rule Validators
// ============================================================================

export interface WindowCyclingRule {
  keyCode: string;
  appName: string;
  variableName: string;
}

/**
 * Find the "first press" manipulator for window cycling (activates app, sets variable)
 */
export function findWindowCyclingFirstPress(
  keyCode: string,
  variableName: string,
  profileName: string = "Default"
): Manipulator | undefined {
  const manipulators = getManipulators(profileName);
  return manipulators.find(
    (m) =>
      m.from.key_code === keyCode &&
      m.conditions?.some((c) => c.type === "variable_if" && c.name === "hyper" && c.value === 1) &&
      m.conditions?.some((c) => c.type === "variable_if" && c.name === variableName && c.value === 0) &&
      m.to?.some((t) => t.set_variable?.name === variableName && t.set_variable?.value === 1)
  );
}

/**
 * Find the "subsequent press" manipulator for window cycling (sends Cmd+§ or custom shell command)
 */
export function findWindowCyclingSubsequentPress(
  keyCode: string,
  variableName: string,
  profileName: string = "Default"
): Manipulator | undefined {
  const manipulators = getManipulators(profileName);
  return manipulators.find(
    (m) =>
      m.from.key_code === keyCode &&
      m.conditions?.some((c) => c.type === "variable_if" && c.name === "hyper" && c.value === 1) &&
      m.conditions?.some((c) => c.type === "variable_if" && c.name === variableName && c.value === 1) &&
      // Accept either Cmd+§ keystroke OR custom shell command for cycling
      m.to?.some((t) => (t.key_code === "non_us_backslash" && t.modifiers?.includes("command")) || t.shell_command)
  );
}

/**
 * Check if the Caps Lock rule resets a variable on key up
 */
export function checkVariableResetOnCapsLockRelease(
  variableName: string,
  profileName: string = "Default"
): boolean {
  const manipulators = getManipulators(profileName);
  const capsLockManipulator = manipulators.find(
    (m) => m.from.key_code === "caps_lock"
  );

  if (!capsLockManipulator) return false;

  // Check to_after_key_up for variable reset
  const toAfterKeyUp = (capsLockManipulator as unknown as { to_after_key_up?: To[] }).to_after_key_up;
  return toAfterKeyUp?.some(
    (t) => t.set_variable?.name === variableName && t.set_variable?.value === 0
  ) ?? false;
}

export interface WindowCyclingValidationResult {
  valid: boolean;
  firstPressFound: boolean;
  subsequentPressFound: boolean;
  variableResetFound: boolean;
  appOpened?: string;
  errors: string[];
}

// ============================================================================
// Reset Variables Rule Validators
// ============================================================================

export interface ResetVariablesValidationResult {
  valid: boolean;
  found: boolean;
  variablesReset: string[];
  errors: string[];
}

/**
 * Find the reset all variables manipulator (escape key)
 */
export function findResetVariablesRule(
  profileName: string = "Default"
): Manipulator | undefined {
  const manipulators = getManipulators(profileName);
  // Find the escape manipulator that resets all variables
  // It fires when hyper is NOT active, resets variables, and passes through escape
  return manipulators.find(
    (m) =>
      m.from.key_code === "escape" &&
      m.conditions?.some((c) => c.type === "variable_if" && c.name === "hyper" && c.value === 0) &&
      m.to?.some((t) => t.set_variable?.value === 0) && // Resets variables
      m.to?.some((t) => t.key_code === "escape") // Passes through escape
  );
}

/**
 * Validate that the reset variables rule exists and resets the expected variables
 */
export function validateResetVariablesRule(
  expectedVariables: string[]
): ResetVariablesValidationResult {
  const errors: string[] = [];
  const manipulator = findResetVariablesRule();

  if (!manipulator) {
    return {
      valid: false,
      found: false,
      variablesReset: [],
      errors: ["Reset variables rule (escape) not found"],
    };
  }

  // Get all variables that are reset
  const variablesReset: string[] = [];
  for (const to of manipulator.to || []) {
    if (to.set_variable?.name && to.set_variable?.value === 0) {
      variablesReset.push(to.set_variable.name);
    }
  }

  // Check that all expected variables are reset
  for (const expected of expectedVariables) {
    if (!variablesReset.includes(expected)) {
      errors.push(`Expected variable "${expected}" to be reset, but it wasn't`);
    }
  }

  return {
    valid: errors.length === 0,
    found: true,
    variablesReset,
    errors,
  };
}

/**
 * Find a manipulator by from key_code and mandatory modifiers
 */
export function findManipulatorByFrom(
  keyCode: string,
  mandatoryModifiers: string[],
  profileName: string = "Default"
): Manipulator | undefined {
  const manipulators = getManipulators(profileName);
  return manipulators.find(
    (m) =>
      m.from.key_code === keyCode &&
      mandatoryModifiers.every((mod) => m.from.modifiers?.mandatory?.includes(mod))
  );
}

/**
 * Validate a complete window cycling rule for an app
 */
export function validateWindowCyclingRule(
  keyCode: string,
  expectedApp: string,
  variableName: string
): WindowCyclingValidationResult {
  const errors: string[] = [];

  // Check first press rule
  const firstPress = findWindowCyclingFirstPress(keyCode, variableName);
  const firstPressFound = !!firstPress;
  if (!firstPressFound) {
    errors.push(`First press rule not found for ${keyCode} with variable ${variableName}`);
  }

  // Check that first press opens the app
  let appOpened: string | undefined;
  if (firstPress) {
    const shellCmd = getShellCommand(firstPress);
    if (shellCmd) {
      appOpened = extractAppName(shellCmd);
      if (!appOpened?.toLowerCase().includes(expectedApp.toLowerCase())) {
        errors.push(`First press should open ${expectedApp}, but opens ${appOpened || "unknown"}`);
      }
    } else {
      errors.push(`First press rule has no shell command to open app`);
    }
  }

  // Check subsequent press rule
  const subsequentPress = findWindowCyclingSubsequentPress(keyCode, variableName);
  const subsequentPressFound = !!subsequentPress;
  if (!subsequentPressFound) {
    errors.push(`Subsequent press rule not found for ${keyCode} with variable ${variableName}`);
  }

  // Check variable reset on Caps Lock release
  const variableResetFound = checkVariableResetOnCapsLockRelease(variableName);
  if (!variableResetFound) {
    errors.push(`Variable ${variableName} is not reset when Caps Lock is released`);
  }

  return {
    valid: firstPressFound && subsequentPressFound && variableResetFound && errors.length === 0,
    firstPressFound,
    subsequentPressFound,
    variableResetFound,
    appOpened,
    errors,
  };
}
