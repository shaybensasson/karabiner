import { describe, it, expect } from "vitest";
import { validateResetVariablesRule } from "../utils/config-validator";

describe("Reset All Variables (double tap escape) - Config Validation", () => {
  it("rule exists and resets hyper variable", () => {
    const result = validateResetVariablesRule(["hyper"]);
    expect(result.found).toBe(true);
    expect(result.variablesReset).toContain("hyper");
  });

  it("resets all sublayer variables", () => {
    const sublayerVariables = [
      "hyper_sublayer_b",
      "hyper_sublayer_q",
      "hyper_sublayer_o",
      "hyper_sublayer_w",
      "hyper_sublayer_s",
      "hyper_sublayer_r",
      "hyper_sublayer_a",
    ];
    const result = validateResetVariablesRule(sublayerVariables);
    expect(result.found).toBe(true);
    for (const variable of sublayerVariables) {
      expect(result.variablesReset).toContain(variable);
    }
  });

  it("resets window cycling variables", () => {
    const windowCyclingVariables = [
      "ghostty_activated",
      "cursor_activated",
      "vscode_activated",
      "chrome_activated",
      "zoom_activated",
    ];
    const result = validateResetVariablesRule(windowCyclingVariables);
    expect(result.found).toBe(true);
    for (const variable of windowCyclingVariables) {
      expect(result.variablesReset).toContain(variable);
    }
  });

  it("resets cmd_q_pressed variable", () => {
    const result = validateResetVariablesRule(["cmd_q_pressed"]);
    expect(result.found).toBe(true);
    expect(result.variablesReset).toContain("cmd_q_pressed");
  });

  it("resets hold-sent variables", () => {
    const result = validateResetVariablesRule(["ghostty_activated_hold_sent"]);
    expect(result.found).toBe(true);
    expect(result.variablesReset).toContain("ghostty_activated_hold_sent");
  });
});
