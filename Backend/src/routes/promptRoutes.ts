import { Router } from "express";
import { savePrompt } from "../controllers/aiController.js";
import { getPrompts } from "../controllers/promptController.js";

const router = Router();

router.post("/", savePrompt);
router.get("/", getPrompts);

export default router;
