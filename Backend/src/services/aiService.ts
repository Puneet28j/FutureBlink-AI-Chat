import type { OpenRouterMessage } from "../types/index.js";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const askAiStream = async (
  prompt: string,
  signal?: AbortSignal
): Promise<Response> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const model = process.env.OPENROUTER_MODEL || "google/gemma-2-9b-it:free";

  const messages: OpenRouterMessage[] = [{ role: "user", content: prompt }];

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "FutureBlink AI Flow",
    },
    body: JSON.stringify({ model, messages, stream: true }),
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `OpenRouter API error (${response.status})`;

    try {
      const errorJson = JSON.parse(errorBody);
      if (response.status === 429) {
        errorMessage = "Rate limit exceeded. Please try again later.";
      } else if (errorJson.error?.message) {
        errorMessage = errorJson.error.message;
      }
    } catch {
      // If not JSON, use the raw body
      errorMessage += `: ${errorBody}`;
    }

    throw new Error(errorMessage);
  }

  return response;
};
