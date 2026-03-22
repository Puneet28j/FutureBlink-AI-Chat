import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "reactflow";
import { askAiStream, savePrompt } from "../api/flowApi";
import type { FlowState } from "../types";

interface FlowContextValue {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  state: FlowState;
  setPrompt: (value: string) => void;
  runFlow: () => Promise<void>;
  stopFlow: () => void;
  saveFlow: () => Promise<void>;
  loadFlow: (prompt: string, response: string, promptId?: string) => void;
  resetFlow: () => void;
  clearError: () => void;
  historyRefreshTrigger: number;
}

const FlowContext = createContext<FlowContextValue | null>(null);

const INITIAL_STATE: FlowState = {
  prompt: "",
  response: "",
  isLoading: false,
  isGenerating: false,
  isSaving: false,
  error: null,
  saveSuccess: false,
  loadedPromptId: undefined,
};

const INITIAL_NODES: Node[] = [
  {
    id: "input-node",
    type: "textInput",
    position: { x: 40, y: 40 },
    dragHandle: ".drag-handle",
    data: { label: "Text Input", value: "", onChange: () => {} },
  },
  {
    id: "result-node",
    type: "result",
    position: { x: 40, y: 320 },
    dragHandle: ".drag-handle",
    style: { width: 340, height: 320 },
    data: { label: "AI Response", response: "", isLoading: false },
  },
];

const INITIAL_EDGES: Edge[] = [
  {
    id: "edge-input-result",
    source: "input-node",
    target: "result-node",
    animated: false,
    style: {
      stroke: "#52525b",
      strokeWidth: 2,
      transition: "stroke 0.3s ease, filter 0.3s ease",
    },
  },
];

export function FlowProvider({ children }: { children: ReactNode }) {
  const [flowState, setFlowState] = useState<FlowState>(INITIAL_STATE);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  const abortControllerRef = useRef<AbortController | null>(null);
  const savingRef = useRef(false);
  const loadedPromptIdRef = useRef<string | undefined>(undefined);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const setPrompt = useCallback((value: string) => {
    setFlowState((prev) => ({
      ...prev,
      prompt: value,
      error: null,
      saveSuccess: false,
      loadedPromptId: undefined,
    }));
    loadedPromptIdRef.current = undefined;
  }, []);

  const loadFlow = useCallback(
    (prompt: string, response: string, promptId?: string) => {
      setFlowState({
        prompt,
        response,
        isLoading: false,
        isGenerating: false,
        isSaving: false,
        error: null,
        saveSuccess: false,
        loadedPromptId: promptId,
      });
      loadedPromptIdRef.current = promptId;
    },
    []
  );

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "input-node") {
          return {
            ...node,
            data: {
              ...node.data,
              value: flowState.prompt,
              onChange: setPrompt,
            },
          };
        }
        return node;
      })
    );
  }, [flowState.prompt, setPrompt, setNodes]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "result-node") {
          return {
            ...node,
            data: {
              ...node.data,
              response: flowState.response,
              isLoading: flowState.isLoading,
            },
          };
        }
        return node;
      })
    );
  }, [flowState.response, flowState.isLoading, setNodes]);

  useEffect(() => {
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === "edge-input-result") {
          if (flowState.isGenerating) {
            return {
              ...e,
              animated: true,
              style: {
                stroke: "#3b82f6",
                strokeWidth: 3,
                filter: "drop-shadow(0 0 8px rgba(59,130,246,0.6))",
                transition: "stroke 0.3s ease, filter 0.3s ease",
              },
            };
          } else {
            return {
              ...e,
              animated: false,
              style: {
                stroke: "#52525b",
                strokeWidth: 2,
                filter: "none",
                transition: "stroke 0.3s ease, filter 0.3s ease",
              },
            };
          }
        }
        return e;
      })
    );
  }, [flowState.isGenerating, setEdges]);

  const clearError = useCallback(() => {
    setFlowState((prev) => ({ ...prev, error: null }));
  }, []);

  const resetFlow = useCallback(() => {
    setFlowState((prev) => ({
      ...prev,
      prompt: "",
      response: "",
      error: null,
      saveSuccess: false,
      isGenerating: false,
      loadedPromptId: undefined,
    }));
    loadedPromptIdRef.current = undefined;
  }, []);

  const stopFlow = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setFlowState((prev) => ({
        ...prev,
        isLoading: false,
        isGenerating: false,
        error: "Generation stopped by user.",
      }));
    }
  }, []);

  const runFlow = useCallback(async () => {
    if (!flowState.prompt.trim()) {
      setFlowState((prev) => ({
        ...prev,
        error: "Please enter a prompt before running.",
      }));
      return;
    }

    setFlowState((prev) => ({
      ...prev,
      isLoading: true,
      isGenerating: true,
      error: null,
      response: "",
      saveSuccess: false,
    }));

    abortControllerRef.current = new AbortController();

    try {
      await askAiStream(
        flowState.prompt,
        (chunk) => {
          setFlowState((prev) => ({
            ...prev,
            response: prev.response + chunk,
            isLoading: false,
          }));
        },
        abortControllerRef.current.signal
      );

      setFlowState((prev) => ({
        ...prev,
        isGenerating: false,
      }));
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return; // Handled by stopFlow
      }
      setFlowState((prev) => ({
        ...prev,
        isLoading: false,
        isGenerating: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      }));
    }
  }, [flowState.prompt]);

  const saveFlow = useCallback(async () => {
    if (!flowState.prompt.trim() || !flowState.response.trim()) {
      setFlowState((prev) => ({
        ...prev,
        error: "Run the flow first to generate a response before saving.",
      }));
      return;
    }

    if (loadedPromptIdRef.current) {
      setFlowState((prev) => ({
        ...prev,
        error: "This chat is already saved.",
      }));
      return;
    }

    if (savingRef.current) {
      return; // Prevent multiple save attempts
    }

    savingRef.current = true;
    setFlowState((prev) => ({
      ...prev,
      isSaving: true,
      error: null,
      saveSuccess: false,
    }));

    try {
      await savePrompt(flowState.prompt, flowState.response);
      setFlowState((prev) => ({
        ...prev,
        isSaving: false,
        saveSuccess: true,
        loadedPromptId: "saved",
      }));
      loadedPromptIdRef.current = "saved";
      setHistoryRefreshTrigger((prev) => prev + 1);

      setTimeout(() => {
        setFlowState((prev) => ({ ...prev, saveSuccess: false }));
      }, 3000);
    } catch (error) {
      setFlowState((prev) => ({
        ...prev,
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save. Please try again.",
      }));
    } finally {
      savingRef.current = false;
    }
  }, [flowState.prompt, flowState.response]);

  return (
    <FlowContext.Provider
      value={{
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        state: flowState,
        setPrompt,
        runFlow,
        stopFlow,
        saveFlow,
        loadFlow,
        resetFlow,
        clearError,
        historyRefreshTrigger,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
}

export function useFlow(): FlowContextValue {
  const context = useContext(FlowContext);
  if (!context) throw new Error("useFlow must be used within a FlowProvider");
  return context;
}
