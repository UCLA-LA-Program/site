import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function CourseTypeFilter({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map((t) => {
        const selected = value.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() =>
              onChange(
                selected ? value.filter((x) => x !== t) : [...value, t],
              )
            }
            className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium ${
              selected
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/70"
            }`}
          >
            {t}
            {selected && <X className="h-3 w-3 opacity-60" />}
          </button>
        );
      })}
      {value.length > 0 && (
        <Button variant="ghost" size="sm" onClick={() => onChange([])}>
          Clear
        </Button>
      )}
    </div>
  );
}
