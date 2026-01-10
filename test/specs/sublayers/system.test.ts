import { describe, it, expect } from "vitest";
import { validateSublayerCommand } from "../../utils/config-validator";

describe("System Sublayer (◆ S) - Config Validation", () => {
  it("◆ S B → toggles Bluetooth", () => {
    const result = validateSublayerCommand("s", "b", { type: "raycast", value: "toggle-bluetooth" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ S C → opens Camera", () => {
    const result = validateSublayerCommand("s", "c", { type: "raycast", value: "open-camera" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ S D → toggles Do Not Disturb", () => {
    const result = validateSublayerCommand("s", "d", { type: "raycast", value: "do-not-disturb" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ S T → toggles Dark Mode", () => {
    const result = validateSublayerCommand("s", "t", { type: "raycast", value: "toggle-system-appearance" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });
});
