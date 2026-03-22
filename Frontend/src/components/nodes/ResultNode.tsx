import { useState, useEffect, useRef } from "react";
import { Handle, Position, NodeResizeControl } from "reactflow";
import type { NodeProps } from "reactflow";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ResultNodeData } from "../../types";

function ResultNode({ data }: NodeProps<ResultNodeData>) {
  const [displayedText, setDisplayedText] = useState(data.response);
  const indexRef = useRef(data.response.length);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.response !== "" && !data.isLoading) {
      // For loaded chats, show immediately
      setDisplayedText(data.response);
      indexRef.current = data.response.length;
    } else if (data.response === "") {
      setDisplayedText("");
      indexRef.current = 0;
    }
  }, [data.response, data.isLoading]);

  useEffect(() => {
    if (data.response === "") return;

    if (indexRef.current < data.response.length) {
      const timeout = setTimeout(() => {
        const backlog = data.response.length - indexRef.current;
        // The more chunks arrive, the faster we type to catch up (proportional controller)
        // This guarantees no jitter whatsoever, regardless of chunk size!
        const advanceBy = Math.max(1, Math.ceil(backlog / 8));

        indexRef.current += advanceBy;
        setDisplayedText(data.response.slice(0, indexRef.current));
      }, 16); // ~60fps frame

      return () => clearTimeout(timeout);
    }
  }, [data.response, displayedText]);

  const isTyping = indexRef.current < data.response.length;

  useEffect(() => {
    if (scrollRef.current && isTyping) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedText, isTyping]);

  return (
    <div className="group flex h-full w-full flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5 shadow-lg transition-colors hover:border-zinc-700">
      <NodeResizeControl
        minWidth={240}
        minHeight={120}
        style={{ background: "transparent", border: "none" }}
      >
        <div className="absolute bottom-1.5 right-1.5 h-3.5 w-3.5 cursor-nwse-resize text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 22H10v-2h10v-10h2v12zM16 22H4v-2h10v-10h2v12zM10 22H2v-2h6v-6h2v8z" />
          </svg>
        </div>
      </NodeResizeControl>

      <div className="drag-handle mb-3 sm:mb-4 flex shrink-0 cursor-grab items-center justify-between active:cursor-grabbing">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
            <svg
              className="h-4 w-4 text-zinc-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-zinc-200">{data.label}</h3>
        </div>
        {data.isLoading && (
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-zinc-400"></span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="nodrag nowheel relative flex-1 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4"
      >
        {data.isLoading ? (
          <div className="space-y-3 opacity-40">
            <div className="h-2 w-3/4 rounded bg-zinc-700"></div>
            <div className="h-2 w-full rounded bg-zinc-700"></div>
            <div className="h-2 w-5/6 rounded bg-zinc-700"></div>
          </div>
        ) : data.response ? (
          <div className="text-[13px] sm:text-[13.5px] leading-relaxed text-zinc-300">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => (
                  <p className="mb-3 last:mb-0" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    className="mb-3 ml-5 list-outside list-disc space-y-1 marker:text-zinc-600"
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className="mb-3 ml-5 list-outside list-decimal space-y-1 marker:text-zinc-600"
                    {...props}
                  />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-zinc-100" {...props} />
                ),
                h1: ({ node, ...props }) => (
                  <h1
                    className="mb-3 mt-5 text-lg font-bold text-zinc-100"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="mb-3 mt-4 text-base font-bold text-zinc-100"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className="mb-2 mt-3 text-sm font-bold text-zinc-100"
                    {...props}
                  />
                ),
                a: ({ node, ...props }) => (
                  <a
                    className="text-blue-400 underline decoration-blue-500/30 underline-offset-2 transition-colors hover:text-blue-300"
                    {...props}
                  />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="mb-3 border-l-2 border-zinc-600 bg-zinc-800/30 py-1 pl-3 text-zinc-400 italic"
                    {...props}
                  />
                ),
                code(props: any) {
                  const { children, className, node, ...rest } = props;
                  return !className ? (
                    <code
                      className="rounded bg-zinc-800 px-1.5 py-0.5 text-[12px] font-medium text-blue-300"
                      {...rest}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre
                      className="my-4 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-3 sm:p-4 text-[12px]"
                      {...rest}
                    >
                      <code className={className}>{children}</code>
                    </pre>
                  );
                },
              }}
            >
              {displayedText + (isTyping ? " \u258C" : "")}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="flex h-full items-center justify-center text-[13px] text-zinc-600">
            Run the flow to see results
          </p>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="h-3! w-3! border-2! border-zinc-700! bg-zinc-800!"
      />
    </div>
  );
}

export default ResultNode;
