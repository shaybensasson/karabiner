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
});
