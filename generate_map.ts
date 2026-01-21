#!/usr/bin/env npx tsx
/**
 * Generate keyboard shortcuts HTML and optionally PDF from Karabiner config.
 *
 * Usage:
 *   npx tsx generate_map.ts              # Generate HTML only
 *   npx tsx generate_map.ts --pdf        # Generate HTML and PDF
 */

import fs from "fs";
import path from "path";
import {
  hyperSubLayers,
  directHyperShortcuts,
  windowCyclingShortcuts,
  generalMappings,
  staticShortcutDocs,
} from "./rules";
import {
  isSubLayerWithMeta,
  isLayerCommand,
  LayerCommand,
  HyperKeySublayer,
} from "./utils";

// ============================================================================
// Types
// ============================================================================

interface Shortcut {
  keys: string;
  description: string;
}

interface Category {
  title: string;
  leaderKey?: string;
  shortcuts: Shortcut[];
}

// ============================================================================
// Parse Configuration
// ============================================================================

/**
 * Extract the description from a LayerCommand.
 * All commands must have explicit descriptions defined in rules.ts.
 */
function getDescription(cmd: LayerCommand): string {
  if (cmd.description) {
    return cmd.description;
  }
  return "Unknown";
}

/**
 * Build categories from the exported configuration.
 */
function buildCategories(): Category[] {
  const categories: Category[] = [];

  // 1. General shortcuts (combined from static docs and generated mappings)
  categories.push({
    title: "General",
    shortcuts: [
      ...staticShortcutDocs.map((s) => ({
        keys: s.keys,
        description: s.description,
      })),
      ...generalMappings.map((s) => ({
        keys: s.keys,
        description: s.description,
      })),
    ],
  });

  // 2. Direct hyper shortcuts (including window cycling shortcuts)
  const allDirectShortcuts = [
    ...directHyperShortcuts.map((s) => ({
      keys: `◆ ${s.keyDisplay || s.key}`,
      description: s.description,
    })),
    ...windowCyclingShortcuts.map((s) => ({
      keys: `◆ ${s.keyDisplay || s.key}`,
      description: s.description,
    })),
  ];
  categories.push({
    title: "Direct Hyper",
    leaderKey: "◆ + key",
    shortcuts: allDirectShortcuts,
  });

  // 3. Sublayers from hyperSubLayers
  for (const [key, sublayer] of Object.entries(hyperSubLayers)) {
    if (!sublayer) continue;

    // Skip direct commands (handled separately if needed)
    if (isLayerCommand(sublayer)) continue;

    // Get title and commands
    let title: string;
    let commands: HyperKeySublayer;

    if (isSubLayerWithMeta(sublayer)) {
      title = sublayer.title;
      commands = sublayer.commands;
    } else {
      // Legacy format without title
      title = key.toUpperCase();
      commands = sublayer;
    }

    const shortcuts: Shortcut[] = [];
    for (const [cmdKey, cmd] of Object.entries(commands)) {
      if (!cmd) continue;
      shortcuts.push({
        keys: `◆ ${key.toUpperCase()} ${cmdKey.toUpperCase()}`,
        description: getDescription(cmd),
      });
    }

    // Sort shortcuts by key
    shortcuts.sort((a, b) => a.keys.localeCompare(b.keys));

    categories.push({
      title,
      leaderKey: `◆ ${key.toUpperCase()}`,
      shortcuts,
    });
  }

  return categories;
}

// ============================================================================
// HTML Generation
// ============================================================================

const legend: Shortcut[] = [
  { keys: "◆", description: "Caps Lock (Hyper Key)" },
  { keys: "⌘", description: "Command" },
  { keys: "⌥", description: "Option / Alt" },
  { keys: "⌃", description: "Control" },
  { keys: "⇧", description: "Shift" },
];

function formatKeys(keys: string): string {
  return keys.replace(/([◆⌘⌥⌃⇧←→↑↓])/g, '<span class="mod">$1</span>');
}

function formatDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function generateShortcutRow(shortcut: Shortcut): string {
  return `        <div class="shortcut-row">
          <span class="shortcut-keys">${formatKeys(shortcut.keys)}</span>
          <span class="shortcut-desc">${shortcut.description}</span>
        </div>`;
}

function generateCategory(category: Category): string {
  const leaderPart = category.leaderKey
    ? ` <span class="leader-key">(${formatKeys(category.leaderKey)})</span>`
    : "";

  const shortcuts = category.shortcuts.map(generateShortcutRow).join("\n");

  return `      <div class="category">
        <div class="category-title">${category.title}${leaderPart}</div>
${shortcuts}
      </div>`;
}

function generateHTML(categories: Category[]): string {
  // Distribute categories into 4 columns
  // Column 1: General, Direct Hyper
  // Column 2: Query, Open Apps, Browse, Window
  // Column 3: AI, Raycast, System, Any remaining categories
  // Column 4: Legend, How It Works

  const findCategory = (title: string) =>
    categories.find((c) => c.title === title);

  // Explicitly placed categories
  const col1Titles = ["General", "Direct Hyper"];
  const col2Titles = ["Query", "Open Apps", "Browse"];
  const col3Titles = ["AI", "Raycast", "System", "Window"];

  const col1Categories = col1Titles
    .map(findCategory)
    .filter(Boolean) as Category[];

  const col2Categories = col2Titles
    .map(findCategory)
    .filter(Boolean) as Category[];

  // Collect any categories not explicitly assigned to ensure nothing is missed
  const assignedTitles = new Set([...col1Titles, ...col2Titles, ...col3Titles]);
  const remainingCategories = categories.filter(
    (c) => !assignedTitles.has(c.title)
  );

  const col3Categories = [
    ...col3Titles.map(findCategory).filter(Boolean),
    ...remainingCategories,
  ] as Category[];

  const col4Categories = [] as Category[];

  const col1Html = col1Categories.map(generateCategory).join("\n\n");
  const col2Html = col2Categories.map(generateCategory).join("\n\n");
  const col3Html = col3Categories.map(generateCategory).join("\n\n");
  const col4Html = col4Categories.map(generateCategory).join("\n\n");

  const legendHtml = legend.map(generateShortcutRow).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Karabiner Keyboard Shortcuts for macOS</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 15mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
      background: white;
      padding: 20px;
    }

    .header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 3px solid #ff6b35;
      padding-bottom: 10px;
    }

    .logo {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
      border-radius: 8px;
      margin-right: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 23px;
    }

    .title h1 {
      font-size: 25px;
      font-weight: 300;
      color: #333;
    }

    .title h2 {
      font-size: 15px;
      font-weight: 400;
      color: #666;
    }

    .columns {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .category {
      margin-bottom: 12px;
    }

    .category-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 6px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 3px;
    }

    .leader-key {
      color: #ff6b35;
      font-weight: 600;
    }

    .shortcut-row {
      display: flex;
      justify-content: space-between;
      padding: 2px 4px;
      gap: 8px;
    }

    .shortcut-row:nth-child(odd) {
      background-color: #f5f5f5;
    }

    .shortcut-keys {
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 11.5px;
      color: #555;
      white-space: nowrap;
      min-width: 70px;
    }

    .mod {
      font-size: 16px;
      vertical-align: middle;
      line-height: 1;
    }

    .shortcut-desc {
      font-size: 11.5px;
      color: #333;
      text-align: right;
      flex: 1;
    }

    .note {
      font-size: 11px;
      color: #888;
      margin-top: 15px;
      text-align: center;
      grid-column: span 4;
    }

    kbd {
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 3px;
      padding: 1px 4px;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 11px;
    }

    @media print {
      @page {
        size: A4 landscape;
        margin: 8mm;
      }
      body {
        padding: 10px;
        font-size: 11px;
      }
      .header {
        margin-bottom: 12px;
        padding-bottom: 6px;
      }
      .logo {
        width: 34px;
        height: 34px;
        font-size: 19px;
      }
      .title h1 {
        font-size: 22px;
      }
      .title h2 {
        font-size: 13px;
      }
      .columns {
        gap: 16px;
      }
      .category {
        margin-bottom: 9px;
      }
      .category-title {
        font-size: 12px;
        margin-bottom: 4px;
      }
      .shortcut-row {
        padding: 1px 3px;
      }
      .shortcut-keys {
        font-size: 10.5px;
        min-width: 60px;
      }
      .mod {
        font-size: 14px;
      }
      .shortcut-desc {
        font-size: 10.5px;
      }
      .note {
        font-size: 9px;
        margin-top: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">K</div>
    <div class="title">
      <h1>Karabiner Elements</h1>
      <h2>Keyboard shortcuts for macOS</h2>
    </div>
  </div>

  <div class="columns">
    <!-- Column 1 -->
    <div>
${col1Html}
    </div>

    <!-- Column 2 -->
    <div>
${col2Html}
    </div>

    <!-- Column 3 -->
    <div>
${col3Html}
    </div>

    <!-- Column 4 -->
    <div>
${col4Html}

      <div class="category">
        <div class="category-title">Legend</div>
${legendHtml}
      </div>

      <div class="category">
        <div class="category-title">How It Works</div>
        <p style="font-size: 9px; color: #666; line-height: 1.5;">
          <strong>Leader key style:</strong> Tap Caps Lock, release,
          then tap sublayer key (e.g., O), release, then tap command key (e.g., S for Slack).
          <br><br>
          <strong>Direct shortcuts:</strong> Hold Caps Lock + press key simultaneously (arrows, 1/2/3, F3).
          <br><br>
          <strong>Timeout:</strong> 500ms window between key presses.
        </p>
      </div>
    </div>

    <div class="note">
      Generated from Karabiner TypeScript config on ${formatDateTime(new Date())} • <span class="mod">◆</span> = Caps Lock acts as Hyper Key (<span class="mod">⌃⌥⇧⌘</span>)
    </div>
  </div>
</body>
</html>
`;
}

// ============================================================================
// PDF Generation
// ============================================================================

async function generatePDF(htmlPath: string, pdfPath: string): Promise<void> {
  try {
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.default.launch();
    const page = await browser.newPage();

    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });

    await page.pdf({
      path: pdfPath,
      format: "A4",
      landscape: true,
      printBackground: true,
      scale: 0.85,
      margin: { top: "8mm", right: "8mm", bottom: "8mm", left: "8mm" },
    });

    await browser.close();
    console.log(`✓ PDF generated: ${pdfPath}`);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (
      error.code === "ERR_MODULE_NOT_FOUND" ||
      error.message?.includes("puppeteer")
    ) {
      console.error("Error: puppeteer is required for PDF generation.");
      console.error("Install it with: yarn add puppeteer");
      process.exit(1);
    }
    throw err;
  }
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const generatePdfFlag = args.includes("--pdf");

  const baseDir = path.dirname(new URL(import.meta.url).pathname);
  const htmlPath = path.join(baseDir, "keyboard-shortcuts.html");
  const pdfPath = path.join(baseDir, "keyboard-shortcuts.pdf");

  // Build categories from config
  const categories = buildCategories();

  // Generate HTML
  const html = generateHTML(categories);
  fs.writeFileSync(htmlPath, html);
  console.log(`✓ HTML generated: ${htmlPath}`);

  // Generate PDF if requested
  if (generatePdfFlag) {
    await generatePDF(htmlPath, pdfPath);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
