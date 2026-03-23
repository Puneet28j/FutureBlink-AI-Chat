import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";

import { useFlow } from "../context/FlowContext";
import { nodeTypes } from "./nodes/nodeTypes";

function FlowCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    state,
    runFlow,
    stopFlow,
    saveFlow,
    resetFlow,
    clearError,
  } = useFlow();

  return (
    <div className="relative flex h-full flex-col bg-[#09090b]">
      {(state.error || state.saveSuccess) && (
        <div
          className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between border-b px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-medium transition-all ${
            state.error
              ? "border-red-500/20 bg-red-950/30 text-red-400"
              : "border-blue-500/20 bg-blue-950/30 text-blue-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {!state.error && (
              <svg
                className="h-3.5 w-3.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            <span className="truncate">
              {state.error || "Flow saved to history."}
            </span>
          </div>
          {state.error && (
            <button
              className="shrink-0 rounded p-0.5 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
              onClick={clearError}
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          nodesDraggable
          fitView
          fitViewOptions={{ padding: 0.4 }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.1}
          maxZoom={2}
          className="bg-zinc-950"
        >
          <Background
            variant={BackgroundVariant.Dots}
            color="#27272a"
            gap={20}
            size={1}
          />
          <Controls
            position="top-right"
            showInteractive={true}
            className="border-zinc-800! bg-zinc-900! fill-zinc-400!"
          />
          <MiniMap
            nodeColor={(n) => {
              if (n.type === "textInput") return "#3b82f6";
              if (n.type === "result") return "#52525b";
              return "#3f3f46";
            }}
            maskColor="rgba(9, 9, 11, 0.7)"
            style={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
            }}
          />
        </ReactFlow>
      </div>

      <div className="absolute bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1.5 backdrop-blur-lg shadow-2xl">
        <button
          className="group relative flex h-9 sm:h-10 items-center gap-1.5 sm:gap-2 overflow-hidden rounded-full bg-zinc-100 px-4 sm:px-5 text-[12px] sm:text-[13px] font-medium text-zinc-900 transition-all hover:bg-white active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          onClick={state.isGenerating ? stopFlow : runFlow}
          disabled={!state.isGenerating && !state.prompt.trim()}
        >
          {state.isGenerating ? (
            <svg
              className="h-4 w-4 text-zinc-700"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg
              className="h-3.5 w-3.5 text-zinc-700 transition-transform group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
          <span>{state.isGenerating ? "Stop" : "Run Flow"}</span>
        </button>

        <div className="mx-1 h-4 w-px bg-white/10"></div>

        <button
          className="flex h-9 sm:h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 text-[12px] sm:text-[13px] font-medium text-zinc-400 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          onClick={saveFlow}
          disabled={
            state.isSaving ||
            state.isGenerating ||
            !state.prompt.trim() ||
            !state.response.trim()
          }
          title="Save Chat"
        >
          {state.isSaving ? (
            <svg
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin opacity-50"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
          ) : (
            <svg
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          )}
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          className="flex h-9 sm:h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 text-[12px] sm:text-[13px] font-medium text-zinc-400 transition-all hover:bg-emerald-500/15 hover:text-emerald-400 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          onClick={resetFlow}
          disabled={
            state.isGenerating ||
            state.isSaving ||
            (!state.prompt && !state.response)
          }
          title="New Chat"
        >
          <svg
            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </div>
  );
}

export default FlowCanvas;
