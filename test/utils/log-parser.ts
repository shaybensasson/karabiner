import { readFileSync, writeFileSync, existsSync } from "fs";

export const ACTION_LOG_PATH = "/tmp/karabiner-test.log";

export interface ActionLogEntry {
  type: "app" | "url" | "raycast" | "key" | "window" | "shell";
  value: string;
  raw: string;
}

/**
 * Parse the action log file and return all entries.
 */
export function parseActionLog(): ActionLogEntry[] {
  if (!existsSync(ACTION_LOG_PATH)) {
    return [];
  }

  const content = readFileSync(ACTION_LOG_PATH, "utf-8");
  const lines = content.trim().split("\n").filter(Boolean);

  return lines.map((line) => {
    // Format: ACTION:<type>:<value>
    const match = line.match(/^ACTION:(\w+):(.+)$/);
    if (match) {
      return {
        type: match[1] as ActionLogEntry["type"],
        value: match[2],
        raw: line,
      };
    }
    return { type: "shell" as const, value: line, raw: line };
  });
}

/**
 * Clear the action log file.
 */
export function clearActionLog(): void {
  writeFileSync(ACTION_LOG_PATH, "");
}

/**
 * Wait for a specific action to appear in the log.
 *
 * @param expectedType - The action type to wait for
 * @param expectedValue - The value to match (substring match)
 * @param timeoutMs - Maximum time to wait (default: 1000ms)
 * @returns true if found, false if timeout
 */
export async function waitForAction(
  expectedType: ActionLogEntry["type"],
  expectedValue: string,
  timeoutMs: number = 1000
): Promise<boolean> {
  const startTime = Date.now();
  const pollInterval = 50;

  while (Date.now() - startTime < timeoutMs) {
    const entries = parseActionLog();
    const found = entries.some(
      (entry) =>
        entry.type === expectedType && entry.value.includes(expectedValue)
    );
    if (found) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  return false;
}

/**
 * Get the last action from the log.
 */
export function getLastAction(): ActionLogEntry | null {
  const entries = parseActionLog();
  return entries.length > 0 ? entries[entries.length - 1] : null;
}

/**
 * Get all actions of a specific type.
 */
export function getActionsByType(
  type: ActionLogEntry["type"]
): ActionLogEntry[] {
  return parseActionLog().filter((entry) => entry.type === type);
}
