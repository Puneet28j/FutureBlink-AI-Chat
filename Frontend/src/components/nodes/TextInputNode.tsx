import { useCallback } from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";
import type { TextInputNodeData } from "../../types";

function TextInputNode({ data }: NodeProps<TextInputNodeData>) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      data.onChange(e.target.value);
    },
    [data]
  );

  return (
    <div className="w-70 sm:w-85 lg:w-95 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5 shadow-lg transition-all hover:border-zinc-700">
      <div className="drag-handle mb-3 sm:mb-4 flex cursor-grab items-center gap-3 active:cursor-grabbing">
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
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-zinc-200">{data.label}</h3>
      </div>

      <textarea
        className="nodrag nowheel w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-[13.5px] leading-relaxed text-zinc-200 placeholder-zinc-600 outline-none transition-all focus:border-zinc-600 focus:bg-zinc-900 focus:ring-1 focus:ring-zinc-600"
        value={data.value}
        onChange={handleChange}
        placeholder="Type a message..."
        rows={4}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        className="h-3! w-3! border-2! border-zinc-700! bg-zinc-800!"
      />
    </div>
  );
}

export default TextInputNode;
