import { describe, it, expect } from "vitest";
import { getManipulators } from "../utils/config-validator";

describe("General Mappings", () => {
  it("⌥F3 → ⌘ Brightness Down (toggle display mirroring)", () => {
    const manipulator = getManipulators().find(
      (m) =>
        m.from.key_code === "f3" &&
        m.from.modifiers?.mandatory?.length === 1 &&
        m.from.modifiers.mandatory.includes("left_option")
    );
    expect(manipulator).toBeDefined();
    expect(manipulator?.to?.[0]).toMatchObject({
      key_code: "display_brightness_decrement",
      modifiers: ["left_command"],
    });
  });

  it("F11 in Chrome → ⌃⌘F (toggle full screen)", () => {
    const manipulator = getManipulators().find(
      (m) =>
        m.from.key_code === "f11" &&
        m.conditions?.some(
          (c) =>
            c.type === "frontmost_application_if" &&
            c.bundle_identifiers?.includes("^com\\.google\\.Chrome$")
        )
    );
    expect(manipulator).toBeDefined();
    expect(manipulator?.to?.[0]).toMatchObject({
      key_code: "f",
      modifiers: ["left_control", "left_command"],
    });
  });
});
