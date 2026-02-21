import { describe, it, expect } from "vitest";
import { findManipulatorByFrom } from "../utils/config-validator";

describe("Ctrl+C: tap → Ctrl+D, hold → Ctrl+C - Config Validation", () => {
  const manipulator = findManipulatorByFrom("c", ["control"]);

  it("rule exists for Ctrl+C", () => {
    expect(manipulator).toBeDefined();
  });

  it("tap sends Ctrl+D (to_if_alone)", () => {
    expect(manipulator?.to_if_alone).toBeDefined();
    expect(manipulator?.to_if_alone).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key_code: "d",
          modifiers: expect.arrayContaining(["left_control"]),
        }),
      ])
    );
  });

  it("hold sends Ctrl+C (to_if_held_down)", () => {
    expect(manipulator?.to_if_held_down).toBeDefined();
    expect(manipulator?.to_if_held_down).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key_code: "c",
          modifiers: expect.arrayContaining(["left_control"]),
        }),
      ])
    );
  });
});
