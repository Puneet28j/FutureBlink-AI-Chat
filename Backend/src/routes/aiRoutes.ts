import { Router } from "express";
import { askAi } from "../controllers/aiController.js";

const router = Router();

router.post("/", askAi);

export default router;
