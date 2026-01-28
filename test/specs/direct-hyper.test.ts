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

  it("◆ + PageUp → window top right quarter", () => {
    const result = validateDirectHyperShortcut("page_up", {
      type: "raycast",
      value: "window-management/top-right-quarter",
    });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ + PageDown → window bottom right quarter", () => {
    const result = validateDirectHyperShortcut("page_down", {
      type: "raycast",
      value: "window-management/bottom-right-quarter",
    });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ + Home → window top left quarter", () => {
    const result = validateDirectHyperShortcut("home", {
      type: "raycast",
      value: "window-management/top-left-quarter",
    });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ + End → window bottom left quarter", () => {
    const result = validateDirectHyperShortcut("end", {
      type: "raycast",
      value: "window-management/bottom-left-quarter",
    });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ + F1 → opens Gemini Web", () => {
    const result = validateDirectHyperShortcut("f1", { type: "url", value: "gemini.google.com" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ + F2 → opens ChatGPT Web", () => {
    const result = validateDirectHyperShortcut("f2", { type: "url", value: "chat.openai.com" });
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

  it("◆ + F12 → Select Audio Output", () => {
    const result = validateDirectHyperShortcut("f12", {
      type: "raycast",
      value: "audio-device/set-output-device",
    });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });
});
