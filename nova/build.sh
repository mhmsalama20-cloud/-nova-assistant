#!/bin/bash
# Bundle the console into a single self-contained HTML file.
#
# Two things the stock bundle script cannot do on its own:
#   1. The Google Fonts <link> cannot live in index.html — html-inline treats
#      every <link href> as a local path and dies reading https:/fonts.google…
#      So the fonts are injected after inlining instead.
#   2. Parcel's HTML minifier drops <head> and <body> altogether, so the
#      wrapper-less copy is built by trimming anchored tags, not by matching
#      a <body> block that is not there.
set -e

bash /mnt/skills/examples/web-artifacts-builder/scripts/bundle-artifact.sh

[ -s dist/index.html ] || { echo "❌ Parcel produced no dist/index.html"; exit 1; }

pnpm exec html-inline dist/index.html > bundle.raw.html
node build-post.mjs
rm -f bundle.raw.html

echo ""
echo "✅ bundle.html   $(du -h bundle.html | cut -f1)  standalone page"
echo "✅ artifact.html $(du -h artifact.html | cut -f1)  no <html>/<head>/<body> wrapper"
