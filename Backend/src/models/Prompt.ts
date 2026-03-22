import { Schema, model } from "mongoose";
import type { IPromptDocument } from "../types/index.js";

const promptSchema = new Schema<IPromptDocument>(
  {
    prompt: {
      type: String,
      required: [true, "Prompt text is required"],
      trim: true,
      maxlength: [5000, "Prompt cannot exceed 5000 characters"],
    },
    response: {
      type: String,
      required: [true, "Response text is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

promptSchema.index({ createdAt: -1 });

const Prompt = model<IPromptDocument>("Prompt", promptSchema);

export default Prompt;
