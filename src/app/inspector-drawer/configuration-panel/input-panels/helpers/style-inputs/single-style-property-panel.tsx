import React from 'react';

import { RoundedCornerOutlined } from '@mui/icons-material';

import { TStyle } from '@editor/blocks/helpers/tstyle';
import { t } from '@i18n';
import { NullableColorInput } from '../inputs/color-input/index';
import { NullableFontFamily } from '../inputs/font-family';
import FontSizeInput from '../inputs/font-size-input';
import FontWeightInput from '../inputs/font-weight-input';
import LetterSpacingInput from '../inputs/letter-spacing-input';
import LineHeightInput from '../inputs/line-height-input';
import PaddingInput from '../inputs/padding-input';
import SliderInput from '../inputs/slider-input';
import TextAlignInput from '../inputs/text-align-input';

type StylePropertyPanelProps = {
  name: keyof TStyle;
  value: TStyle;
  onChange: (style: TStyle) => void;
};
export default function SingleStylePropertyPanel({ name, value, onChange }: StylePropertyPanelProps) {
  const defaultValue = value[name] ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (v: any) => {
    onChange({ ...value, [name]: v });
  };

  switch (name) {
    case 'backgroundColor':
      return <NullableColorInput label={t('style.background-color', 'Background color')} defaultValue={defaultValue} onChange={handleChange} />;
    case 'borderColor':
      return <NullableColorInput label={t('style.border-color', 'Border color')} defaultValue={defaultValue} onChange={handleChange} />;
    case 'borderRadius':
      return (
        <SliderInput
          iconLabel={<RoundedCornerOutlined />}
          units="px"
          step={4}
          marks
          min={0}
          max={48}
          label={t('style.border-radius', 'Border radius')}
          defaultValue={defaultValue}
          onChange={handleChange}
        />
      );
    case 'color':
      return <NullableColorInput label={t('style.text-color', 'Text color')} defaultValue={defaultValue} onChange={handleChange} />;
    case 'fontFamily':
      return <NullableFontFamily label={t('style.font-family', 'Font family')} defaultValue={defaultValue} onChange={handleChange} />;
    case 'fontSize':
      return <FontSizeInput label={t('style.font-size', 'Font size')} defaultValue={defaultValue} onChange={handleChange} />;
    case 'fontWeight':
      return <FontWeightInput label={t('style.font-weight', 'Font weight')} defaultValue={defaultValue} onChange={handleChange} />;
    case 'lineHeight':
      return <LineHeightInput label={t('style.line-height', 'Line height')} defaultValue={defaultValue} onChange={handleChange} />;
    case 'letterSpacing':
      return <LetterSpacingInput label={t('style.letter-spacing', 'Letter spacing')} defaultValue={defaultValue} onChange={handleChange} />;
    case 'textAlign':
      return <TextAlignInput label={t('style.alignment', 'Alignment')} defaultValue={defaultValue} onChange={handleChange} />;
    case 'padding':
      return <PaddingInput label={t('style.padding', 'Padding')} defaultValue={defaultValue} onChange={handleChange} />;
  }
}
