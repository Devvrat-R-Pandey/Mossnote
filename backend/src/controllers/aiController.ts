// Handles authenticated AI writing-assistant requests.
import { Request, Response } from "express";

// Shared helper for AI provider requests.
async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://mossnote.netlify.app",
      "X-OpenRouter-Title": "Mossnote",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct-v0.1",
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("OpenRouter API error:", response.status, errorBody);
    throw new Error("AI service returned an error");
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

// ── Error response helper ────────────────────────────────────────────────────
function handleAiError(res: Response, error: unknown): void {
  console.error("AI controller error:", error);
  const isConfig = (error as Error).message === "OPENROUTER_API_KEY is not configured";
  res.status(isConfig ? 500 : 502).json({
    message: isConfig ? "AI service is not configured" : "AI service is unavailable",
  });
}

// ── POST /api/ai/summarize ───────────────────────────────────────────────────
export async function summarizeNote(req: Request, res: Response): Promise<void> {
  try {
    const { content } = req.body as { content: string };

    if (!content?.trim()) {
      res.status(400).json({ message: "Note content is required" });
      return;
    }

    const summary = await callOpenRouter(
      "You are a concise note summarizer.",
      `Extract the single most important idea from this note and explain it in 2-3 sentences. Be direct and specific. No filler phrases like "this note discusses".\n\nNote:\n${content.slice(0, 2000)}`,
      0.7
    );

    res.status(200).json({ summary: summary.trim() || "No summary generated." });
  } catch (error) {
    handleAiError(res, error);
  }
}

// ── POST /api/ai/improve ────────────────────────────────────────────────────
export async function improveWriting(req: Request, res: Response): Promise<void> {
  try {
    const { content } = req.body as { content: string };

    if (!content?.trim()) {
      res.status(400).json({ message: "Note content is required" });
      return;
    }

    const improved = await callOpenRouter(
      "You are a professional writing assistant.",
      `Rewrite this note for maximum clarity. Remove redundancy, fix structure, keep all original information. Use markdown. Do not add new ideas.\n\nNote:\n${content}`,
      0.7
    );

    res.status(200).json({ improved: improved.trim() || "Could not improve the note." });
  } catch (error) {
    handleAiError(res, error);
  }
}

// ── POST /api/ai/auto-title ─────────────────────────────────────────────────
export async function autoTitle(req: Request, res: Response): Promise<void> {
  try {
    const { content } = req.body as { content: string };

    if (!content?.trim()) {
      res.status(400).json({ message: "Note content is required" });
      return;
    }

    const raw = await callOpenRouter(
      "You generate short note titles.",
      `Generate a title for this note in 5 words or fewer. Output only the title. No quotes, no explanation, no punctuation at the end. If you cannot do it in 5 words, cut the least important word until it fits.\n\nNote:\n${content.slice(0, 500)}`,
      0.7
    );

    let title = raw.replace(/^["'`]+|["'`]+$/g, "").replace(/\n.*/s, "").trim();

    res.status(200).json({ title: title || "Untitled" });
  } catch (error) {
    handleAiError(res, error);
  }
}

// ── POST /api/ai/custom ─────────────────────────────────────────────────────
export async function customPrompt(req: Request, res: Response): Promise<void> {
  try {
    const { content, userPrompt } = req.body as { content: string; userPrompt: string };

    if (!userPrompt?.trim()) {
      res.status(400).json({ message: "A prompt is required" });
      return;
    }

    const result = await callOpenRouter(
      "You are a helpful AI assistant for a note-taking app. Respond concisely and directly.",
      `${userPrompt}\n\nNote:\n${(content ?? "").slice(0, 2000)}`,
      0.7
    );

    res.status(200).json({ result: result.trim() || "No response generated." });
  } catch (error) {
    handleAiError(res, error);
  }
}

// ── POST /api/ai/rephrase ───────────────────────────────────────────────────
export async function rephraseNote(req: Request, res: Response): Promise<void> {
  try {
    const { content } = req.body as { content: string };

    if (!content?.trim()) {
      res.status(400).json({ message: "Note content is required" });
      return;
    }

    const rephrased = await callOpenRouter(
      "You are a professional writing assistant.",
      `Rephrase this note in a completely different way while preserving the exact meaning. Change the sentence structure and word choices throughout. Use markdown. Output only the rephrased note, no explanation.\n\nNote:\n${content}`,
      0.7
    );

    res.status(200).json({ rephrased: rephrased.trim() || "Could not rephrase the note." });
  } catch (error) {
    handleAiError(res, error);
  }
}
