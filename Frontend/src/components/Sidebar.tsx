import { useEffect, useState } from "react";
import { useFlow } from "../context/FlowContext";
import type { PromptDocument } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface SidebarProps {
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { loadFlow, historyRefreshTrigger } = useFlow();
  const [prompts, setPrompts] = useState<PromptDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrompts() {
      try {
        const res = await fetch(`${BASE_URL}/api/prompts`);
        if (res.ok) {
          const json = await res.json();
          setPrompts(json.data || []);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPrompts();
  }, [historyRefreshTrigger]);

  function handleLoad(prompt: string, response: string, promptId?: string) {
    loadFlow(prompt, response, promptId);
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-zinc-800 bg-zinc-950">
      <div
        className={`flex items-center ${
          isCollapsed
            ? "justify-center p-3"
            : "justify-between px-4 sm:px-6 py-4 sm:py-5"
        } border-b border-zinc-800 transition-all h-18`}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <h2 className="text-sm font-medium tracking-wide text-zinc-300 whitespace-nowrap">
              Saved Chats
            </h2>
            <span className="flex h-5 items-center rounded-full bg-zinc-800/50 px-2 text-xs font-medium text-zinc-500">
              {prompts.length}
            </span>
          </div>
        )}

        {/* Desktop Toggle Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 5l7 7-7 7" />
                <path d="M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 19l-7-7 7-7" />
                <path d="M19 19l-7-7 7-7" />
              </svg>
            )}
          </button>
        )}
      </div>

      <div
        className={`flex-1 overflow-y-auto overflow-x-hidden ${
          isCollapsed
            ? "hidden lg:flex flex-col items-center mt-4"
            : "p-3 sm:p-4"
        }`}
      >
        {!isCollapsed ? (
          loading ? (
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse flex-col rounded-xl border border-zinc-800/40 bg-zinc-900/30 p-3 sm:p-4"
                >
                  <div className="mb-2 h-3 w-1/3 rounded bg-zinc-800"></div>
                  <div className="h-2 w-full rounded bg-zinc-800/50"></div>
                </div>
              ))}
            </div>
          ) : prompts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-3 text-center opacity-60">
              <svg
                className="h-8 w-8 text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <p className="text-[13px] text-zinc-500">No saved chats yet.</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {prompts.map((p) => (
                <button
                  key={p._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoad(p.prompt, p.response, p._id);
                  }}
                  className="group w-full text-left transition-all"
                >
                  <div className="rounded-xl border border-zinc-800/40 bg-zinc-900/20 p-3 sm:p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60">
                    <p className="mb-1 line-clamp-2 text-[13px] font-medium leading-relaxed text-zinc-300 group-hover:text-zinc-100">
                      {p.prompt}
                    </p>
                    <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                      {p.response}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-zinc-600">
                        {new Date(p.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <span className="opacity-0 transition-opacity group-hover:opacity-100 text-[11px] font-medium text-zinc-400">
                        Load
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : (
          <div
            className="flex flex-col items-center gap-4 text-zinc-500"
            title="Saved Chats"
          >
            <svg
              className="h-6 w-6 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
        )}
      </div>
    </aside>
  );
}
