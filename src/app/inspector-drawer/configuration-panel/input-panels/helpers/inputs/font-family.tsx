import React, { useState, useEffect } from 'react';

import { MenuItem, TextField } from '@mui/material';

import { FONT_FAMILIES } from '@editor/blocks/helpers/font-family';

const OPTIONS = FONT_FAMILIES.map((option) => (
  <MenuItem key={option.key} value={option.key} sx={{ fontFamily: option.value }}>
    {option.label}
  </MenuItem>
));

type NullableProps = {
  label: string;
  onChange: (value: null | string) => void;
  defaultValue: null | string;
};
export function NullableFontFamily({ label, onChange, defaultValue }: NullableProps) {
  const [value, setValue] = useState(defaultValue ?? 'inherit');
  
  // Synchronize with external changes to defaultValue
  useEffect(() => {
    setValue(defaultValue ?? 'inherit');
  }, [defaultValue]);
  
  return (
    <TextField
      select
      variant="standard"
      label={label}
      value={value}
      onChange={(ev) => {
        const v = ev.target.value;
        setValue(v);
        onChange(v === null ? null : v);
      }}
    >
      <MenuItem value="inherit">Match email settings</MenuItem>
      {OPTIONS}
    </TextField>
  );
}
