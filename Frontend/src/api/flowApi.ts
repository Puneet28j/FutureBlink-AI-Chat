import type { SavePromptRequest, PromptDocument } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      (errorData as { message?: string })?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function askAiStream(
  prompt: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const url = `${BASE_URL}/api/ask-ai`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (let line of lines) {
      line = line.trim();
      if (line.startsWith("data: ")) {
        if (line === "data: [DONE]") return;

        try {
          const dataNode = JSON.parse(line.slice(6));
          const content = dataNode.choices?.[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch {
          // incomplete chunk
        }
      }
    }
  }
}

export async function savePrompt(
  prompt: string,
  response: string
): Promise<void> {
  const body: SavePromptRequest = { prompt, response };
  await apiFetch<{ message: string; data: PromptDocument }>("/api/prompts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
