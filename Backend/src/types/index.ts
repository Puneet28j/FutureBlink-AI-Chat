export interface AskAiRequest {
  prompt: string;
}

export interface AskAiResponse {
  answer: string;
}

export interface SavePromptRequest {
  prompt: string;
  response: string;
}

export interface IPromptDocument {
  prompt: string;
  response: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}
