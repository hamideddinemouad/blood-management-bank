import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const sourceRoot = join(projectRoot, "src");

const collectSourceFiles = (directory) =>
  readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return collectSourceFiles(fullPath);
    }

    return /\.(js|jsx)$/.test(entry) && !entry.endsWith(".test.js") && !entry.endsWith(".test.jsx")
      ? [fullPath]
      : [];
  });

const hardcodedApiPatterns = [
  /\bfetch\(\s*["'`]\/api\b/,
  /\baxios\.(get|post|put|patch|delete)\(\s*["'`]\/api\b/,
  /\bAPI_BASE_URL\s*=\s*["'`]\/api["'`]/,
];

describe("API URL usage", () => {
  it("keeps frontend API calls routed through buildApiUrl", () => {
    const violations = collectSourceFiles(sourceRoot).flatMap((filePath) => {
      const relativePath = relative(projectRoot, filePath);

      return readFileSync(filePath, "utf8")
        .split("\n")
        .flatMap((line, index) => {
          if (line.trim().startsWith("//")) {
            return [];
          }

          return hardcodedApiPatterns.some((pattern) => pattern.test(line))
            ? [`${relativePath}:${index + 1}: ${line.trim()}`]
            : [];
        });
    });

    expect(violations).toEqual([]);
  });
});
