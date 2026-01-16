import { describe, it, expect } from "vitest";
import { validateSublayerCommand } from "../../utils/config-validator";

describe("AI Sublayer (◆ A) - Config Validation", () => {
  it("◆ A S → Simplify", () => {
    const result = validateSublayerCommand("a", "s", { type: "raycast", value: "simplify" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ A L → Create List", () => {
    const result = validateSublayerCommand("a", "l", { type: "raycast", value: "create-list" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ A P → Professionalize", () => {
    const result = validateSublayerCommand("a", "p", { type: "raycast", value: "make-professional" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ A G → Fix Grammar", () => {
    const result = validateSublayerCommand("a", "g", { type: "raycast", value: "fix-grammar" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ A C → Make Concise", () => {
    const result = validateSublayerCommand("a", "c", { type: "raycast", value: "make-concise" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ A T → Translate to Hebrew", () => {
    const result = validateSublayerCommand("a", "t", { type: "raycast", value: "translate-to-hebrew" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });
});
