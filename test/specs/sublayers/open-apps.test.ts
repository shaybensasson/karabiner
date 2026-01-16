import { describe, it, expect } from "vitest";
import { validateSublayerCommand } from "../../utils/config-validator";

describe("Open Apps Sublayer (◆ O) - Config Validation", () => {
  it("◆ O S → opens Slack", () => {
    const result = validateSublayerCommand("o", "s", { type: "app", value: "Slack" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  // Note: ◆ O T (Ghostty) removed - now using ◆+0 with window cycling

  it("◆ O C → opens Calendar", () => {
    const result = validateSublayerCommand("o", "c", { type: "app", value: "Calendar" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  // Note: ◆ O M (Spotify) removed - now using ◆+F8 direct shortcut

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
