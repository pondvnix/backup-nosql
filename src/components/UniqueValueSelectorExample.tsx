
import React, { useState } from "react";
import { UniqueValueSelector } from "@/components/ui/unique-value-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OptionType {
  text: string;
  value: string;
}

const colorOptions: OptionType[] = [
  { text: "Red", value: "red" },
  { text: "Blue", value: "blue" },
  { text: "Green", value: "green" },
  { text: "Yellow", value: "yellow" },
  { text: "Purple", value: "purple" },
  { text: "Orange", value: "orange" },
];

const UniqueValueSelectorExample = () => {
  const [selection1, setSelection1] = useState<OptionType | undefined>();
  const [selection2, setSelection2] = useState<OptionType | undefined>();
  const [allSelected, setAllSelected] = useState<OptionType[]>([]);

  // Get all used values from both selectors
  const usedValues = [
    selection1?.value,
    selection2?.value,
  ].filter(Boolean) as string[];

  const handleSelectAll = (options: OptionType[]) => {
    setAllSelected(options);
    // Distribute these values among your selectors
    if (options.length > 0) {
      setSelection1(options[0]);
      if (options.length > 1) {
        setSelection2(options[1]);
      } else {
        // Clear selection2 if there's only one option
        setSelection2(undefined);
      }
    } else {
      // Clear both selections if no options
      setSelection1(undefined);
      setSelection2(undefined);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">Unique Value Selector Example</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Selector 1</CardTitle>
          </CardHeader>
          <CardContent>
            <UniqueValueSelector
              options={colorOptions}
              selected={selection1}
              onSelect={setSelection1}
              usedValues={usedValues}
              title="Choose a color"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Selector 2</CardTitle>
          </CardHeader>
          <CardContent>
            <UniqueValueSelector
              options={colorOptions}
              selected={selection2}
              onSelect={setSelection2}
              onSelectAll={handleSelectAll}
              usedValues={usedValues}
              title="Choose another color"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selected Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Selector 1:</strong> {selection1?.text || "None"}</p>
            <p><strong>Selector 2:</strong> {selection2?.text || "None"}</p>
            <p><strong>All Selected:</strong> {allSelected.map(o => o.text).join(", ") || "None"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UniqueValueSelectorExample;
