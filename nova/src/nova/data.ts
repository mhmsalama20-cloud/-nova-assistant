/* Seeded transcripts for the console. Every thread is a piece of work on the
   same imaginary system: a survey pipeline that ingests FITS frames and serves
   them as map tiles. The vocabulary is the point — it is what makes the
   instrumentation panels mean something. */

export type ToolCall = {
  name: string;
  args: string;
  status: "ok" | "error";
  ms: number;
  result: string;
};

export type Block =
  | { kind: "text"; body: string }
  | { kind: "reasoning"; body: string }
  | { kind: "tool"; call: ToolCall }
  | { kind: "code"; lang: string; body: string };

export type Usage = { in: number; out: number; cached: number; ttft: number };

export type Message = {
  id: string;
  role: "user" | "nova";
  at: string;
  blocks: Block[];
  usage?: Usage;
};

export type Thread = {
  id: string;
  title: string;
  when: string;
  group: "Today" | "Yesterday" | "Last week";
  starred?: boolean;
  messages: Message[];
};

export const MODEL = "nova-2 · 200k";
export const CONTEXT_WINDOW = 200_000;
export const SYSTEM_TOKENS = 1_284;
export const TOOL_TOKENS = 3_106;

export const THREADS: Thread[] = [
  {
    id: "tiles",
    title: "Slow tile reads on obs_frames",
    when: "14:11",
    group: "Today",
    starred: true,
    messages: [
      {
        id: "m1",
        role: "user",
        at: "14:06",
        blocks: [
          {
            kind: "text",
            body:
              "The tile endpoint went from 40 ms to 2.3 s after we backfilled March. Same query, same bounding box. `obs_frames` is at 41 M rows now.\n\nWhere do I start?",
          },
        ],
      },
      {
        id: "m2",
        role: "nova",
        at: "14:06",
        usage: { in: 8_402, out: 611, cached: 7_100, ttft: 380 },
        blocks: [
          {
            kind: "reasoning",
            body:
              "A 57x regression right after a bulk backfill is almost always the planner flipping strategy once the row estimate crosses a threshold — not the data volume itself. Check the plan before touching anything.",
          },
          {
            kind: "tool",
            call: {
              name: "run_query",
              args: 'db="survey_prod", readonly=true',
              status: "ok",
              ms: 2_310,
              result:
                "Seq Scan on obs_frames  (cost=0.00..1284402.00 rows=118 width=96)\n  Filter: ((ra BETWEEN 149.1 AND 150.4) AND (dec BETWEEN 1.6 AND 2.9)\n           AND (band = 'r'::text))\n  Rows Removed by Filter: 41204882\n  Buffers: shared read=884210\nPlanning Time: 0.412 ms\nExecution Time: 2298.640 ms",
            },
          },
          {
            kind: "text",
            body:
              "It is a sequential scan — 884k buffers read to return 118 rows. The old plan was almost certainly an index scan on `ix_frames_band`, and the backfill pushed `band = 'r'` past the point where that index still looked selective.\n\nTwo things are true at once:\n\n- Filtering on `band` alone is now weak. March added ~9 M r-band frames, so that predicate matches roughly a third of the table.\n- The `ra` / `dec` box is the selective part of the query, and nothing indexes it.\n\nA composite index that leads with the sky coordinates puts the selectivity back where the query needs it:",
          },
          {
            kind: "code",
            lang: "sql",
            body:
              "CREATE INDEX CONCURRENTLY ix_frames_sky_band\n    ON obs_frames (band, ra, dec)\n INCLUDE (frame_id, exposure_s, seeing_arcsec)\n WHERE status = 'reduced';",
          },
          {
            kind: "text",
            body:
              "The `INCLUDE` list covers every column the tile serialiser reads, so the heap is never touched. The partial predicate drops the ~4 M frames still sitting in `raw` and `failed`, which the endpoint never serves anyway.\n\nEstimated size is about 1.1 GB. Want me to check what that does to the write path first?",
          },
        ],
      },
      {
        id: "m3",
        role: "user",
        at: "14:10",
        blocks: [
          {
            kind: "text",
            body:
              "Yes — we can't take a long lock. Ingest writes to this table continuously, roughly 400 rows/s during a night.",
          },
        ],
      },
      {
        id: "m4",
        role: "nova",
        at: "14:11",
        usage: { in: 9_960, out: 448, cached: 8_402, ttft: 344 },
        blocks: [
          {
            kind: "tool",
            call: {
              name: "search_docs",
              args: 'q="CREATE INDEX CONCURRENTLY locking", source="pg17"',
              status: "ok",
              ms: 186,
              result:
                "3 passages · postgresql.org/docs/17/sql-createindex.html\nCONCURRENTLY takes SHARE UPDATE EXCLUSIVE, which does not block\nINSERT/UPDATE/DELETE. Requires two table scans and waits for all\ntransactions holding conflicting snapshots to finish.",
            },
          },
          {
            kind: "text",
            body:
              "`CONCURRENTLY` is already in the statement above, so ingest keeps writing throughout. What it costs you instead:\n\n- **Two passes** over 41 M rows. At your I/O ceiling, budget 25-40 minutes.\n- **It waits on open snapshots.** Any long transaction blocks the build from finishing. The nightly reduction job holds one for ~18 minutes.\n- **A failed build leaves an invalid index behind.** It is inert but still gets maintained on write, so it has to be dropped by hand.\n\nStart it just after the reduction job commits — around 09:40 UTC — and check `pg_stat_progress_create_index` rather than waiting on the psql prompt. If it comes back `indisvalid = false`, drop it and rerun; that is a normal outcome under write load, not a corruption signal.",
          },
        ],
      },
    ],
  },
  {
    id: "release",
    title: "Release notes — pipeline 2.4",
    when: "11:52",
    group: "Today",
    messages: [
      {
        id: "r1",
        role: "user",
        at: "11:48",
        blocks: [
          {
            kind: "text",
            body:
              "Turn the merged PRs since 2.3.6 into release notes. Audience is the survey ops team, not developers — they care about what changes for them at the console.",
          },
        ],
      },
      {
        id: "r2",
        role: "nova",
        at: "11:52",
        usage: { in: 14_220, out: 902, cached: 11_800, ttft: 410 },
        blocks: [
          {
            kind: "tool",
            call: {
              name: "list_merged_prs",
              args: 'repo="survey/pipeline", since="v2.3.6"',
              status: "ok",
              ms: 742,
              result:
                "31 pull requests merged between 2025-08-04 and 2025-09-05\n  18 fix · 7 feat · 4 perf · 2 chore",
            },
          },
          {
            kind: "text",
            body:
              "Twenty-nine of the thirty-one are invisible to ops. Here is the set that actually changes their day:\n\n- **Bad-seeing frames are now flagged, not dropped.** Anything over 2.4″ lands in the review queue instead of vanishing. Expect roughly 40 extra frames a night to need a decision.\n- **Re-reduction no longer needs a ticket.** The `Re-run` button on a frame is live for anyone in `ops`, and it reuses the original calibration set.\n- **Ingest backlog is on the status board.** The number that went unnoticed during incident 0219 now has a panel and pages at 15 minutes.\n\nThe two chores are a Python bump and a docs move — nothing to say about either. Want this as the changelog entry, or as the shift-handover note?",
          },
        ],
      },
    ],
  },
  {
    id: "incident",
    title: "Incident 0219 — ingest backlog",
    when: "Yesterday",
    group: "Yesterday",
    messages: [
      {
        id: "i1",
        role: "user",
        at: "16:31",
        blocks: [
          {
            kind: "text",
            body:
              "Writing up 0219. We lost 6 hours of ingest and nobody noticed until the morning check. Help me build the timeline from the logs.",
          },
        ],
      },
      {
        id: "i2",
        role: "nova",
        at: "16:33",
        usage: { in: 22_180, out: 1_204, cached: 18_400, ttft: 522 },
        blocks: [
          {
            kind: "tool",
            call: {
              name: "query_logs",
              args: 'service="ingest", from="2025-09-06T20:00Z", to="2025-09-07T08:00Z"',
              status: "ok",
              ms: 3_940,
              result:
                "204,118 lines scanned · 1,442 matched level>=warn\nfirst warn  21:14:07Z  queue depth 1,204 (threshold 800)\nfirst error 21:19:51Z  s3: SlowDown (503) x14\nlast error  03:07:22Z  s3: SlowDown (503)\nrecovery    03:11:40Z  queue depth 12",
            },
          },
          {
            kind: "text",
            body:
              "The shape is clear enough to write up:\n\n- **21:14Z** — queue depth crosses 800. The warning fires into `#pipeline-noise`, which nobody watches.\n- **21:20Z** — S3 starts returning `SlowDown`. The retry policy is unbounded exponential backoff with no ceiling, so workers back off to 40-minute sleeps and stay there.\n- **21:20Z-03:07Z** — 5 h 47 m with a median of 3 frames written per minute against an arrival rate of 400.\n- **03:11Z** — throttling lifts, the queue drains in four minutes. No data was lost; it was late, not gone.\n\nThe honest root cause is not S3. It is that a six-hour outage produced exactly one warning, in a channel with no owner. The backoff ceiling is the second fix, not the first.",
          },
        ],
      },
    ],
  },
  {
    id: "egress",
    title: "Archive egress cost comparison",
    when: "Thu",
    group: "Last week",
    messages: [
      {
        id: "e1",
        role: "user",
        at: "09:12",
        blocks: [
          {
            kind: "text",
            body:
              "We serve about 340 TB of frame downloads a year to external collaborators. What does that cost on S3 versus R2, honestly — including the parts people forget?",
          },
        ],
      },
      {
        id: "e2",
        role: "nova",
        at: "09:14",
        usage: { in: 6_140, out: 738, cached: 4_900, ttft: 298 },
        blocks: [
          {
            kind: "text",
            body:
              "On list price the gap is not close, but the parts people forget are where the decision actually sits.\n\n- **Egress** is the headline: S3 charges per GB out, R2 charges nothing. At 340 TB that is the difference between a five-figure line item and zero.\n- **Requests are not free on either.** Frame downloads are many small GETs; at your file sizes request charges are a real fraction of the bill, not a rounding error.\n- **The migration is the hidden cost.** Reading 340 TB *out* of S3 once, to move it, is billed at the same egress rate you are trying to escape.\n\nThe number I would want before deciding: what fraction of those 340 TB is the same 200 or so frames being pulled repeatedly? If it is most of it, a cache in front of S3 gets you a large share of the saving without moving the archive at all.",
          },
        ],
      },
    ],
  },
];

/* --------------------------------------------------------------------------
   The console has no model behind it. Rather than fake one, replies are drawn
   from a small keyed set and the header says plainly that it is a prototype.
   -------------------------------------------------------------------------- */

const REPLIES: { match: RegExp; blocks: Block[] }[] = [
  {
    match: /\bindex|postgres|query|slow|explain|scan\b/i,
    blocks: [
      {
        kind: "text",
        body:
          "Before changing anything, get the plan for the exact query as the endpoint issues it — parameters bound, not a hand-written approximation. `EXPLAIN (ANALYZE, BUFFERS)` is the one that matters; the buffer counts tell you whether you are I/O bound or losing time in the executor.\n\nIf the plan shows a sequential scan where you expect an index, the usual causes are: a predicate the index cannot serve, a stale `ANALYZE`, or a type mismatch that silently disables it.",
      },
    ],
  },
  {
    match: /\bcost|price|budget|spend|egress|bill\b/i,
    blocks: [
      {
        kind: "text",
        body:
          "Cost questions get sharper once the volumes are separated from the rates. Tell me the monthly figures — GB stored, GB out, and request counts — and I can lay the options side by side against your real numbers rather than list prices.",
      },
    ],
  },
  {
    match: /\bincident|outage|postmortem|alert|page\b/i,
    blocks: [
      {
        kind: "text",
        body:
          "Two questions do most of the work in a write-up: what was the first signal that something was wrong, and how long after that did a person see it? The gap between those is usually the finding — the technical failure is often the less interesting half.",
      },
    ],
  },
  {
    match: /\bhello|hi\b|\bhey\b|what can you do|help\b/i,
    blocks: [
      {
        kind: "text",
        body:
          "This is a prototype of the Nova console — the interface is real and interactive, but there is no model wired up behind it, so what comes back is drawn from a small fixed set.\n\nThe seeded threads in the sidebar are the part worth looking at: they show how tool calls, reasoning traces, and token accounting render in the transcript. Try opening a tool block, or the reasoning line on the first reply.",
      },
    ],
  },
];

const FALLBACK: Block[] = [
  {
    kind: "text",
    body:
      "No model is connected to this console, so I cannot answer that one properly — this is an interface prototype, and replies come from a small fixed set.\n\nWhat is real here: the transcript rendering, the tool and reasoning blocks, the context accounting in the panel on the right, and the thread switching. The seeded conversations show all of it against a worked example.",
  },
];

export function respondTo(input: string): Block[] {
  const hit = REPLIES.find((r) => r.match.test(input));
  return hit ? hit.blocks : FALLBACK;
}

export function countTokens(t: Thread): number {
  const chars = t.messages.reduce(
    (n, m) => n + m.blocks.reduce((b, k) => b + ("body" in k ? k.body.length : 220), 0),
    0,
  );
  return Math.round(chars / 3.6);
}
