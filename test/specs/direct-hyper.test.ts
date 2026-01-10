import { describe, it, expect } from "vitest";
import { validateDirectHyperShortcut } from "../utils/config-validator";

describe("Direct Hyper Shortcuts (◆ + key) - Config Validation", () => {
  it("◆ + ← → window left half", () => {
    const result = validateDirectHyperShortcut("left_arrow", {
      type: "raycast",
      value: "window-management/left-half",
    });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ + → → window right half", () => {
    const result = validateDirectHyperShortcut("right_arrow", {
      type: "raycast",
      value: "window-management/right-half",
    });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ + ↑ → window maximize", () => {
    const result = validateDirectHyperShortcut("up_arrow", {
      type: "raycast",
      value: "window-management/maximize",
    });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ + ↓ → window restore", () => {
    const result = validateDirectHyperShortcut("down_arrow", {
      type: "raycast",
      value: "window-management/restore",
    });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ + F1 → sends F13", () => {
    const result = validateDirectHyperShortcut("f1", { type: "key", value: "f13" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ + F2 → sends F14", () => {
    const result = validateDirectHyperShortcut("f2", { type: "key", value: "f14" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ + 1 → opens Google Calendar", () => {
    const result = validateDirectHyperShortcut("1", {
      type: "url",
      value: "calendar.google.com",
    });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ + 2 → opens Gmail", () => {
    const result = validateDirectHyperShortcut("2", {
      type: "url",
      value: "mail.google.com",
    });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });
});
