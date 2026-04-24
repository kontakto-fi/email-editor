import React, { useState, useEffect } from 'react';

import { ToggleButton } from '@mui/material';

import { t } from '@i18n';

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
      <ToggleButton value="normal">{t('font-weight.regular', 'Regular')}</ToggleButton>
      <ToggleButton value="bold">{t('font-weight.bold', 'Bold')}</ToggleButton>
    </RadioGroupInput>
  );
}
