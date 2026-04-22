import React from 'react';

import { SpaceBarOutlined } from '@mui/icons-material';
import { InputAdornment, Stack, TextField, Typography } from '@mui/material';

type Props = {
  label: string;
  defaultValue: number | null | undefined;
  onChange: (v: number | null) => void;
};
export default function LetterSpacingInput({ label, defaultValue, onChange }: Props) {
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
        placeholder="normal"
        size="small"
        type="number"
        inputProps={{ step: 0.5 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SpaceBarOutlined sx={{ fontSize: 16 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <Typography variant="body2" color="text.secondary">
              px
            </Typography>
          ),
        }}
      />
    </Stack>
  );
}
