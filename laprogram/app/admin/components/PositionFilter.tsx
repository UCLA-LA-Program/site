import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { LA_POSITION_MAP } from "@/lib/constants";

export function PositionFilter({
  options,
  value,
  onChange,
  inputClassName = "w-48",
}: {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  inputClassName?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Combobox
          items={options}
          multiple
          value={value}
          onValueChange={(v: string[]) => onChange(v)}
          filter={(item: string, query: string) => {
            const label = LA_POSITION_MAP.get(item) ?? item;
            return (
              item.toLowerCase().includes(query.toLowerCase()) ||
              label.toLowerCase().includes(query.toLowerCase())
            );
          }}
        >
          <ComboboxInput placeholder="Filter roles…" className={inputClassName} />
          <ComboboxContent>
            <ComboboxEmpty>No roles</ComboboxEmpty>
            <ComboboxList>
              <ComboboxCollection>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {LA_POSITION_MAP.get(item) ?? item}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {value.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => onChange([])}>
            Clear
          </Button>
        )}
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(value.filter((x) => x !== p))}
              className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-1 text-xs font-medium hover:bg-muted/70"
            >
              {LA_POSITION_MAP.get(p) ?? p}
              <X className="h-3 w-3 opacity-60" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
