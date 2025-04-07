
import React, { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface OptionType {
  text: string;
  value: string;
}

interface UniqueValueSelectorProps {
  options: OptionType[];
  selected?: { value: string; text?: string };
  onSelect: (option: OptionType | undefined) => void;
  onSelectAll?: (options: OptionType[]) => void;
  usedValues?: string[];
  className?: string;
  title?: string;
}

export function UniqueValueSelector({
  options,
  selected,
  onSelect,
  onSelectAll,
  usedValues = [],
  className,
  title = "Select an option"
}: UniqueValueSelectorProps) {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(selected?.value);
  const { toast } = useToast();

  // Update selectedValue when selected prop changes
  useEffect(() => {
    setSelectedValue(selected?.value);
  }, [selected]);

  const handleValueChange = (value: string) => {
    // Check if the value is already used elsewhere (but not by the current selection)
    if (usedValues.includes(value) && value !== selected?.value) {
      // Find the option text
      const optionText = options.find(opt => opt.value === value)?.text || value;
      
      toast({
        title: "Selection Error",
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>
              "{optionText}" has already been selected elsewhere. The other selection will be cleared.
            </span>
          </div>
        ),
        variant: "destructive",
      });
    }

    // Update internal state
    setSelectedValue(value);
    
    // Find the selected option and send it to parent
    const selectedOption = options.find(option => option.value === value);
    if (selectedOption) {
      onSelect(selectedOption);
    }
  };

  const handleClearSelection = () => {
    setSelectedValue(undefined);
    onSelect(undefined);
  };

  const handleSelectAll = () => {
    if (onSelectAll) {
      // Filter out options that are already used elsewhere
      const availableOptions = options.filter(option => 
        !usedValues.includes(option.value) || option.value === selected?.value
      );
      onSelectAll(availableOptions);
    }
  };

  // Generate a safe ID from the title
  const getSafeTitle = () => {
    return title?.replace(/\s+/g, '-').toLowerCase() || 'default';
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">{title}</h4>
        <div className="flex gap-2">
          {onSelectAll && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
              className="text-xs h-8"
            >
              <Check className="mr-1 h-3 w-3" />
              Check all available
            </Button>
          )}
          {selectedValue && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearSelection}
              className="text-xs h-8"
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>
      
      <RadioGroup 
        value={selectedValue} 
        onValueChange={handleValueChange}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
      >
        {options.map((option) => {
          // A value is disabled if it's used elsewhere (but not by this selector)
          const isDisabled = usedValues.includes(option.value) && option.value !== selected?.value;
          // Create a unique ID for each radio item
          const uniqueId = `option-${option.value}-${getSafeTitle()}`;
          
          return (
            <div 
              key={option.value}
              className={cn(
                "flex items-center space-x-2 rounded-md border p-3 transition-colors",
                isDisabled ? "opacity-50 cursor-not-allowed bg-muted" : "hover:bg-accent cursor-pointer",
                selectedValue === option.value && "border-primary bg-accent"
              )}
              onClick={() => !isDisabled && handleValueChange(option.value)}
            >
              <RadioGroupItem 
                value={option.value}
                id={uniqueId}
                disabled={isDisabled}
              />
              <Label 
                htmlFor={uniqueId}
                className={cn(
                  "cursor-pointer flex-1",
                  isDisabled && "cursor-not-allowed"
                )}
              >
                {option.text}
                {isDisabled && (
                  <span className="ml-2 text-xs text-destructive">(already selected)</span>
                )}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
