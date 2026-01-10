import { execSync } from "child_process";

const KARABINER_CLI =
  "/Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli";

/**
 * Get the currently active Karabiner profile name.
 */
export function getCurrentProfile(): string {
  try {
    const result = execSync(
      `"${KARABINER_CLI}" --show-current-profile-name`,
      { encoding: "utf-8" }
    );
    return result.trim();
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(`Failed to get current profile: ${err.message}`);
  }
}

/**
 * Switch to a specific Karabiner profile.
 */
export function switchProfile(profileName: string): void {
  try {
    execSync(`"${KARABINER_CLI}" --select-profile "${profileName}"`, {
      encoding: "utf-8",
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(`Failed to switch to profile "${profileName}": ${err.message}`);
  }
}

/**
 * List all available Karabiner profiles.
 */
export function listProfiles(): string[] {
  try {
    const result = execSync(`"${KARABINER_CLI}" --list-profile-names`, {
      encoding: "utf-8",
    });
    return result.trim().split("\n").filter(Boolean);
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(`Failed to list profiles: ${err.message}`);
  }
}

/**
 * Switch to the test profile.
 */
export async function switchToTestProfile(): Promise<void> {
  const profiles = listProfiles();
  if (!profiles.includes("Test")) {
    throw new Error(
      'Test profile not found. Run "yarn test:setup" to generate it.'
    );
  }
  switchProfile("Test");
  // Wait for profile to be fully active
  await new Promise((resolve) => setTimeout(resolve, 500));
}

/**
 * Switch to the default profile.
 */
export async function switchToDefaultProfile(): Promise<void> {
  switchProfile("Default");
  // Wait for profile to be fully active
  await new Promise((resolve) => setTimeout(resolve, 500));
}

/**
 * Check if the test profile exists.
 */
export function testProfileExists(): boolean {
  const profiles = listProfiles();
  return profiles.includes("Test");
}
