import type { Request, Response } from "express";
import Prompt from "../models/Prompt.js";

export const getPrompts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const prompts = await Prompt.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json({ data: prompts });
  } catch (error) {
    console.error("Error in GET /api/prompts:", error);
    const message =
      error instanceof Error ? error.message : "Failed to retrieve prompts";
    res.status(500).json({ message });
  }
};
