// Mounts authenticated AI-assistant routes.
import { Router } from "express";
import { summarizeNote, improveWriting, autoTitle, customPrompt, rephraseNote } from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = Router();

router.use(authMiddleware, authorizeRoles("admin", "editor"));

router.post("/summarize", summarizeNote);
router.post("/improve", improveWriting);
router.post("/auto-title", autoTitle);
router.post("/rephrase", rephraseNote);
router.post("/custom", customPrompt);

export default router;
