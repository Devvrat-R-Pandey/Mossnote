// Displays markdown using the page-level parser.
import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    marked: { parse: (md: string) => string | Promise<string> };
  }
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = React.memo(({ content, className = "" }: MarkdownRendererProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ref.current || !content) return;

    const render = async () => {
      try {
        if (window.marked) {
          const html = await window.marked.parse(content);
          if (ref.current) {
            ref.current.innerHTML = typeof html === "string" ? html : content;
          }
        } else {
          // fallback: plain text
          if (ref.current) ref.current.textContent = content;
        }
      } catch {
        if (ref.current) ref.current.textContent = content;
      } finally {
        setReady(true);
      }
    };

    render();
  }, [content]);

  return (
    <div
      ref={ref}
      className={`
        leading-relaxed
        ${ready ? "" : "invisible"}
        [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-txt
        [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-txt
        [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-txt
        [&_p]:mb-2
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
        [&_li]:mb-0.5
        [&_strong]:font-bold
        [&_em]:italic
        [&_code]:bg-bg [&_code]:border [&_code]:border-border [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:text-primary
        [&_pre]:bg-bg [&_pre]:border [&_pre]:border-border [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-2 [&_pre]:text-xs
        [&_pre_code]:bg-transparent [&_pre_code]:border-0 [&_pre_code]:p-0 [&_pre_code]:text-txt
        [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:my-2 [&_blockquote]:text-txt-secondary [&_blockquote]:italic
        [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2
        ${className}
      `}
    />
  );
});

MarkdownRenderer.displayName = "MarkdownRenderer";
