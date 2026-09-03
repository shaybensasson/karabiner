#!/usr/bin/env tsx

/**
 * Interactive E2E Test Runner for Karabiner Key Mappings
 *
 * This script:
 * 1. Switches to the Test profile (which logs actions instead of executing them)
 * 2. Prompts you to press specific key sequences
 * 3. Auto-detects when the action is logged (no Enter needed)
 * 4. Reports pass/fail for each test
 * 5. Stops on first failure
 *
 * Usage: yarn test:interactive
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const KARABINER_CLI = "/Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli";
const ACTION_LOG_PATH = "/tmp/karabiner-test.log";

interface TestCase {
  name: string;
  keySequence: string;
  expectedAction: {
    type: "app" | "url" | "raycast" | "key" | "new_instance";
    value: string;
  };
  timeout?: number;
  // How many times the action must be logged (default 1).
  // Used for shortcuts that repeat while ◆ stays held, e.g. F3 → Next Display.
  expectedCount?: number;
}

const testCases: TestCase[] = [
  // One test per action type:
  // raycast: Direct Hyper shortcut
  { name: "Window Left Half", keySequence: "Hold ◆ (Caps Lock) + Press ←", expectedAction: { type: "raycast", value: "left-half" } },
  // raycast: Window quarters
  { name: "Window Top Right Quarter", keySequence: "Hold ◆ (Caps Lock) + Press PageUp", expectedAction: { type: "raycast", value: "top-right-quarter" } },
  // url: Direct Hyper shortcut
  { name: "F1 → Gemini Web", keySequence: "Hold ◆ (Caps Lock) + Press F1", expectedAction: { type: "url", value: "gemini.google.com" } },
  // raycast: repeatable Direct Hyper shortcut (hyper stays active between taps)
  { name: "F3 → Next Display (3 taps, ◆ held)", keySequence: "Hold ◆ (Caps Lock) and tap F3 three times WITHOUT releasing ◆", expectedAction: { type: "raycast", value: "next-display" }, expectedCount: 3, timeout: 15000 },
  // url: Browse sublayer
  { name: "Browse → Calendar", keySequence: "Tap ◆, then B, then C", expectedAction: { type: "url", value: "calendar.google.com" } },
  // app: Open Apps sublayer
  { name: "Open → Slack", keySequence: "Tap ◆, then O, then S", expectedAction: { type: "app", value: "Slack" } },
  // key: Ctrl+C tap sends Ctrl+D
  { name: "Ctrl+C tap → Ctrl+D", keySequence: "Tap Ctrl+C (quick press and release)", expectedAction: { type: "key", value: "d" } },
  // new_instance: First press uses new instance command
  { name: "Cursor (first press - new instance)", keySequence: "Hold ◆ (Caps Lock) + Tap 9", expectedAction: { type: "new_instance", value: "Cursor" } },
  { name: "VSCode (first press - new instance)", keySequence: "Hold ◆ (Caps Lock) + Tap 8", expectedAction: { type: "new_instance", value: "Visual Studio Code" } },
];

let originalProfile: string | null = null;

function getCurrentProfile(): string {
  return execSync(`"${KARABINER_CLI}" --show-current-profile-name`, { encoding: "utf-8" }).trim();
}

function switchProfile(name: string): void {
  execSync(`"${KARABINER_CLI}" --select-profile "${name}"`, { encoding: "utf-8" });
}

function restoreProfile(): void {
  if (originalProfile && originalProfile !== "Test") {
    console.log(`\n🔄 Restoring ${originalProfile} profile...`);
    switchProfile(originalProfile);
    console.log("✓ Profile restored");
  }
}

function clearLog(): void {
  writeFileSync(ACTION_LOG_PATH, "");
}

function parseLog(): string[] {
  if (!existsSync(ACTION_LOG_PATH)) return [];
  return readFileSync(ACTION_LOG_PATH, "utf-8").trim().split("\n").filter(Boolean);
}

function countLoggedActions(expectedType: string, expectedValue: string): number {
  const lines = parseLog();
  return lines.filter(line => {
    const match = line.match(/^ACTION:(\w+):(.+)$/);
    if (match) {
      const [, type, value] = match;
      return type === expectedType && value.includes(expectedValue);
    }
    return false;
  }).length;
}

async function waitForAction(
  expectedType: string,
  expectedValue: string,
  timeoutMs: number = 10000,
  expectedCount: number = 1
): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const pollInterval = 50;

    const check = () => {
      if (countLoggedActions(expectedType, expectedValue) >= expectedCount) {
        resolve(true);
      } else if (Date.now() - startTime > timeoutMs) {
        resolve(false);
      } else {
        setTimeout(check, pollInterval);
      }
    };

    check();
  });
}

function ensureTestProfile(): void {
  const profiles = execSync(`"${KARABINER_CLI}" --list-profile-names`, { encoding: "utf-8" }).trim().split("\n");
  if (!profiles.includes("Test")) {
    console.log("⚙️  Test profile not found. Building...");
    execSync("yarn build", { stdio: "inherit" });
    execSync("yarn tsx test/utils/test-profile-generator.ts", { stdio: "inherit" });
    console.log("✓ Test profile created\n");
  }
}

async function runTests() {
  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║     Karabiner Interactive E2E Test Runner                      ║");
  console.log("╠════════════════════════════════════════════════════════════════╣");
  console.log("║ Press the indicated keys - no Enter needed!                    ║");
  console.log("║ The test auto-detects when the action is logged.               ║");
  console.log("║ Ctrl+C to abort (profile will be restored).                    ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");

  // Ensure Test profile exists (build if needed)
  ensureTestProfile();

  // Store and switch profile
  originalProfile = getCurrentProfile();
  console.log(`Current profile: ${originalProfile}`);
  console.log("Switching to Test profile...");
  switchProfile("Test");
  await new Promise(r => setTimeout(r, 500));
  console.log("✓ Test profile active\n");

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`\n─── Test ${i + 1}/${testCases.length}: ${test.name} ───`);
    console.log(`   👉 ${test.keySequence}`);
    const expectedCount = test.expectedCount || 1;
    const countSuffix = expectedCount > 1 ? ` (x${expectedCount})` : "";
    process.stdout.write(`   ⏳ Waiting for: ${test.expectedAction.type}:${test.expectedAction.value}${countSuffix}...`);

    clearLog();

    const found = await waitForAction(
      test.expectedAction.type,
      test.expectedAction.value,
      test.timeout || 10000,
      expectedCount
    );

    if (found) {
      console.log("\r   ✅ PASS" + " ".repeat(60));
      passed++;
    } else {
      const logContent = parseLog();
      console.log("\r   ❌ FAIL" + " ".repeat(60));
      console.log(`   Log: ${logContent.length > 0 ? logContent.join(", ") : "(empty - no action detected)"}`);
      failed++;

      // Stop on first failure
      console.log("\n⛔ Stopping on first failure.");
      break;
    }

    // Small delay between tests
    await new Promise(r => setTimeout(r, 300));
  }

  // Summary
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║            Test Summary                ║");
  console.log("╠════════════════════════════════════════╣");
  console.log(`║  Passed: ${passed.toString().padEnd(28)}║`);
  console.log(`║  Failed: ${failed.toString().padEnd(28)}║`);
  console.log("╚════════════════════════════════════════╝");

  restoreProfile();

  process.exit(failed > 0 ? 1 : 0);
}

// Handle all exit scenarios
process.on("SIGINT", () => {
  console.log("\n\n⚠️  Interrupted (Ctrl+C)");
  restoreProfile();
  process.exit(130);
});

process.on("SIGTERM", () => {
  console.log("\n\n⚠️  Terminated");
  restoreProfile();
  process.exit(143);
});

process.on("uncaughtException", (err) => {
  console.error("\n\n❌ Uncaught exception:", err.message);
  restoreProfile();
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("\n\n❌ Unhandled rejection:", reason);
  restoreProfile();
  process.exit(1);
});

runTests().catch((err) => {
  console.error("\n\n❌ Error:", err.message);
  restoreProfile();
  process.exit(1);
});
