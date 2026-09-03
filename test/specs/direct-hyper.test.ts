import { describe, it, expect } from "vitest";
import { findDirectHyperShortcut, validateDirectHyperShortcut } from "../utils/config-validator";

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

  it("◆ + F3 → move window to next display", () => {
    const result = validateDirectHyperShortcut("f3", {
      type: "raycast",
      value: "window-management/next-display",
    });
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

describe("Direct Hyper Shortcuts - Repeatable while ◆ is held", () => {
  it("◆ + F3 keeps hyper active (tap F3 repeatedly without releasing ◆)", () => {
    const manipulator = findDirectHyperShortcut("f3");
    expect(manipulator).toBeDefined();

    const resetsHyper = manipulator?.to?.some(
      (t) => t.set_variable?.name === "hyper" && t.set_variable?.value === 0
    );
    expect(resetsHyper).toBe(false);
  });

  it("◆ + F3 does not fire on macOS key repeat (hold F3 = single move)", () => {
    const manipulator = findDirectHyperShortcut("f3");
    const action = manipulator?.to?.[0];
    expect(action?.shell_command).toContain("window-management/next-display");
    expect(action?.repeat).toBe(false);
  });

  it.each([
    ["left_arrow", "window-management/left-half"],
    ["right_arrow", "window-management/right-half"],
    ["up_arrow", "window-management/maximize"],
    ["down_arrow", "window-management/restore"],
  ])("◆ + %s stays active and does not fire on key repeat", (keyCode, raycastCommand) => {
    const manipulator = findDirectHyperShortcut(keyCode);
    expect(manipulator).toBeDefined();

    const resetsHyper = manipulator?.to?.some(
      (t) => t.set_variable?.name === "hyper" && t.set_variable?.value === 0
    );
    expect(resetsHyper).toBe(false);

    const action = manipulator?.to?.[0];
    expect(action?.shell_command).toContain(raycastCommand);
    expect(action?.repeat).toBe(false);
  });

  it("non-repeatable shortcuts still reset hyper after firing (◆ + F1)", () => {
    const manipulator = findDirectHyperShortcut("f1");
    const resetsHyper = manipulator?.to?.some(
      (t) => t.set_variable?.name === "hyper" && t.set_variable?.value === 0
    );
    expect(resetsHyper).toBe(true);
  });
});
