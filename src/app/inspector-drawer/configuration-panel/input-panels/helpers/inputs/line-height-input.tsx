import React from 'react';

import { FormatLineSpacingOutlined } from '@mui/icons-material';
import { InputAdornment, Stack, TextField } from '@mui/material';

type Props = {
  label: string;
  defaultValue: number | null | undefined;
  onChange: (v: number | null) => void;
};
export default function LineHeightInput({ label, defaultValue, onChange }: Props) {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    const raw = ev.target.value.trim();
    if (raw === '') {
      onChange(null);
      return;
    }
    const value = parseFloat(raw);
    onChange(isNaN(value) ? null : value);
  };
  return (
    <Stack spacing={1} alignItems="flex-start">
      <TextField
        fullWidth
        onChange={handleChange}
        defaultValue={defaultValue ?? ''}
        label={label}
        variant="standard"
        placeholder="default"
        size="small"
        type="number"
        inputProps={{ step: 0.1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FormatLineSpacingOutlined sx={{ fontSize: 16 }} />
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );
}
