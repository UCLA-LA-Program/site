import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar({
  query,
  setQuery,
  filtered,
  total,
  placeholder = "Search name or email…",
}: {
  query: string;
  setQuery: (value: string) => void;
  filtered: number;
  total: number;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-xs"
      />
      {query && (
        <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
          Clear
        </Button>
      )}
      <span className="ml-auto text-xs text-muted-foreground">
        {filtered} of {total}
      </span>
    </div>
  );
}
