import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { Block, Message, ToolCall } from "./data";

/* --- inline markup: **bold** and `code`, nothing more ------------------- */

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i}>{part.slice(1, -1)}</code>;
    return part;
  });
}

function Markup({ body }: { body: string }) {
  const chunks = body.split("\n\n");
  return (
    <div className="prose-nova text-[14.5px] leading-[1.62]">
      {chunks.map((chunk, i) => {
        const lines = chunk.split("\n");
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{inline(chunk)}</p>;
      })}
    </div>
  );
}

/* --- SQL colouring: a keyword set, strings, comments, numbers ----------- */

const SQL_WORDS = new Set([
  "CREATE", "INDEX", "CONCURRENTLY", "ON", "INCLUDE", "WHERE", "SELECT",
  "FROM", "AND", "OR", "BETWEEN", "DROP", "TABLE", "NOT", "NULL", "ORDER",
  "BY", "LIMIT", "EXPLAIN", "ANALYZE", "BUFFERS", "AS", "JOIN", "USING",
]);

function CodeBlock({ lang, body }: { lang: string; body: string }) {
  const tokens = body.split(/('(?:[^']|'')*'|--[^\n]*|\b[A-Za-z_]+\b|\b\d+\b)/g);
  return (
    <figure className="my-3 overflow-hidden rounded-[5px] border border-[hsl(var(--hairline))]">
      <figcaption className="label-instrument flex items-center justify-between border-b border-[hsl(var(--hairline))] bg-[hsl(var(--muted))] px-3 py-1.5">
        <span>{lang}</span>
      </figcaption>
      <pre className="nova-scroll overflow-x-auto bg-[hsl(var(--code-bg))] px-3 py-2.5 text-[12.5px] leading-[1.65]">
        <code className="font-data">
          {tokens.map((t, i) => {
            if (!t) return null;
            if (t.startsWith("--"))
              return (
                <span key={i} className="text-[hsl(var(--muted-foreground))]">
                  {t}
                </span>
              );
            if (t.startsWith("'"))
              return (
                <span key={i} className="text-[hsl(var(--teal))]">
                  {t}
                </span>
              );
            if (SQL_WORDS.has(t))
              return (
                <span key={i} className="font-medium text-[hsl(var(--amber))]">
                  {t}
                </span>
              );
            return <span key={i}>{t}</span>;
          })}
        </code>
      </pre>
    </figure>
  );
}

/* --- tool call ---------------------------------------------------------- */

function ToolBlock({ call, open: initial }: { call: ToolCall; open?: boolean }) {
  const [open, setOpen] = useState(Boolean(initial));
  const bad = call.status === "error";
  return (
    <div className="my-3 overflow-hidden rounded-[5px] border border-[hsl(var(--hairline))] bg-[hsl(var(--pane-sunk))]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group flex w-full items-center gap-2 px-2.5 py-2 text-left transition-colors hover:bg-[hsl(var(--muted))]"
      >
        <ChevronRight
          size={13}
          strokeWidth={2.2}
          className={`shrink-0 text-[hsl(var(--muted-foreground))] transition-transform duration-150 ${open ? "rotate-90" : ""}`}
        />
        <span
          aria-hidden
          className="size-[6px] shrink-0 rounded-full"
          style={{ background: `hsl(var(--${bad ? "rose" : "teal"}))` }}
        />
        <span className="font-data text-[12px] font-medium">{call.name}</span>
        <span className="font-data truncate text-[11.5px] text-[hsl(var(--muted-foreground))]">
          {call.args}
        </span>
        <span className="font-data ml-auto shrink-0 pl-2 text-[11px] tabular-nums text-[hsl(var(--muted-foreground))]">
          {call.ms.toLocaleString()} ms
        </span>
      </button>
      {open && (
        <pre className="nova-scroll overflow-x-auto border-t border-[hsl(var(--hairline))] bg-[hsl(var(--code-bg))] px-3 py-2.5 font-data text-[12px] leading-[1.6] text-[hsl(var(--muted-foreground))]">
          {call.result}
        </pre>
      )}
    </div>
  );
}

/* --- reasoning trace ---------------------------------------------------- */

function ReasoningBlock({ body }: { body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-2.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="label-instrument flex items-center gap-1.5 transition-colors hover:text-[hsl(var(--foreground))]"
      >
        <ChevronRight
          size={12}
          strokeWidth={2.2}
          className={`transition-transform duration-150 ${open ? "rotate-90" : ""}`}
        />
        Reasoning
      </button>
      {open && (
        <p className="mt-2 border-l border-[hsl(var(--amber))] pl-3 text-[13.5px] italic leading-[1.6] text-[hsl(var(--muted-foreground))]">
          {body}
        </p>
      )}
    </div>
  );
}

/* --- one message -------------------------------------------------------- */

export function MessageRow({
  message,
  streaming,
  openFirstTool,
}: {
  message: Message;
  streaming?: boolean;
  openFirstTool?: boolean;
}) {
  const nova = message.role === "nova";
  let toolSeen = false;

  return (
    <article className="nova-rise grid grid-cols-[1fr] gap-1.5 px-5 py-5 sm:grid-cols-[74px_minmax(0,1fr)] sm:gap-4 sm:px-8">
      <header className="flex items-baseline gap-2 sm:sticky sm:top-0 sm:block sm:self-start sm:pt-[3px]">
        <div
          className="label-instrument"
          style={nova ? { color: "hsl(var(--amber))" } : undefined}
        >
          {nova ? "Nova" : "You"}
        </div>
        <div className="font-data text-[11px] tabular-nums text-[hsl(var(--muted-foreground))] sm:mt-0.5">
          {message.at}
        </div>
      </header>

      <div className="min-w-0 max-w-[68ch]">
        {message.blocks.map((block: Block, i) => {
          if (block.kind === "text")
            return (
              <div key={i} className={nova ? "" : "border-l-2 border-[hsl(var(--border))] bg-[hsl(var(--pane-sunk))] px-3 py-2"}>
                <Markup body={block.body} />
              </div>
            );
          if (block.kind === "code")
            return <CodeBlock key={i} lang={block.lang} body={block.body} />;
          if (block.kind === "reasoning")
            return <ReasoningBlock key={i} body={block.body} />;
          const first = !toolSeen;
          toolSeen = true;
          return <ToolBlock key={i} call={block.call} open={openFirstTool && first} />;
        })}

        {streaming && (
          <span className="nova-caret" aria-label="Nova is replying" />
        )}

        {message.usage && !streaming && (
          <div className="font-data mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] tabular-nums text-[hsl(var(--muted-foreground))]">
            <span>{message.usage.ttft} ms to first token</span>
            <span aria-hidden>·</span>
            <span>{message.usage.in.toLocaleString()} in</span>
            <span aria-hidden>·</span>
            <span>{message.usage.out.toLocaleString()} out</span>
            <span aria-hidden>·</span>
            <span>{message.usage.cached.toLocaleString()} cached</span>
          </div>
        )}
      </div>
    </article>
  );
}
