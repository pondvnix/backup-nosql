
import React, { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface OptionType {
  text: string;
  value: string;
}

interface UniqueValueSelectorProps {
  options: OptionType[];
  selected?: { value: string };
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

  useEffect(() => {
    setSelectedValue(selected?.value);
  }, [selected]);

  const handleValueChange = (value: string) => {
    // Check if the value is already used (but not by the current selection)
    if (usedValues.includes(value) && value !== selected?.value) {
      toast({
        title: "Selection Error",
        description: "This value has already been selected elsewhere. Please choose a unique value.",
        variant: "destructive",
      });
      return;
    }

    setSelectedValue(value);
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
          const isDisabled = usedValues.includes(option.value) && option.value !== selected?.value;
          // Create a unique value for each option
          const optionValue = option.value;
          
          return (
            <div 
              key={optionValue} 
              className={cn(
                "flex items-center space-x-2 rounded-md border p-3 transition-colors",
                isDisabled ? "opacity-50 cursor-not-allowed bg-muted" : "hover:bg-accent",
                selectedValue === optionValue && "border-primary bg-accent"
              )}
            >
              <RadioGroupItem 
                value={optionValue} 
                id={`option-${optionValue}`}
                disabled={isDisabled}
              />
              <Label 
                htmlFor={`option-${optionValue}`} 
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
