// services/aiService.ts
import { api } from "../api/axiosInstance";

export async function summarizeNote(content: string): Promise<string> {
  const { data } = await api.post<{ summary: string }>("/ai/summarize", { content });
  return data.summary;
}

export async function improveWriting(content: string): Promise<string> {
  const { data } = await api.post<{ improved: string }>("/ai/improve", { content });
  return data.improved;
}

export async function autoTitle(content: string): Promise<string> {
  const { data } = await api.post<{ title: string }>("/ai/auto-title", { content });
  return data.title;
}

export async function rephraseNote(content: string): Promise<string> {
  const { data } = await api.post<{ rephrased: string }>("/ai/rephrase", { content });
  return data.rephrased;
}

export async function customPrompt(content: string, userPrompt: string): Promise<string> {
  const { data } = await api.post<{ result: string }>("/ai/custom", { content, userPrompt });
  return data.result;
}
