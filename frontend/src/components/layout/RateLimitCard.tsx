import React, { useState, useEffect, useCallback } from "react";
import { Zap } from "lucide-react";
import { useUiStore } from "../../store/uiStore";
import { useNotesStore } from "../../store/notesStore";

const RateLimitCard = React.memo(() => {
  const setRateLimited = useUiStore((s) => s.setRateLimited);
  const fetchNotes = useNotesStore((s) => s.fetchNotes);
  const [countdown, setCountdown] = useState(5);

  const dismiss = useCallback(() => {
    fetchNotes();
    setRateLimited(false);
  }, [fetchNotes, setRateLimited]);

  useEffect(() => {
    if (countdown <= 0) {
      dismiss();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, dismiss]);

  return (
    <div className="fixed inset-0 z-[9998] bg-bg/95 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="rounded-xl border border-warning/30 bg-warning-light shadow-lg max-w-2xl w-full animate-fade-in">
        <div className="flex items-center p-5 gap-5">
          <div className="flex-shrink-0 rounded-full bg-warning/15 p-3.5">
            <Zap className="h-8 w-8 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-txt">Rate Limit Reached</h3>
            <p className="text-sm text-txt-secondary mt-0.5">
              You've made too many requests in a short period. Please wait a moment.
            </p>
            <p className="text-xs text-warning font-medium mt-1">
              Try again in {countdown} seconds for the best experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

RateLimitCard.displayName = "RateLimitCard";
export default RateLimitCard;
