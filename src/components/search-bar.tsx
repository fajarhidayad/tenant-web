import { useEffect, useRef, useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { Input } from './ui/input';

export default function SearchBar({
  value,
  onChange,
  isLoading,
}: {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input/textarea
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative group w-full">
      {/* Search Icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center z-10">
        <Search
          className={`h-4 w-4 transition-all duration-200 ${
            isFocused
              ? 'text-primary'
              : 'text-muted-foreground group-hover:text-primary/70'
          }`}
        />
      </div>

      {/* Input */}
      <Input
        ref={inputRef}
        type="text"
        placeholder="Cari tenant..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`pl-9 pr-10 h-10 text-sm border transition-all duration-200 ${
          isFocused
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-input hover:border-primary/50'
        }`}
      />

      {/* Right side icons */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {/* Loading Indicator */}
        {isLoading && <Loader2 className="h-4 w-4 text-primary animate-spin" />}

        {/* Clear Button */}
        {value && !isLoading && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1 rounded-md hover:bg-muted transition-colors duration-150"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        )}

        {/* Search Shortcut Hint */}
        {!value && !isFocused && (
          <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border bg-muted/30 text-xs text-muted-foreground">
            <kbd className="px-1 py-0.5 rounded bg-background border font-mono text-[10px]">
              /
            </kbd>
          </div>
        )}
      </div>
    </div>
  );
}
