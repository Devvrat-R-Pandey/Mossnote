// store/assistantStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  summarizeNote,
  improveWriting,
  autoTitle,
  rephraseNote,
  customPrompt,
} from "../services/aiService";

// ── Types ─────────────────────────────────────────────────────────────────────
export type PresetAction = "summarize" | "improve" | "title" | "rephrase";

export interface Message {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
  /** Which action produced this response — used for "Apply to note" logic */
  action?: PresetAction | "custom";
  /** Set to true after "Apply to note" has been clicked successfully */
  applied?: boolean;
}

interface AssistantState {
  messages: Message[];
  isLoading: boolean;

  addMessage: (msg: Message) => void;
  setTypingMessage: (content: string) => void;
  finalizeTyping: () => void;
  clearMessages: () => void;
  sendPrompt: (userPrompt: string, noteContent: string) => Promise<void>;
  runPreset: (action: PresetAction, noteContent: string) => Promise<void>;
}

// ── Typing animation helper ──────────────────────────────────────────────────
let _activeTypingInterval: ReturnType<typeof setInterval> | null = null;

const cancelActiveTyping = () => {
  if (_activeTypingInterval !== null) {
    clearInterval(_activeTypingInterval);
    _activeTypingInterval = null;
  }
};

const typeText = (
  fullText: string,
  onTick: (partial: string) => void,
  onDone: () => void
) => {
  cancelActiveTyping();
  let i = 0;
  _activeTypingInterval = setInterval(() => {
    i++;
    onTick(fullText.slice(0, i));
    if (i >= fullText.length) {
      cancelActiveTyping();
      onDone();
    }
  }, 12);
};

// ── Preset display labels ────────────────────────────────────────────────────
const PRESET_LABELS: Record<PresetAction, string> = {
  summarize: "Summarize this note",
  improve: "Improve writing",
  title: "Suggest a title",
  rephrase: "Rephrase this note",
};

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAssistantStore = create<AssistantState>()(
  devtools(
    (set, get) => ({
      messages: [],
      isLoading: false,

      addMessage: (msg) =>
        set(
          (s) => ({ messages: [...s.messages, msg] }),
          false,
          "assistant/addMessage"
        ),

      setTypingMessage: (content) =>
        set(
          (s) => {
            const msgs = [...s.messages];
            const last = msgs[msgs.length - 1];
            if (last?.role === "assistant" && last.isTyping) {
              msgs[msgs.length - 1] = { ...last, content };
            }
            return { messages: msgs };
          },
          false,
          "assistant/setTypingMessage"
        ),

      finalizeTyping: () =>
        set(
          (s) => {
            const msgs = [...s.messages];
            const last = msgs[msgs.length - 1];
            if (last?.role === "assistant" && last.isTyping) {
              msgs[msgs.length - 1] = { ...last, isTyping: false };
            }
            return { messages: msgs, isLoading: false };
          },
          false,
          "assistant/finalizeTyping"
        ),

      clearMessages: () => {
        cancelActiveTyping();
        set({ messages: [], isLoading: false }, false, "assistant/clear");
      },

      // ── Free-form prompt (tagged as 'custom' — never shows Apply) ───────
      sendPrompt: async (userPrompt, noteContent) => {
        const { addMessage, setTypingMessage, finalizeTyping } = get();

        addMessage({ role: "user", content: userPrompt });
        addMessage({ role: "assistant", content: "", isTyping: true, action: "custom" });
        set({ isLoading: true }, false, "assistant/sendPrompt/pending");

        try {
          const result = await customPrompt(noteContent, userPrompt);
          typeText(
            result,
            (partial) => setTypingMessage(partial),
            () => finalizeTyping()
          );
        } catch {
          setTypingMessage("Something went wrong. Please try again.");
          finalizeTyping();
        }
      },

      // ── Preset actions (tagged with action type for Apply logic) ────────
      runPreset: async (action, noteContent) => {
        const { addMessage, setTypingMessage, finalizeTyping } = get();

        addMessage({ role: "user", content: PRESET_LABELS[action] });
        addMessage({ role: "assistant", content: "", isTyping: true, action });
        set({ isLoading: true }, false, "assistant/runPreset/pending");

        try {
          let result = "";
          if (action === "summarize") result = await summarizeNote(noteContent);
          else if (action === "improve") result = await improveWriting(noteContent);
          else if (action === "rephrase") result = await rephraseNote(noteContent);
          else result = await autoTitle(noteContent);

          typeText(
            result,
            (partial) => setTypingMessage(partial),
            () => finalizeTyping()
          );
        } catch {
          setTypingMessage("Something went wrong. Please try again.");
          finalizeTyping();
        }
      },
    }),
    { name: "AssistantStore", store: "assistant" }
  )
);