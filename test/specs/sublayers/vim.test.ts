import { describe, it, expect } from "vitest";
import { validateSublayerCommand, getToKeyCode, findSublayerCommand } from "../../utils/config-validator";

describe("Move/Vim Sublayer (◆ V) - Config Validation", () => {
  it("◆ V H → sends left arrow", () => {
    const manipulator = findSublayerCommand("v", "h");
    expect(manipulator).toBeDefined();
    expect(getToKeyCode(manipulator!)).toBe("left_arrow");
  });

  it("◆ V J → sends down arrow", () => {
    const manipulator = findSublayerCommand("v", "j");
    expect(manipulator).toBeDefined();
    expect(getToKeyCode(manipulator!)).toBe("down_arrow");
  });

  it("◆ V K → sends up arrow", () => {
    const manipulator = findSublayerCommand("v", "k");
    expect(manipulator).toBeDefined();
    expect(getToKeyCode(manipulator!)).toBe("up_arrow");
  });

  it("◆ V L → sends right arrow", () => {
    const manipulator = findSublayerCommand("v", "l");
    expect(manipulator).toBeDefined();
    expect(getToKeyCode(manipulator!)).toBe("right_arrow");
  });

  it("◆ V I → sends page up", () => {
    const manipulator = findSublayerCommand("v", "i");
    expect(manipulator).toBeDefined();
    expect(getToKeyCode(manipulator!)).toBe("page_up");
  });

  it("◆ V U → sends page down", () => {
    const manipulator = findSublayerCommand("v", "u");
    expect(manipulator).toBeDefined();
    expect(getToKeyCode(manipulator!)).toBe("page_down");
  });
});
