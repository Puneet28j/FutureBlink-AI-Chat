import type { Request, Response } from "express";
import { askAiStream } from "../services/aiService.js";
import type { AskAiRequest, SavePromptRequest } from "../types/index.js";
import Prompt from "../models/Prompt.js";

export const askAi = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body as AskAiRequest;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      res.status(400).json({ message: "A non-empty 'prompt' string is required" });
      return;
    }

    if (prompt.length > 5000) {
      res.status(400).json({ message: "Prompt cannot exceed 5000 characters" });
      return;
    }

    const openRouterRes = await askAiStream(prompt.trim());

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    if (openRouterRes.body) {
      const reader = openRouterRes.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value, { stream: true }));
      }
    }

    res.end();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      if (!res.headersSent) res.end();
      return;
    }
    console.error("Error in /api/ask-ai:", error);

    if (!res.headersSent) {
      const message = error instanceof Error ? error.message : "Failed to get AI response";
      res.status(500).json({ message });
    } else {
      res.end();
    }
  }
};

export const savePrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, response } = req.body as SavePromptRequest;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      res.status(400).json({ message: "A non-empty 'prompt' string is required" });
      return;
    }

    if (!response || typeof response !== "string" || response.trim().length === 0) {
      res.status(400).json({ message: "A non-empty 'response' string is required" });
      return;
    }

    const saved = await Prompt.create({
      prompt: prompt.trim(),
      response: response.trim(),
    });

    res.status(201).json({
      message: "Prompt saved successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Error in POST /api/prompts:", error);
    const message =
      error instanceof Error ? error.message : "Failed to save prompt";
    res.status(500).json({ message });
  }
};