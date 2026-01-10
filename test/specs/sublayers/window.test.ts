import { describe, it, expect } from "vitest";
import { validateSublayerCommand } from "../../utils/config-validator";

describe("Window Sublayer (◆ W) - Config Validation", () => {
  it("◆ W T → window top half", () => {
    const result = validateSublayerCommand("w", "t", { type: "raycast", value: "top-half" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ W B → window bottom half", () => {
    const result = validateSublayerCommand("w", "b", { type: "raycast", value: "bottom-half" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ W D → move to next display", () => {
    const result = validateSublayerCommand("w", "d", { type: "raycast", value: "next-display" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });
});
