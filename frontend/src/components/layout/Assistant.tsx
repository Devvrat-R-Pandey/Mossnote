import React, { useCallback, useRef, useEffect, useState } from "react";
import { useAssistantStore, type Message, type PresetAction } from "../../store/assistantStore";
import { MarkdownRenderer } from "./MarkdownRenderer";
import toast from "react-hot-toast";
import {
  Brain, X, Copy, Check, Send,
  FileText, Sparkles, Tag, RefreshCw, Plus,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AssistantProps {
  noteContent: string;
  canEdit: boolean;
  onClose: () => void;
  onApplyContent: (content: string) => Promise<void>;
  onApplyTitle: (title: string) => Promise<void>;
}

// ── Preset config ─────────────────────────────────────────────────────────────
const PRESETS: {
  action: PresetAction;
  icon: React.ReactNode;
  label: string;
  color: string;
}[] = [
  { action: "summarize", icon: <FileText size={14} />,  label: "Summarize", color: "text-info" },
  { action: "title",     icon: <Tag size={14} />,       label: "Title",     color: "text-warning" },
  { action: "improve",   icon: <Sparkles size={14} />,  label: "Improve",   color: "text-success" },
  { action: "rephrase",  icon: <RefreshCw size={14} />, label: "Rephrase",  color: "text-primary" },
];

// ── Single chat bubble ────────────────────────────────────────────────────────
const ChatBubble = React.memo(({
  msg,
  canEdit,
  onApplyContent,
  onApplyTitle,
}: {
  msg: Message;
  canEdit: boolean;
  onApplyContent: (c: string) => Promise<void>;
  onApplyTitle: (t: string) => Promise<void>;
}) => {
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(msg.applied ?? false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [msg.content]);

  const handleApply = useCallback(async () => {
    setApplying(true);
    try {
      if (msg.action === "improve" || msg.action === "rephrase") {
        await onApplyContent(msg.content);
        toast.success(msg.action === "improve" ? "Writing improved!" : "Note rephrased!");
      } else if (msg.action === "title") {
        await onApplyTitle(msg.content);
        toast.success("Title updated!");
      }
      msg.applied = true;
      setApplied(true);
    } catch {
      toast.error("Failed to apply");
    } finally {
      setApplying(false);
    }
  }, [msg, onApplyContent, onApplyTitle]);

  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3 py-2 text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap">
          {msg.content}
        </div>
      </div>
    );
  }

  const showApply =
    canEdit &&
    !msg.isTyping &&
    !applied &&
    msg.content &&
    (msg.action === "improve" || msg.action === "title" || msg.action === "rephrase");

  const useMarkdown =
    msg.action === "improve" || msg.action === "summarize" || msg.action === "rephrase";

  return (
    <div className="flex gap-2 items-start">
      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Brain size={11} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-bg rounded-2xl rounded-tl-sm px-3 py-2.5 text-xs leading-relaxed text-txt-secondary max-w-[95%]">
          {msg.isTyping && !msg.content ? (
            <span className="text-txt-tertiary italic">Thinking...</span>
          ) : useMarkdown ? (
            <MarkdownRenderer content={msg.content} className="text-xs" />
          ) : (
            <span className="whitespace-pre-wrap">{msg.content}</span>
          )}
        </div>

        {/* Action buttons — Apply is absolutely positioned so Copy never shifts */}
        {!msg.isTyping && msg.content && (
          <div className="relative flex items-center mt-1.5 min-h-[26px]">
            {showApply && (
              <button
                onClick={handleApply}
                disabled={applying || applied}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground transition-opacity duration-200 mr-1.5"
              >
                {applying ? (
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                ) : (
                  <>
                    <Check size={12} />
                    Apply to note
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-txt-tertiary transition-colors hover:text-txt hover:bg-surface-hover"
            >
              {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
});
ChatBubble.displayName = "ChatBubble";

// ── Main component ────────────────────────────────────────────────────────────
export const Assistant = React.memo(({
  noteContent,
  canEdit,
  onClose,
  onApplyContent,
  onApplyTitle,
}: AssistantProps) => {
  const messages      = useAssistantStore((s) => s.messages);
  const isLoading     = useAssistantStore((s) => s.isLoading);
  const sendPrompt    = useAssistantStore((s) => s.sendPrompt);
  const runPreset     = useAssistantStore((s) => s.runPreset);
  const clearMessages = useAssistantStore((s) => s.clearMessages);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    sendPrompt(trimmed, noteContent);
  }, [input, isLoading, sendPrompt, noteContent]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChip = useCallback(
    (action: PresetAction) => {
      if (isLoading) return;
      runPreset(action, noteContent);
    },
    [isLoading, runPreset, noteContent]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      const el = e.target;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    },
    []
  );

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div
        className="
          fixed top-[72px] right-3 bottom-3
          w-[360px] max-w-[calc(100vw-24px)]
          bg-surface border border-border
          rounded-xl shadow-lg
          flex flex-col
          animate-slide-in-right
          overflow-hidden
        "
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Brain size={15} className="text-primary" />
          </div>
          <p className="font-bold text-sm text-txt flex-1">AI Assistant</p>
          {hasMessages && (
            <button
              onClick={clearMessages}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-txt-tertiary transition-colors hover:text-txt hover:bg-surface-hover"
            >
              <Plus size={12} />
              New Chat
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-txt-tertiary transition-colors hover:text-txt hover:bg-surface-hover"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Chat area ───────────────────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 scrollbar-thin"
        >
          {/* Empty state */}
          {!hasMessages && (
            <div className="flex-1 flex flex-col justify-between py-2">
              <div>
                <p className="text-xs font-semibold text-txt-secondary mb-3">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map(({ action, icon, label, color }) => (
                    <button
                      key={action}
                      onClick={() => handleChip(action)}
                      disabled={isLoading}
                      className="flex items-center gap-2.5 rounded-lg border border-border bg-bg px-3 py-3 text-left transition-all duration-150 hover:bg-surface-hover hover:shadow-sm active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className={`shrink-0 ${color}`}>{icon}</span>
                      <span className="text-xs font-medium text-txt-secondary">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 mt-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain size={16} className="text-primary" />
                  </div>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-primary/60" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                  </span>
                </div>
                <p className="text-xs text-txt-tertiary italic">
                  How can I help with this note?
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <ChatBubble
              key={i}
              msg={msg}
              canEdit={canEdit}
              onApplyContent={onApplyContent}
              onApplyTitle={onApplyTitle}
            />
          ))}
        </div>

        {/* ── Input row ───────────────────────────────────────────────── */}
        <div className="px-4 py-3 border-t border-border shrink-0">
          <div className="relative flex items-end rounded-xl border border-border bg-bg focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type an instruction..."
              rows={1}
              className="flex-1 resize-none bg-transparent border-none outline-none text-sm leading-snug py-3 pl-4 pr-12 min-h-[44px] max-h-[120px] text-txt placeholder:text-txt-tertiary"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`
                absolute right-2 bottom-2
                w-8 h-8 rounded-lg flex items-center justify-center
                transition-all duration-150 shrink-0
                ${input.trim() && !isLoading
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:scale-95"
                  : "bg-surface-hover text-txt-tertiary cursor-not-allowed"
                }
              `}
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-txt-tertiary mt-1.5 text-center">
            AI can make mistakes. Please double-check responses.
          </p>
        </div>
      </div>
    </div>
  );
});

Assistant.displayName = "Assistant";
