import { describe, it, expect } from "vitest";
import { validateSublayerCommand } from "../../utils/config-validator";

describe("Open Apps Sublayer (◆ O) - Config Validation", () => {
  it("◆ O S → opens Slack", () => {
    const result = validateSublayerCommand("o", "s", { type: "app", value: "Slack" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O G → opens Ghostty", () => {
    const result = validateSublayerCommand("o", "g", { type: "app", value: "Ghostty" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O T → opens Terminal", () => {
    const result = validateSublayerCommand("o", "t", { type: "app", value: "Terminal" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O C → opens Calendar", () => {
    const result = validateSublayerCommand("o", "c", { type: "app", value: "Calendar" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O M → opens Superhuman", () => {
    const result = validateSublayerCommand("o", "m", { type: "app", value: "Superhuman" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O W → opens WhatsApp", () => {
    const result = validateSublayerCommand("o", "w", { type: "app", value: "WhatsApp" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O V → opens VLC with IPTV", () => {
    const result = validateSublayerCommand("o", "v", { type: "raycast", value: "run-vlc-with-iptv" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O Z → starts Zoom meeting", () => {
    const result = validateSublayerCommand("o", "z", { type: "raycast", value: "zoom/start-meeting" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O D → opens Documents folder", () => {
    const result = validateSublayerCommand("o", "d", { type: "file", value: "Documents" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O L → opens LastPass", () => {
    const result = validateSublayerCommand("o", "l", { type: "app", value: "LastPass" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O R → opens Finder Recents", () => {
    const result = validateSublayerCommand("o", "r", { type: "file", value: "Finder" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O P → opens Payroll", () => {
    const result = validateSublayerCommand("o", "p", { type: "file", value: "payroll" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });
});
