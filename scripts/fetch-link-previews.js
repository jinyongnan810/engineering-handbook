import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.resolve(__dirname, "../content/topics");
const OUTPUT_FILE = path.resolve(__dirname, "../src/data/linkPreviews.json");

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();
}

function resolveUrl(relative, base) {
  if (!relative) return undefined;
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

function extractMetaTags(html, pageUrl) {
  const meta = {
    url: pageUrl,
    hostname: new URL(pageUrl).hostname.replace(/^www\./, ""),
  };

  // Extract <title>
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    meta.title = decodeHtmlEntities(titleMatch[1].replace(/\s+/g, " "));
  }

  // Extract Open Graph & Twitter meta tags
  const tagRegex = /<meta\s+([^>]+)>/gi;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(html)) !== null) {
    const attributes = tagMatch[1];
    const propertyMatch = attributes.match(
      /(?:property|name)=["']([^"']+)["']/i,
    );
    const contentMatch = attributes.match(/content=["']([\s\S]*?)["']/i);

    if (propertyMatch && contentMatch) {
      const prop = propertyMatch[1].toLowerCase();
      const content = decodeHtmlEntities(contentMatch[1]);

      if (prop === "og:title" || (prop === "twitter:title" && !meta.title)) {
        meta.title = content;
      } else if (
        prop === "og:description" ||
        prop === "description" ||
        (prop === "twitter:description" && !meta.description)
      ) {
        if (!meta.description || prop === "og:description") {
          meta.description = content;
        }
      } else if (
        prop === "og:image" ||
        prop === "og:image:url" ||
        (prop === "twitter:image" && !meta.image) ||
        (prop === "twitter:image:src" && !meta.image)
      ) {
        if (!meta.image || prop === "og:image") {
          meta.image = resolveUrl(content, pageUrl);
        }
      } else if (prop === "og:site_name") {
        meta.siteName = content;
      }
    }
  }

  // Extract favicon
  const iconRegex = /<link\s+[^>]*rel=["'](?:shortcut )?icon["'][^>]*>/gi;
  const iconMatch = iconRegex.exec(html);
  if (iconMatch) {
    const hrefMatch = iconMatch[0].match(/href=["']([^"']+)["']/i);
    if (hrefMatch && hrefMatch[1]) {
      meta.favicon = resolveUrl(hrefMatch[1], pageUrl);
    }
  }

  // Fallback to Google Favicon API or domain root favicon if none found
  if (!meta.favicon) {
    meta.favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
      meta.hostname,
    )}&sz=64`;
  }

  if (!meta.siteName) {
    meta.siteName = meta.hostname;
  }

  return meta;
}

async function fetchMetadata(url) {
  try {
    const parsedUrl = new URL(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[Warning] HTTP ${response.status} for ${url}`);
      return {
        url,
        hostname: parsedUrl.hostname.replace(/^www\./, ""),
        title: parsedUrl.hostname,
        favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
          parsedUrl.hostname,
        )}&sz=64`,
      };
    }

    const html = await response.text();
    return extractMetaTags(html, response.url || url);
  } catch (error) {
    console.warn(
      `[Warning] Failed to fetch metadata for ${url}:`,
      error.message,
    );
    const parsed = new URL(url);
    return {
      url,
      hostname: parsed.hostname.replace(/^www\./, ""),
      title: parsed.hostname,
      favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
        parsed.hostname,
      )}&sz=64`,
    };
  }
}

function findMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractBareUrlsFromMarkdown(content) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const urls = new Set();
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) {
      continue;
    }

    // Check if line is a standalone URL (http:// or https://)
    if (/^https?:\/\/[^\s]+$/.test(trimmed)) {
      urls.add(trimmed);
    }
  }

  return Array.from(urls);
}

async function main() {
  console.log("Scanning markdown files for bare URLs...");

  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  const mdFiles = findMarkdownFiles(CONTENT_DIR);
  const foundUrls = new Set();

  for (const file of mdFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const fileUrls = extractBareUrlsFromMarkdown(content);
    for (const url of fileUrls) {
      foundUrls.add(url);
    }
  }

  console.log(
    `Found ${foundUrls.size} unique standalone URL(s) in markdown files.`,
  );

  const isForce = process.argv.includes("--force");

  let cache = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
    } catch {
      cache = {};
    }
  }

  let updatedCount = 0;
  for (const url of foundUrls) {
    const isCachedFallback =
      cache[url] &&
      !cache[url].description &&
      !cache[url].image &&
      cache[url].title === cache[url].hostname;

    if (isForce || !cache[url] || isCachedFallback) {
      console.log(`Fetching metadata for: ${url}`);
      const meta = await fetchMetadata(url);
      cache[url] = meta;
      updatedCount += 1;
    }
  }

  // Sort cache keys alphabetically for consistent diffs
  const sortedCache = {};
  for (const key of Object.keys(cache).sort()) {
    sortedCache[key] = cache[key];
  }

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(sortedCache, null, 2) + "\n",
    "utf-8",
  );
  console.log(
    `Link preview cache updated: ${OUTPUT_FILE} (${updatedCount} newly fetched, ${
      Object.keys(sortedCache).length
    } total)`,
  );
}

main().catch((err) => {
  console.error("Error in fetch-link-previews script:", err);
  process.exit(1);
});
