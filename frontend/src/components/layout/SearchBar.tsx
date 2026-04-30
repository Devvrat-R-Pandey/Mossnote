export const SearchBar = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="relative w-full max-w-sm">
    <input
      type="text"
      className="input input-bordered w-full pr-10"
      placeholder="Search notes..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
        onClick={() => onChange("")}
        type="button"
      >
        ✕
      </button>
    )}
  </div>
);
