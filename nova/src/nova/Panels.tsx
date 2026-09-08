import { Plus, Search, Star, Sun, Moon, X } from "lucide-react";
import type { Thread } from "./data";
import { CONTEXT_WINDOW, MODEL, SYSTEM_TOKENS, TOOL_TOKENS } from "./data";

const GROUPS = ["Today", "Yesterday", "Last week"] as const;

export function Sidebar({
  threads,
  activeId,
  onPick,
  onNew,
  filter,
  onFilter,
  theme,
  onTheme,
  onClose,
}: {
  threads: Thread[];
  activeId: string;
  onPick: (id: string) => void;
  onNew: () => void;
  filter: string;
  onFilter: (v: string) => void;
  theme: "light" | "dark";
  onTheme: () => void;
  onClose?: () => void;
}) {
  const shown = threads.filter((t) =>
    t.title.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  return (
    <nav
      aria-label="Threads"
      className="flex h-full w-full flex-col bg-[hsl(var(--rail))]"
    >
      <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <span className="font-display text-[25px] leading-none tracking-[-0.01em]">
          Nova
        </span>
        <span className="label-instrument mt-[3px]">console</span>
        <button
          type="button"
          onClick={onTheme}
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="ml-auto rounded-[4px] p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close thread list"
            className="rounded-[4px] p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] lg:hidden"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-[5px] border border-[hsl(var(--hairline))] bg-[hsl(var(--pane))] px-2.5 py-2 text-[13px] font-medium shadow-[var(--shadow-pane)] transition-colors hover:border-[hsl(var(--amber))]"
        >
          <Plus size={14} className="text-[hsl(var(--amber))]" />
          New thread
          <kbd className="font-data ml-auto text-[10px] text-[hsl(var(--muted-foreground))]">
            ⌘N
          </kbd>
        </button>
      </div>

      <div className="relative px-3 pb-1 pt-2.5">
        <Search
          size={13}
          className="pointer-events-none absolute left-[22px] top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
        />
        <input
          value={filter}
          onChange={(e) => onFilter(e.target.value)}
          placeholder="Filter threads"
          aria-label="Filter threads"
          className="w-full rounded-[5px] bg-[hsl(var(--muted))] py-1.5 pl-7 pr-2 text-[13px] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus-visible:outline-2 focus-visible:outline-[hsl(var(--ring))]"
        />
      </div>

      <div className="nova-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-1">
        {GROUPS.map((group) => {
          const inGroup = shown.filter((t) => t.group === group);
          if (!inGroup.length) return null;
          return (
            <section key={group} className="mb-1">
              <h2 className="label-instrument px-2 pb-1 pt-3">{group}</h2>
              <ul className="flex flex-col gap-px">
                {inGroup.map((t) => {
                  const active = t.id === activeId;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => onPick(t.id)}
                        aria-current={active ? "true" : undefined}
                        className={`group flex w-full items-center gap-2 rounded-[4px] px-2 py-[7px] text-left text-[13px] transition-colors ${
                          active
                            ? "bg-[hsl(var(--pane))] shadow-[var(--shadow-pane)]"
                            : "hover:bg-[hsl(var(--muted))]"
                        }`}
                      >
                        <span
                          aria-hidden
                          className="h-[15px] w-[2px] shrink-0 rounded-full"
                          style={{
                            background: active
                              ? "hsl(var(--amber))"
                              : "transparent",
                          }}
                        />
                        <span className={`truncate ${active ? "font-medium" : ""}`}>
                          {t.title}
                        </span>
                        {t.starred && (
                          <Star
                            size={11}
                            className="shrink-0 fill-[hsl(var(--amber))] text-[hsl(var(--amber))]"
                          />
                        )}
                        <span className="font-data ml-auto shrink-0 text-[10.5px] tabular-nums text-[hsl(var(--muted-foreground))]">
                          {t.when}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
        {!shown.length && (
          <p className="px-2 pt-6 text-[13px] text-[hsl(var(--muted-foreground))]">
            No thread matches “{filter}”.
          </p>
        )}
      </div>

      <div className="border-t border-[hsl(var(--hairline))] px-4 py-3">
        <div className="label-instrument">Workspace</div>
        <div className="mt-1 text-[12.5px]">Survey pipeline · prod</div>
      </div>
    </nav>
  );
}

/* ----------------------------------------------------------------------- */

function Meter({ used }: { used: number }) {
  const pct = (used / CONTEXT_WINDOW) * 100;
  return (
    <div>
      <div className="relative h-[7px] w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.max(pct, 0.6)}%`, background: "hsl(var(--amber))" }}
        />
        {[25, 50, 75].map((tick) => (
          <span
            key={tick}
            aria-hidden
            className="absolute top-0 h-full w-px bg-[hsl(var(--pane))]"
            style={{ left: `${tick}%` }}
          />
        ))}
      </div>
      <div className="font-data mt-1.5 flex justify-between text-[10.5px] tabular-nums text-[hsl(var(--muted-foreground))]">
        <span>
          {used.toLocaleString()} / {CONTEXT_WINDOW.toLocaleString()}
        </span>
        <span>{pct.toFixed(1)}% full</span>
      </div>
    </div>
  );
}

function Split({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-[52px] shrink-0 text-[12px]">{label}</span>
      <span className="h-[3px] min-w-[2px] flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <span
          className="block h-full rounded-full"
          style={{ width: `${(value / total) * 100}%`, background: tone }}
        />
      </span>
      <span className="font-data w-[46px] shrink-0 text-right text-[11px] tabular-nums text-[hsl(var(--muted-foreground))]">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export function Inspector({ thread, threadTokens }: { thread: Thread; threadTokens: number }) {
  const used = SYSTEM_TOKENS + TOOL_TOKENS + threadTokens;
  const calls = thread.messages.flatMap((m) =>
    m.blocks.filter((b) => b.kind === "tool").map((b) => (b as { call: { name: string; ms: number; status: string } }).call),
  );
  const slowest = Math.max(1, ...calls.map((c) => c.ms));

  return (
    <aside
      aria-label="Session detail"
      className="nova-scroll flex h-full w-full flex-col gap-6 overflow-y-auto border-l border-[hsl(var(--hairline))] bg-[hsl(var(--rail))] px-4 py-5"
    >
      <section className="flex flex-col gap-2.5">
        <h2 className="label-instrument">Context window</h2>
        <Meter used={used} />
        <div className="mt-1 flex flex-col gap-2">
          <Split label="System" value={SYSTEM_TOKENS} total={used} tone="hsl(var(--muted-foreground))" />
          <Split label="Tools" value={TOOL_TOKENS} total={used} tone="hsl(var(--teal))" />
          <Split label="Thread" value={threadTokens} total={used} tone="hsl(var(--amber))" />
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <h2 className="label-instrument">Tool activity</h2>
        {calls.length ? (
          <ul className="flex flex-col gap-2.5">
            {calls.map((c, i) => (
              <li key={i} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-data truncate text-[11.5px]">{c.name}</span>
                  <span className="font-data shrink-0 text-[10.5px] tabular-nums text-[hsl(var(--muted-foreground))]">
                    {c.ms.toLocaleString()} ms
                  </span>
                </div>
                <span className="h-[3px] w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${(c.ms / slowest) * 100}%`,
                      background:
                        c.status === "error" ? "hsl(var(--rose))" : "hsl(var(--teal))",
                    }}
                  />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12.5px] text-[hsl(var(--muted-foreground))]">
            No tools called in this thread.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="label-instrument">Session</h2>
        <dl className="flex flex-col gap-1.5 text-[12px]">
          {[
            ["Model", MODEL],
            ["Turns", String(thread.messages.length)],
            ["Tool calls", String(calls.length)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-[hsl(var(--muted-foreground))]">{k}</dt>
              <dd className="font-data tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-auto border-t border-[hsl(var(--hairline))] pt-3 text-[11.5px] leading-[1.5] text-[hsl(var(--muted-foreground))]">
        Interface prototype. No model is connected — transcripts are seeded and
        replies come from a fixed set.
      </p>
    </aside>
  );
}
