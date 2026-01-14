import { describe, it, expect } from "vitest";
import { getManipulators, getShellCommand, extractAppName } from "../utils/config-validator";

describe("Ghostty Window Cycling with Hold (◆+0)", () => {
  it("has rule for activating Ghostty", () => {
    const manipulators = getManipulators();
    const ghosttyRule = manipulators.find(
      (m) =>
        m.from.key_code === "0" &&
        m.conditions?.some((c) => c.type === "variable_if" && c.name === "hyper" && c.value === 1)
    );
    expect(ghosttyRule).toBeDefined();
  });

  it("opens Ghostty on first press (sets ghostty_activated variable)", () => {
    const manipulators = getManipulators();
    // Find the "first press" rule that sets the variable
    const ghosttyActivateRule = manipulators.find(
      (m) =>
        m.from.key_code === "0" &&
        m.conditions?.some((c) => c.type === "variable_if" && c.name === "hyper" && c.value === 1) &&
        m.conditions?.some((c) => c.type === "variable_if" && c.name === "ghostty_activated" && c.value === 0)
    );
    expect(ghosttyActivateRule).toBeDefined();
    const shellCmd = getShellCommand(ghosttyActivateRule!);
    const appName = shellCmd ? extractAppName(shellCmd) : undefined;
    expect(appName?.toLowerCase()).toContain("ghostty");
  });

  it("has window cycling rule (cycles on subsequent presses)", () => {
    const manipulators = getManipulators();
    // Find the "subsequent press" rule (variable=1)
    const ghosttyCycleRule = manipulators.find(
      (m) =>
        m.from.key_code === "0" &&
        m.conditions?.some((c) => c.type === "variable_if" && c.name === "hyper" && c.value === 1) &&
        m.conditions?.some((c) => c.type === "variable_if" && c.name === "ghostty_activated" && c.value === 1)
    );
    expect(ghosttyCycleRule).toBeDefined();
  });

  it("has hold action when Ghostty is frontmost", () => {
    const manipulators = getManipulators();
    const ghosttyHoldRule = manipulators.find(
      (m) =>
        m.from.key_code === "0" &&
        m.conditions?.some((c) => c.type === "variable_if" && c.name === "hyper" && c.value === 1) &&
        m.conditions?.some(
          (c) =>
            c.type === "frontmost_application_if" &&
            (c as { bundle_identifiers?: string[] }).bundle_identifiers?.includes("com.mitchellh.ghostty")
        )
    );
    expect(ghosttyHoldRule).toBeDefined();

    // Check to_if_held_down exists
    const toHeld = (ghosttyHoldRule as unknown as { to_if_held_down?: unknown[] }).to_if_held_down;
    expect(toHeld).toBeDefined();
    expect(toHeld?.length).toBeGreaterThan(0);
  });

  it("hold sends Cmd+N for new window", () => {
    const manipulators = getManipulators();
    const ghosttyHoldRule = manipulators.find(
      (m) =>
        m.from.key_code === "0" &&
        m.conditions?.some((c) => c.type === "variable_if" && c.name === "hyper" && c.value === 1) &&
        m.conditions?.some(
          (c) =>
            c.type === "frontmost_application_if" &&
            (c as { bundle_identifiers?: string[] }).bundle_identifiers?.includes("com.mitchellh.ghostty")
        )
    );

    const toHeld = (ghosttyHoldRule as unknown as { to_if_held_down?: Array<{ key_code?: string; modifiers?: string[] }> })
      .to_if_held_down;
    const cmdN = toHeld?.find((t) => t.key_code === "n" && t.modifiers?.includes("left_command"));
    expect(cmdN).toBeDefined();
  });
});
