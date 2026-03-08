import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  icon: React.ReactNode;
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelectFilter({ icon, label, options, selected, onChange }: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value]
    );
  };

  const count = selected.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-xs font-medium border-border/50 bg-accent/30",
            count > 0 && "border-primary/50 bg-primary/10 text-primary"
          )}
        >
          {icon}
          {label}
          {count > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground leading-none">
              {count}
            </span>
          )}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 max-h-72 overflow-y-auto" align="start">
        {options.map(opt => (
          <label
            key={opt.value}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer text-sm"
          >
            <Checkbox
              checked={selected.includes(opt.value)}
              onCheckedChange={() => toggle(opt.value)}
            />
            <span className="truncate">{opt.label}</span>
          </label>
        ))}
        {count > 0 && (
          <button
            onClick={() => onChange([])}
            className="w-full mt-1 text-xs text-muted-foreground hover:text-foreground text-center py-1"
          >
            Tout effacer
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
