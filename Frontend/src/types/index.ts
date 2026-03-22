export interface AskAiResponse {
  answer: string;
}

export interface SavePromptRequest {
  prompt: string;
  response: string;
}

export interface PromptDocument {
  _id: string;
  prompt: string;
  response: string;
  createdAt: string;
  updatedAt: string;
}

export interface TextInputNodeData {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export interface ResultNodeData {
  label: string;
  response: string;
  isLoading: boolean;
}

export interface FlowState {
  prompt: string;
  response: string;
  isLoading: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
  saveSuccess: boolean;
  loadedPromptId?: string;
}
