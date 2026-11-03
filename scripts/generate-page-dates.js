import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");
const INDEX_FILE = path.resolve(ROOT_DIR, "content/index.json");
const OUTPUT_FILE = path.resolve(ROOT_DIR, "src/data/pageDates.json");

function getGitCommitDates() {
  const dates = new Map();

  try {
    const log = execSync('git log --name-only --format="COMMIT:%cI"', {
      cwd: ROOT_DIR,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    let currentDate = null;
    for (const rawLine of log.split("\n")) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith("COMMIT:")) {
        currentDate = line.slice(7).trim();
      } else if (currentDate && !dates.has(line)) {
        dates.set(line, currentDate);
      }
    }
  } catch (error) {
    console.warn("Could not read git commit log:", error.message);
  }

  return dates;
}

function getChangedFiles() {
  const changed = new Set();

  try {
    const status = execSync("git status --porcelain content/topics", {
      cwd: ROOT_DIR,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    for (const rawLine of status.split("\n")) {
      const line = rawLine.trim();
      if (!line) continue;
      // Git status porcelain format: XY path or XY "path"
      const filePath = line.slice(2).trim().replace(/^"|"$/g, "");
      changed.add(filePath);
    }
  } catch {
    // Ignore error if git status fails
  }

  return changed;
}

function getExistingDates() {
  if (!fs.existsSync(OUTPUT_FILE)) {
    return {};
  }

  try {
    const content = fs.readFileSync(OUTPUT_FILE, "utf8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function generatePageDates() {
  if (!fs.existsSync(INDEX_FILE)) {
    console.error(`Index file not found: ${INDEX_FILE}`);
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
  const gitDates = getGitCommitDates();
  const changedFiles = getChangedFiles();
  const existingDates = getExistingDates();
  const nowIso = new Date().toISOString();

  const result = {};

  for (const item of index) {
    const enRelative = path.join("content", item.file);
    const jpRelative = enRelative.replace(/\.md$/, "_jp.md");

    const enFullPath = path.resolve(ROOT_DIR, enRelative);
    const jpFullPath = path.resolve(ROOT_DIR, jpRelative);

    const hasEn = fs.existsSync(enFullPath);
    const hasJp = fs.existsSync(jpFullPath);

    let enDate = null;
    if (hasEn) {
      if (changedFiles.has(enRelative)) {
        enDate = nowIso;
      } else {
        enDate =
          gitDates.get(enRelative) ?? existingDates[item.slug]?.en ?? null;
      }
    }

    let jpDate = null;
    if (hasJp) {
      if (changedFiles.has(jpRelative)) {
        jpDate = nowIso;
      } else {
        jpDate =
          gitDates.get(jpRelative) ?? existingDates[item.slug]?.jp ?? null;
      }
    }

    result[item.slug] = {
      en: enDate,
      jp: jpDate,
    };
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2) + "\n", "utf8");

  console.log(
    `Generated last-edited dates for ${Object.keys(result).length} topics in src/data/pageDates.json`,
  );
}

generatePageDates();
