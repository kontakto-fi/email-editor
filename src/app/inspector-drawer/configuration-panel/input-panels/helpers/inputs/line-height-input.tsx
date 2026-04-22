import React, { useEffect, useState } from 'react';

import { FormatLineSpacingOutlined } from '@mui/icons-material';
import { InputLabel, Stack } from '@mui/material';

import RawSliderInput from './raw/raw-slider-input';

type Props = {
  label: string;
  defaultValue: number | null | undefined;
  onChange: (v: number | null) => void;
};
export default function LineHeightInput({ label, defaultValue, onChange }: Props) {
  const [value, setValue] = useState<number>(defaultValue ?? 0);

  useEffect(() => {
    setValue(defaultValue ?? 0);
  }, [defaultValue]);

  const handleChange = (v: number) => {
    setValue(v);
    onChange(v === 0 ? null : v);
  };

  return (
    <Stack spacing={1} alignItems="flex-start">
      <InputLabel shrink>{label}</InputLabel>
      <RawSliderInput
        iconLabel={<FormatLineSpacingOutlined sx={{ fontSize: 16 }} />}
        value={value}
        setValue={handleChange}
        units=""
        step={0.1}
        min={0}
        max={2}
      />
    </Stack>
  );
}
