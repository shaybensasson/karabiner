import { beforeAll } from "vitest";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KARABINER_CONFIG_PATH = join(__dirname, "../karabiner.json");

beforeAll(() => {
  // Verify karabiner.json exists
  if (!existsSync(KARABINER_CONFIG_PATH)) {
    throw new Error(
      "karabiner.json not found. Run: yarn build to generate it."
    );
  }
});
