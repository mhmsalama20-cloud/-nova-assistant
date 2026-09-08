import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, PanelLeft, PanelRight } from "lucide-react";
import { MessageRow } from "./nova/Transcript";
import { Inspector, Sidebar } from "./nova/Panels";
import {
  MODEL,
  THREADS,
  countTokens,
  respondTo,
  type Block,
  type Message,
  type Thread,
} from "./nova/data";

/* --- theme: host stamp, OS preference, and our own toggle --------------- */

type Mode = "light" | "dark";

function hostTheme(): Mode {
  const stamp = document.documentElement.getAttribute("data-theme");
  if (stamp === "dark" || stamp === "light") return stamp;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function storedTheme(): Mode | null {
  try {
    const v = localStorage.getItem("nova.theme");
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

function useTheme() {
  const [pinned, setPinned] = useState<Mode | null>(storedTheme);
  const [host, setHost] = useState<Mode>(hostTheme);
  const theme = pinned ?? host;

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const sync = () => setHost(hostTheme());
    mq?.addEventListener("change", sync);
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      mq?.removeEventListener("change", sync);
      obs.disconnect();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("nova-dark", theme === "dark");
    root.classList.toggle("nova-light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggle = useCallback(() => {
    const next: Mode = theme === "dark" ? "light" : "dark";
    setPinned(next);
    try {
      localStorage.setItem("nova.theme", next);
    } catch {
      /* private browsing — the choice just does not persist */
    }
  }, [theme]);

  return { theme, toggle };
}

function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia?.(query).matches ?? true);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

/* ----------------------------------------------------------------------- */

const clock = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const OPENERS = [
  "Why did this query get slow after a backfill?",
  "What does 340 TB of egress actually cost?",
  "Help me build an incident timeline",
];

export default function App() {
  const { theme, toggle } = useTheme();
  const wide = useMedia("(min-width: 1024px)");
  const xwide = useMedia("(min-width: 1280px)");

  const [threads, setThreads] = useState<Thread[]>(THREADS);
  const [activeId, setActiveId] = useState(THREADS[0].id);
  const [filter, setFilter] = useState("");
  const [draft, setDraft] = useState("");
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(wide);
  const [inspOpen, setInspOpen] = useState(xwide);

  const timer = useRef<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const box = useRef<HTMLTextAreaElement>(null);
  const activeRef = useRef(activeId);
  activeRef.current = activeId;

  const thread = threads.find((t) => t.id === activeId) ?? threads[0];
  const threadTokens = useMemo(() => countTokens(thread), [thread]);

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  // Opening a thread lands at its start — a transcript is read from the top,
  // and the tail end of a long reply makes a poor first frame.
  useEffect(() => {
    stick.current = false;
    if (scroller.current) scroller.current.scrollTop = 0;
  }, [activeId]);

  // Once you are following along, new content keeps the view at the bottom.
  useEffect(() => {
    if (stick.current && scroller.current)
      scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [thread.messages]);

  const patch = useCallback(
    (threadId: string, msgId: string, next: Partial<Message>) =>
      setThreads((ts) =>
        ts.map((t) =>
          t.id !== threadId
            ? t
            : { ...t, messages: t.messages.map((m) => (m.id === msgId ? { ...m, ...next } : m)) },
        ),
      ),
    [],
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || streamingId) return;

      const threadId = activeRef.current;
      const at = clock();
      const replyId = uid();
      const blocks = respondTo(text);
      const lead = blocks[0].kind === "text" ? blocks[0].body : "";

      setThreads((ts) =>
        ts.map((t) =>
          t.id !== threadId
            ? t
            : {
                ...t,
                when: at,
                title: t.messages.length ? t.title : text.slice(0, 44),
                messages: [
                  ...t.messages,
                  { id: uid(), role: "user", at, blocks: [{ kind: "text", body: text }] },
                  { id: replyId, role: "nova", at, blocks: [{ kind: "text", body: "" }] },
                ],
              },
        ),
      );
      setDraft("");
      setStreamingId(replyId);
      stick.current = true;

      const words = lead.split(/(\s+)/);
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let i = 0;
      const started = performance.now();

      timer.current = window.setInterval(() => {
        i += calm ? words.length : 3;
        const body = words.slice(0, i).join("");
        if (i < words.length) {
          patch(threadId, replyId, { blocks: [{ kind: "text", body } as Block] });
          return;
        }
        if (timer.current) window.clearInterval(timer.current);
        patch(threadId, replyId, {
          blocks,
          usage: {
            in: 1_284 + Math.round(text.length / 3.6),
            out: Math.round(lead.length / 3.6),
            cached: 1_284,
            ttft: Math.round(performance.now() - started),
          },
        });
        setStreamingId(null);
      }, calm ? 0 : 26);
    },
    [patch, streamingId],
  );

  const newThread = useCallback(() => {
    const id = uid();
    setThreads((ts) => [
      { id, title: "New thread", when: clock(), group: "Today", messages: [] },
      ...ts,
    ]);
    setActiveId(id);
    setFilter("");
    if (!wide) setNavOpen(false);
    window.setTimeout(() => box.current?.focus(), 0);
  }, [wide]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        newThread();
      }
      if (e.key === "Escape" && !wide) setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [newThread, wide]);

  const grow = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const sidebar = (
    <Sidebar
      threads={threads}
      activeId={activeId}
      onPick={(id) => {
        setActiveId(id);
        if (!wide) setNavOpen(false);
      }}
      onNew={newThread}
      filter={filter}
      onFilter={setFilter}
      theme={theme}
      onTheme={toggle}
      onClose={wide ? undefined : () => setNavOpen(false)}
    />
  );

  return (
    <div className="flex h-full w-full overflow-hidden bg-[hsl(var(--background))]">
      {wide && navOpen && (
        <div className="w-[262px] shrink-0 border-r border-[hsl(var(--hairline))]">
          {sidebar}
        </div>
      )}

      {!wide && navOpen && (
        <>
          <button
            type="button"
            aria-label="Close thread list"
            onClick={() => setNavOpen(false)}
            className="fixed inset-0 z-30 bg-black/40"
          />
          <div className="fixed inset-y-0 left-0 z-40 w-[270px] border-r border-[hsl(var(--hairline))] shadow-2xl">
            {sidebar}
          </div>
        </>
      )}

      <main className="flex min-w-0 flex-1 flex-col bg-[hsl(var(--pane))]">
        <header className="flex shrink-0 items-center gap-3 border-b border-[hsl(var(--hairline))] px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            aria-label={navOpen ? "Hide thread list" : "Show thread list"}
            aria-pressed={navOpen}
            className="rounded-[4px] p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          >
            <PanelLeft size={16} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-[14.5px] font-medium leading-tight">
              {thread.title}
            </h1>
            <div className="font-data mt-0.5 flex items-center gap-2 text-[10.5px] text-[hsl(var(--muted-foreground))]">
              <span>{MODEL}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <span
                  aria-hidden
                  className={`size-[5px] rounded-full ${streamingId ? "nova-pulse" : ""}`}
                  style={{ background: `hsl(var(--${streamingId ? "amber" : "teal"}))` }}
                />
                {streamingId ? "writing" : "idle"}
              </span>
            </div>
          </div>

          <span className="label-instrument ml-auto hidden shrink-0 rounded-[3px] border border-[hsl(var(--hairline))] px-1.5 py-1 sm:block">
            prototype
          </span>

          <button
            type="button"
            onClick={() => setInspOpen((v) => !v)}
            aria-label={inspOpen ? "Hide session detail" : "Show session detail"}
            aria-pressed={inspOpen}
            className="rounded-[4px] p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] max-sm:ml-auto"
          >
            <PanelRight size={16} />
          </button>
        </header>

        <div
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
          }}
          className="nova-scroll min-h-0 flex-1 overflow-y-auto"
        >
          {thread.messages.length ? (
            <div className="divide-y divide-[hsl(var(--hairline))] pb-6">
              {thread.messages.map((m, i) => (
                <MessageRow
                  key={m.id}
                  message={m}
                  streaming={m.id === streamingId}
                  openFirstTool={i === 1 && thread.id === "tiles"}
                />
              ))}
            </div>
          ) : (
            <div className="mx-auto flex max-w-[46ch] flex-col items-start gap-5 px-8 pt-[14vh]">
              <h2 className="font-display text-[34px] leading-[1.15] tracking-[-0.015em]">
                What are we working on?
              </h2>
              <ul className="flex w-full flex-col gap-px">
                {OPENERS.map((o) => (
                  <li key={o}>
                    <button
                      type="button"
                      onClick={() => send(o)}
                      className="w-full rounded-[4px] px-3 py-2.5 text-left text-[13.5px] transition-colors hover:bg-[hsl(var(--muted))]"
                    >
                      <span className="mr-2 text-[hsl(var(--amber))]">→</span>
                      {o}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[hsl(var(--hairline))] px-4 pb-4 pt-3 sm:px-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="mx-auto max-w-[76ch]"
          >
            <div className="flex items-end gap-2 rounded-[7px] border border-[hsl(var(--input))] bg-[hsl(var(--pane-sunk))] px-3 py-2 transition-colors focus-within:border-[hsl(var(--amber))]">
              <textarea
                ref={(el) => {
                  box.current = el;
                  grow(el);
                }}
                rows={1}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  grow(e.target);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(draft);
                  }
                }}
                placeholder="Ask Nova about the pipeline…"
                aria-label="Message Nova"
                className="nova-scroll max-h-[200px] flex-1 resize-none bg-transparent py-1 text-[14px] leading-[1.55] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim() || Boolean(streamingId)}
                aria-label="Send message"
                className="mb-0.5 grid size-7 shrink-0 place-items-center rounded-[5px] bg-[hsl(var(--amber))] text-[hsl(222_24%_8%)] transition-opacity disabled:opacity-30"
              >
                <ArrowUp size={15} strokeWidth={2.5} />
              </button>
            </div>
            <p className="font-data mt-2 text-[10.5px] text-[hsl(var(--muted-foreground))]">
              Enter to send · Shift + Enter for a new line · no model is connected,
              so replies come from a fixed set
            </p>
          </form>
        </div>
      </main>

      {xwide && inspOpen && (
        <div className="w-[292px] shrink-0">
          <Inspector thread={thread} threadTokens={threadTokens} />
        </div>
      )}

      {!xwide && inspOpen && (
        <>
          <button
            type="button"
            aria-label="Close session detail"
            onClick={() => setInspOpen(false)}
            className="fixed inset-0 z-30 bg-black/40"
          />
          <div className="fixed inset-y-0 right-0 z-40 w-[292px] shadow-2xl">
            <Inspector thread={thread} threadTokens={threadTokens} />
          </div>
        </>
      )}
    </div>
  );
}
