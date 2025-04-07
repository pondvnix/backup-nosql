
import * as React from "react";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export interface OptionType {
  text: string;
  value: string;
  [key: string]: any; // Allow additional properties
}

interface UniqueValueSelectorProps {
  options: OptionType[];
  selected?: OptionType;
  onSelect: (option: OptionType | undefined) => void;
  onSelectAll?: (options: OptionType[]) => void;
  usedValues?: string[];
  title?: string;
  renderOptionLabel?: (option: OptionType) => React.ReactNode;
}

export function UniqueValueSelector({
  options,
  selected,
  onSelect,
  onSelectAll,
  usedValues = [],
  title = "เลือกตัวเลือก",
  renderOptionLabel
}: UniqueValueSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (option: OptionType) => {
    if (selected?.value === option.value) {
      // If clicking the already selected option, deselect it
      onSelect(undefined);
    } else {
      onSelect(option);
    }
    setOpen(false);
  };

  // Get available options (filter out used values)
  const availableOptions = options.filter(
    (option) => !usedValues.includes(option.value)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selected ? (
            <span className="flex items-center justify-between w-full">
              {renderOptionLabel ? renderOptionLabel(selected) : selected.text}
            </span>
          ) : (
            <span className="text-muted-foreground">{title}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="ค้นหา..." />
          <CommandList>
            <CommandEmpty>ไม่พบตัวเลือก</CommandEmpty>
            <CommandGroup>
              {availableOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option)}
                  className="flex items-center py-2"
                >
                  <div className={cn(
                    "mr-2 flex h-5 w-5 items-center justify-center rounded-full border",
                    selected?.value === option.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-primary/20 bg-primary/10"
                  )}>
                    {selected?.value === option.value && (
                      <CheckIcon className="h-3 w-3" />
                    )}
                  </div>
                  {renderOptionLabel ? renderOptionLabel(option) : option.text}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
