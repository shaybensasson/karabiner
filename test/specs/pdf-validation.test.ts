import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Count pages in a PDF by searching for /Type /Page entries.
 * This is a simple heuristic that works for most PDFs.
 */
function countPdfPages(pdfPath: string): number {
  const buffer = fs.readFileSync(pdfPath);
  const content = buffer.toString("binary");

  // Count /Type /Page (but not /Type /Pages which is the parent)
  // Use regex to find /Type followed by optional whitespace and /Page (not /Pages)
  const pageMatches = content.match(/\/Type\s*\/Page(?!s)/g);
  return pageMatches ? pageMatches.length : 0;
}

describe("PDF Documentation Validation", () => {
  const pdfPath = path.join(__dirname, "../../keyboard-shortcuts.pdf");

  it("keyboard-shortcuts.pdf exists", () => {
    expect(fs.existsSync(pdfPath)).toBe(true);
  });

  it("keyboard-shortcuts.pdf is exactly 1 page", () => {
    const pageCount = countPdfPages(pdfPath);
    expect(pageCount).toBe(1);
  });
});
