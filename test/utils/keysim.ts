import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KEYSIM_PATH = join(__dirname, "../tools/keysim");

export interface KeySimOptions {
  delayBetweenKeys?: number; // ms between key events (default: 50)
}

/**
 * Simulate a sequence of key events using the Swift CGEvent tool.
 *
 * @param keys - Array of key names or commands:
 *   - "a", "b", "caps_lock" - tap key (down then up)
 *   - "caps_lock_down" - press and hold
 *   - "caps_lock_up" - release
 *   - "delay:100" - wait 100ms
 */
export async function simulateKeys(
  keys: string[],
  options: KeySimOptions = {}
): Promise<void> {
  const { delayBetweenKeys = 50 } = options;

  // Insert delays between keys if specified
  const commandArgs: string[] = [];
  for (let i = 0; i < keys.length; i++) {
    commandArgs.push(keys[i]);
    if (i < keys.length - 1 && delayBetweenKeys > 0) {
      commandArgs.push(`delay:${delayBetweenKeys}`);
    }
  }

  try {
    execSync(`"${KEYSIM_PATH}" ${commandArgs.join(" ")}`, {
      encoding: "utf-8",
      timeout: 10000,
    });
  } catch (error: unknown) {
    const err = error as { stderr?: string; message?: string };
    throw new Error(`KeySim failed: ${err.stderr || err.message}`);
  }
}

/**
 * Simulate a direct hyper shortcut (Caps Lock held + key).
 * For shortcuts like ◆ + ← (window left half)
 */
export async function simulateHyperKey(
  key: string,
  options: KeySimOptions = {}
): Promise<void> {
  const { delayBetweenKeys = 50 } = options;
  await simulateKeys(
    ["caps_lock_down", `delay:${delayBetweenKeys}`, key, `delay:${delayBetweenKeys}`, "caps_lock_up"],
    { delayBetweenKeys: 0 } // delays already included
  );
}

/**
 * Simulate a sublayer sequence (leader key style).
 * For shortcuts like ◆ → O → S (Open Slack)
 *
 * This taps Caps Lock, then taps the sublayer key, then taps the command key.
 * Each key is tapped (pressed and released) before the next.
 */
export async function simulateSublayerSequence(
  sublayerKey: string,
  commandKey: string,
  options: KeySimOptions = {}
): Promise<void> {
  const { delayBetweenKeys = 50 } = options;
  // Leader key style: tap caps_lock, tap sublayer, tap command
  await simulateKeys(["caps_lock", sublayerKey, commandKey], {
    delayBetweenKeys,
  });
}

/**
 * Check if accessibility permissions are granted.
 */
export function checkPermissions(): boolean {
  try {
    const result = execSync(`"${KEYSIM_PATH}" --check-permissions`, {
      encoding: "utf-8",
    });
    return result.includes("OK");
  } catch {
    return false;
  }
}
