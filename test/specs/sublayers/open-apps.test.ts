import { describe, it, expect } from "vitest";
import { validateSublayerCommand } from "../../utils/config-validator";

describe("Open Apps Sublayer (◆ O) - Config Validation", () => {
  it("◆ O S → opens Slack", () => {
    const result = validateSublayerCommand("o", "s", { type: "app", value: "Slack" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O T → opens Ghostty", () => {
    const result = validateSublayerCommand("o", "t", { type: "app", value: "Ghostty" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O C → opens ChatGPT", () => {
    const result = validateSublayerCommand("o", "c", { type: "app", value: "ChatGPT" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O M → opens Spotify", () => {
    const result = validateSublayerCommand("o", "m", { type: "app", value: "Spotify" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O W → opens WhatsApp", () => {
    const result = validateSublayerCommand("o", "w", { type: "app", value: "WhatsApp" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O V → opens VLC", () => {
    const result = validateSublayerCommand("o", "v", { type: "app", value: "VLC" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O Z → opens Zoom", () => {
    const result = validateSublayerCommand("o", "z", { type: "app", value: "zoom.us" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O D → opens Downloads folder", () => {
    const result = validateSublayerCommand("o", "d", { type: "file", value: "Downloads" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ O L → opens LastPass", () => {
    const result = validateSublayerCommand("o", "l", { type: "app", value: "LastPass" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });
});
