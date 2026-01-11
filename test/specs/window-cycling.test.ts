import { describe, it, expect } from "vitest";
import { validateWindowCyclingRule } from "../utils/config-validator";

describe("Window Cycling Rules (◆ + key → activate or switch window)", () => {
  describe("Ghostty (◆+0)", () => {
    it("has valid window cycling rule", () => {
      const result = validateWindowCyclingRule("0", "Ghostty", "ghostty_activated");
      expect(result.valid).toBe(true);
      expect(result.firstPressFound).toBe(true);
      expect(result.subsequentPressFound).toBe(true);
      expect(result.variableResetFound).toBe(true);
    });

    it("opens Ghostty on first press", () => {
      const result = validateWindowCyclingRule("0", "Ghostty", "ghostty_activated");
      expect(result.appOpened?.toLowerCase()).toContain("ghostty");
    });
  });

  describe("Cursor (◆+9)", () => {
    it("has valid window cycling rule", () => {
      const result = validateWindowCyclingRule("9", "Cursor", "cursor_activated");
      expect(result.valid).toBe(true);
      expect(result.firstPressFound).toBe(true);
      expect(result.subsequentPressFound).toBe(true);
      expect(result.variableResetFound).toBe(true);
    });

    it("opens Cursor on first press", () => {
      const result = validateWindowCyclingRule("9", "Cursor", "cursor_activated");
      expect(result.appOpened?.toLowerCase()).toContain("cursor");
    });
  });

  describe("Chrome (◆+F4)", () => {
    it("has valid window cycling rule", () => {
      const result = validateWindowCyclingRule("f4", "Google Chrome", "chrome_activated");
      expect(result.valid).toBe(true);
      expect(result.firstPressFound).toBe(true);
      expect(result.subsequentPressFound).toBe(true);
      expect(result.variableResetFound).toBe(true);
    });

    it("opens Chrome on first press", () => {
      const result = validateWindowCyclingRule("f4", "Google Chrome", "chrome_activated");
      expect(result.appOpened?.toLowerCase()).toContain("google chrome");
    });
  });

  describe("Zoom (◆+F5)", () => {
    it("has valid window cycling rule", () => {
      const result = validateWindowCyclingRule("f5", "zoom.us", "zoom_activated");
      expect(result.valid).toBe(true);
      expect(result.firstPressFound).toBe(true);
      expect(result.subsequentPressFound).toBe(true);
      expect(result.variableResetFound).toBe(true);
    });

    it("opens Zoom on first press", () => {
      const result = validateWindowCyclingRule("f5", "zoom.us", "zoom_activated");
      expect(result.appOpened?.toLowerCase()).toContain("zoom");
    });
  });

  describe("Window cycling behavior", () => {
    it("all window cycling apps reset their variables when Caps Lock is released", () => {
      const apps = [
        { key: "0", variable: "ghostty_activated" },
        { key: "9", variable: "cursor_activated" },
        { key: "f4", variable: "chrome_activated" },
        { key: "f5", variable: "zoom_activated" },
      ];

      for (const app of apps) {
        const result = validateWindowCyclingRule(app.key, "", app.variable);
        expect(result.variableResetFound).toBe(true);
      }
    });

    it("subsequent presses send Cmd+§ for window switching", () => {
      const apps = [
        { key: "0", variable: "ghostty_activated" },
        { key: "9", variable: "cursor_activated" },
        { key: "f4", variable: "chrome_activated" },
        { key: "f5", variable: "zoom_activated" },
      ];

      for (const app of apps) {
        const result = validateWindowCyclingRule(app.key, "", app.variable);
        expect(result.subsequentPressFound).toBe(true);
      }
    });
  });
});
