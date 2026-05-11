import React, { useCallback } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export const SearchBar = React.memo(({ value, onChange }: SearchBarProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange]
  );

  const handleClear = useCallback(() => onChange(""), [onChange]);

  return (
    <div className="relative w-full max-w-sm">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary pointer-events-none"
      />
      <input
        type="text"
        className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-9 text-sm text-txt placeholder:text-txt-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        placeholder="Search notes..."
        value={value}
        onChange={handleChange}
      />
      {value && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-txt-tertiary transition-colors hover:text-txt hover:bg-surface-hover"
          onClick={handleClear}
          type="button"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = "SearchBar";
