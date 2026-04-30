import { useState, useEffect } from "react";
import { ZapIcon } from "lucide-react";
import { useUiStore } from "../../store/uiStore";
import { useNotesStore } from "../../store/notesStore";

const RateLimitCard = () => {
  const setRateLimited = useUiStore((s) => s.setRateLimited);
  const fetchNotes = useNotesStore((s) => s.fetchNotes);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      // Refetch notes before dismissing so the user sees their data
      fetchNotes();
      setRateLimited(false);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, setRateLimited, fetchNotes]);

  return (
    <div className="fixed inset-0 z-[9998] bg-base-200/95 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="rate-limit-card border border-cyan-500/30 rounded-xl shadow-2xl max-w-2xl w-full animate-fade-in">
        <div className="flex items-center p-5 gap-5">
          <div className="flex-shrink-0 bg-cyan-500/15 p-3.5 rounded-full">
            <ZapIcon className="size-8 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold">Rate Limit Reached</h3>
            <p className="opacity-70 text-sm mt-0.5">
              You've made too many requests in a short period. Please wait a moment.
            </p>
            <p className="text-cyan-500 text-xs mt-1">
              Try again in {countdown} seconds for the best experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimitCard;
