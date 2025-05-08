import React, { useState, useEffect } from 'react';

import { ToggleButton } from '@mui/material';

import RadioGroupInput from './radio-group-input';

type Props = {
  label: string;
  defaultValue: string;
  onChange: (value: string) => void;
};
export default function FontWeightInput({ label, defaultValue, onChange }: Props) {
  const [value, setValue] = useState(defaultValue);
  
  // Synchronize with external changes to defaultValue
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);
  
  return (
    <RadioGroupInput
      label={label}
      defaultValue={value}
      onChange={(fontWeight) => {
        setValue(fontWeight);
        onChange(fontWeight);
      }}
    >
      <ToggleButton value="normal">Regular</ToggleButton>
      <ToggleButton value="bold">Bold</ToggleButton>
    </RadioGroupInput>
  );
}
