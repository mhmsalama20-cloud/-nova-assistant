import { readFileSync, writeFileSync } from "node:fs";

const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2' +
  "?family=IBM+Plex+Mono:wght@400;500;600" +
  "&family=IBM+Plex+Sans:wght@400;450;500;600" +
  '&family=Instrument+Serif:ital@0;1&display=swap">';

let html = readFileSync("bundle.raw.html", "utf8");

/* 1. Standalone page — fonts go straight after the <html> open tag, which is
      the one structural anchor Parcel's minifier always leaves behind. */
if (!html.includes("fonts.googleapis.com")) {
  const open = html.match(/<html[^>]*>/i);
  html = open ? html.replace(open[0], open[0] + FONTS) : FONTS + html;
}
writeFileSync("bundle.html", html);

/* 2. Wrapper-less copy for hosts that supply their own skeleton. Only the
      document's own opening and closing tags are trimmed — a blanket regex
      would also hit any such string sitting inside the inlined bundle. */
let inner = html
  .replace(/^\s*<!doctype html>/i, "")
  .replace(/^\s*<html[^>]*>/i, "")
  .replace(/^\s*<head[^>]*>/i, "")
  .replace(/<meta[^>]*charset[^>]*>/i, "")
  .replace(/<meta[^>]*viewport[^>]*>/i, "")
  .trim();

inner = inner.replace(/^<body[^>]*>/i, "").replace(FONTS, "").trim();
for (;;) {
  const tail = inner.match(/<\/(head|body|html)>$/i);
  if (!tail) break;
  inner = inner.slice(0, -tail[0].length).trimEnd();
}

/* The <title> lands after a ~48 kB <style> block, well past the 8 kB the
   artifact host scans for it. Hoist it to the front. */
const title = inner.match(/<title>[\s\S]*?<\/title>/i);
if (title) inner = inner.replace(title[0], "").trim();

writeFileSync("artifact.html", `${title ? title[0] : ""}\n${FONTS}\n${inner}\n`);
