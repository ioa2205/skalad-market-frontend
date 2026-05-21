/**
 * Token-discipline guard.
 *
 * Closes the §2 "no raw color / radius / shadow outside tokens" gate from
 * project-documentation/build-plan.md. The lint enforcement is intentionally
 * a unit test (cheap, runs everywhere `vitest` runs) rather than an ESLint
 * rule — adding a custom rule for one repo is overkill, and `eslint-plugin-
 * tailwindcss` does not flag arbitrary class strings.
 *
 * Allowed:
 *   - styles/tokens.css (raw values live here by definition)
 *   - tailwind.config.ts (re-exposes tokens)
 *   - this guard file itself
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");

const SCAN_ROOTS = ["app", "components", "features", "lib", "styles"];
const ALLOWLIST = new Set([
  normalize("styles/tokens.css"),
  normalize("tailwind.config.ts"),
  normalize("tests/tokens.guard.test.ts"),
]);

const HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/;
const RGB_FN = /\brgb[a]?\(/;
const HSL_FN_RAW = /\bhsl[a]?\(\s*\d/;
const INLINE_STYLE_ATTR = /\bstyle\s*=\s*\{?\{[^}]*(color|background|border|box-shadow)/i;

const TEXT_EXT = /\.(tsx?|css|mts|mjs|cjs)$/;

function normalize(path: string): string {
  return path.split("/").join(sep);
}

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  return entries.flatMap((name) => {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (name === "node_modules" || name === ".next" || name === "dist") return [];
      return walk(full);
    }
    return TEXT_EXT.test(name) ? [full] : [];
  });
}

function scanFiles(): Array<{ file: string; line: number; match: string }> {
  const offenders: Array<{ file: string; line: number; match: string }> = [];
  for (const sub of SCAN_ROOTS) {
    const dir = join(ROOT, sub);
    let files: string[];
    try {
      files = walk(dir);
    } catch {
      continue;
    }
    for (const file of files) {
      const rel = relative(ROOT, file);
      if (ALLOWLIST.has(rel)) continue;
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, idx) => {
        if (HEX_COLOR.test(line) || RGB_FN.test(line) || HSL_FN_RAW.test(line)) {
          offenders.push({ file: rel, line: idx + 1, match: line.trim().slice(0, 120) });
        }
        if (INLINE_STYLE_ATTR.test(line)) {
          offenders.push({ file: rel, line: idx + 1, match: line.trim().slice(0, 120) });
        }
      });
    }
  }
  return offenders;
}

describe("design-token guard", () => {
  it("contains no raw hex/rgb/hsl colors or color-style inline attributes", () => {
    const offenders = scanFiles();
    expect(
      offenders,
      "Move raw color values into styles/tokens.css and consume via Tailwind tokens.",
    ).toEqual([]);
  });
});
