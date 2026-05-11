import { Menu } from "lucide-react";
import { useUiStore } from "../../store/uiStore";

// Mobile-only top bar — shows menu button + brand logo + name.
export const Navbar = () => {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
      <button
        type="button"
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-txt-secondary transition-colors hover:bg-surface-hover hover:text-txt"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2">
        <img
          src="/Mossnote.png"
          alt="Mossnote"
          className="h-6 w-auto object-contain"
          draggable={false}
        />
        <span className="font-bold tracking-tight text-txt">Mossnote</span>
      </div>

      {/* Spacer keeps brand visually centered */}
      <div className="w-9" />
    </header>
  );
};
