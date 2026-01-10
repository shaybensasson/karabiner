import { describe, it, expect } from "vitest";
import { validateSublayerCommand } from "../../utils/config-validator";

describe("Browse Sublayer (◆ B) - Config Validation", () => {
  it("◆ B C → opens Google Calendar", () => {
    const result = validateSublayerCommand("b", "c", { type: "url", value: "calendar.google.com" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ B D → opens Dropbox", () => {
    const result = validateSublayerCommand("b", "d", { type: "url", value: "dropbox.com" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ B G → opens Gemini", () => {
    const result = validateSublayerCommand("b", "g", { type: "url", value: "gemini.google.com" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ B H → opens YouTube History", () => {
    const result = validateSublayerCommand("b", "h", { type: "url", value: "youtube.com/feed/history" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ B O → opens ChatGPT Web", () => {
    const result = validateSublayerCommand("b", "o", { type: "url", value: "chat.openai.com" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ B R → opens Reddit", () => {
    const result = validateSublayerCommand("b", "r", { type: "url", value: "reddit.com" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ B T → opens Timeless", () => {
    const result = validateSublayerCommand("b", "t", { type: "url", value: "timeless.day" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ B U → opens ClickUp", () => {
    const result = validateSublayerCommand("b", "u", { type: "url", value: "clickup.com" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ B X → opens X (Twitter)", () => {
    const result = validateSublayerCommand("b", "x", { type: "url", value: "x.com" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ B Y → opens YouTube", () => {
    const result = validateSublayerCommand("b", "y", { type: "url", value: "youtube.com" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });
});
