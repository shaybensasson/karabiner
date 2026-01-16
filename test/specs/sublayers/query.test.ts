import { describe, it, expect } from "vitest";
import { validateSublayerCommand, findSublayerCommand, getToKeyCode } from "../../utils/config-validator";

describe("Query Sublayer (◆ Q) - Config Validation", () => {
  it("◆ Q B → Browser Search", () => {
    const result = validateSublayerCommand("q", "b", { type: "raycast", value: "google-chrome/search-all" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ Q C → Cursor Recent Projects", () => {
    const result = validateSublayerCommand("q", "c", { type: "raycast", value: "cursor-recent-projects" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ Q E → Emoji Search", () => {
    const result = validateSublayerCommand("q", "e", { type: "raycast", value: "emoji-symbols" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ Q F → File Search", () => {
    const result = validateSublayerCommand("q", "f", { type: "raycast", value: "file-search" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ Q G → Google Search", () => {
    const result = validateSublayerCommand("q", "g", { type: "raycast", value: "google-search" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ Q I → Icon Search", () => {
    const result = validateSublayerCommand("q", "i", { type: "raycast", value: "iconify/view-icons" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ Q L → LastPass (key combo)", () => {
    const manipulator = findSublayerCommand("q", "l");
    expect(manipulator).toBeDefined();
    // LastPass uses a key combo, not a shell command
    expect(getToKeyCode(manipulator!)).toBe("5");
  });

  it("◆ Q M → Menu Items Search", () => {
    const result = validateSublayerCommand("q", "m", { type: "raycast", value: "navigation/search-menu-items" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });

  it("◆ Q O → Obsidian Note Search", () => {
    const result = validateSublayerCommand("q", "o", { type: "raycast", value: "obsidian/searchNoteCommand" });
    expect(result.found).toBe(true);
    expect(result.valid).toBe(true);
  });
});
