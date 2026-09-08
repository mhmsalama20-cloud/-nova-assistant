# nova-assistant

**Nova Console** — an assistant interface prototype, built as a single
self-contained HTML artifact.

The console is a working React app: thread switching, a filterable sidebar,
an auto-growing composer, expandable tool-call and reasoning blocks, and a
right-hand panel with live context-window accounting. There is no model
behind it — the seeded transcripts are fixed and typed replies are drawn
from a small keyed set, which the interface says plainly rather than
pretending otherwise.

## Layout

```
nova/
  src/App.tsx            shell: theme, thread state, reply streaming
  src/nova/data.ts       seeded transcripts, reply set, token accounting
  src/nova/Transcript.tsx  message, tool, reasoning and code renderers
  src/nova/Panels.tsx    sidebar and session inspector
  src/index.css          token system (light / dark / host-stamped)
  build.sh               bundle to a single HTML file
  build-post.mjs         post-inline fixups (see below)
```

## Building

```bash
cd nova
pnpm install
pnpm dev            # local dev server
bash build.sh       # → bundle.html and artifact.html
```

`build.sh` wraps the stock artifact bundler with two fixups that it needs:

- The Google Fonts `<link>` cannot sit in `index.html`, because `html-inline`
  treats every `<link href>` as a local path and dies trying to read
  `https:/fonts.googleapis.com` off disk. It is injected after inlining.
- Parcel's HTML minifier drops `<head>` and `<body>` altogether, so the
  wrapper-less copy is produced by trimming anchored tags rather than by
  matching a `<body>` block that is not in the output. The `<title>` is
  hoisted to the front of that copy, since hosts scan only the first 8 KB
  for it and Parcel leaves it behind a ~48 KB `<style>` block.

Two files come out:

| File            | Use                                                    |
| --------------- | ------------------------------------------------------ |
| `bundle.html`   | complete standalone page — open it in a browser        |
| `artifact.html` | same page without the `<html>`/`<head>`/`<body>` wrapper, for hosts that supply their own skeleton |

## Design

Neutrals are biased toward 220° so they sit under a sodium-amber accent
(`#E0932F`), which is spent only on the active thread marker, the streaming
caret, the send button, and the context gauge. Type is Instrument Serif for
the wordmark, IBM Plex Sans for the interface, and IBM Plex Mono for every
figure, label, and tool name.

Dark tokens serve all three viewer states — an explicit `data-theme` stamp
from the host, the un-stamped OS preference, and the console's own toggle,
which persists to `localStorage` and wins over both.
