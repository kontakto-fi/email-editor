import React, { useState } from 'react';

import { ToggleButton } from '@mui/material';
import { ButtonPropsDefaults, ButtonPropsSchema } from '@blocks';
import type { ButtonProps } from '@blocks';
import { t } from '@i18n';

import BaseSidebarPanel from './helpers/base-sidebar-panel';
import ColorInput from './helpers/inputs/color-input';
import RadioGroupInput from './helpers/inputs/radio-group-input';
import TextInput from './helpers/inputs/text-input';
import MultiStylePropertyPanel from './helpers/style-inputs/multi-style-property-panel';

type ButtonSidebarPanelProps = {
  data: ButtonProps;
  setData: (v: ButtonProps) => void;
};
export default function ButtonSidebarPanel({ data, setData }: ButtonSidebarPanelProps) {
  const [, setErrors] = useState<Zod.ZodError | null>(null);

  const updateData = (d: unknown) => {
    const res = ButtonPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  const text = data.props?.text ?? ButtonPropsDefaults.text;
  const url = data.props?.url ?? ButtonPropsDefaults.url;
  const fullWidth = data.props?.fullWidth ?? ButtonPropsDefaults.fullWidth;
  const size = data.props?.size ?? ButtonPropsDefaults.size;
  const buttonStyle = data.props?.buttonStyle ?? ButtonPropsDefaults.buttonStyle;
  const buttonTextColor = data.props?.buttonTextColor ?? ButtonPropsDefaults.buttonTextColor;
  const buttonBackgroundColor = data.props?.buttonBackgroundColor ?? ButtonPropsDefaults.buttonBackgroundColor;

  return (
    <BaseSidebarPanel title="Button block">
      <TextInput
        label={t('field.text', 'Text')}
        defaultValue={text}
        onChange={(text) => updateData({ ...data, props: { ...data.props, text } })}
      />
      <TextInput
        label={t('field.url', 'Url')}
        defaultValue={url}
        onChange={(url) => updateData({ ...data, props: { ...data.props, url } })}
      />
      <RadioGroupInput
        label={t('field.width', 'Width')}
        defaultValue={fullWidth ? 'FULL_WIDTH' : 'AUTO'}
        onChange={(v) => updateData({ ...data, props: { ...data.props, fullWidth: v === 'FULL_WIDTH' } })}
      >
        <ToggleButton value="FULL_WIDTH">{t('button.width.full', 'Full')}</ToggleButton>
        <ToggleButton value="AUTO">{t('button.width.auto', 'Auto')}</ToggleButton>
      </RadioGroupInput>
      <RadioGroupInput
        label={t('field.size', 'Size')}
        defaultValue={size}
        onChange={(size) => updateData({ ...data, props: { ...data.props, size } })}
      >
        <ToggleButton value="x-small">{t('size.xs', 'Xs')}</ToggleButton>
        <ToggleButton value="small">{t('size.sm', 'Sm')}</ToggleButton>
        <ToggleButton value="medium">{t('size.md', 'Md')}</ToggleButton>
        <ToggleButton value="large">{t('size.lg', 'Lg')}</ToggleButton>
      </RadioGroupInput>
      <RadioGroupInput
        label={t('field.style', 'Style')}
        defaultValue={buttonStyle}
        onChange={(buttonStyle) => updateData({ ...data, props: { ...data.props, buttonStyle } })}
      >
        <ToggleButton value="rectangle">{t('button.style.rectangle', 'Rectangle')}</ToggleButton>
        <ToggleButton value="rounded">{t('button.style.rounded', 'Rounded')}</ToggleButton>
        <ToggleButton value="pill">{t('button.style.pill', 'Pill')}</ToggleButton>
      </RadioGroupInput>
      <ColorInput
        label={t('style.text-color', 'Text color')}
        defaultValue={buttonTextColor}
        onChange={(buttonTextColor) => updateData({ ...data, props: { ...data.props, buttonTextColor } })}
      />
      <ColorInput
        label={t('button.color', 'Button color')}
        defaultValue={buttonBackgroundColor}
        onChange={(buttonBackgroundColor) => updateData({ ...data, props: { ...data.props, buttonBackgroundColor } })}
      />
      <MultiStylePropertyPanel
        names={[
          'backgroundColor',
          'fontFamily',
          'fontSize',
          'fontWeight',
          'lineHeight',
          'letterSpacing',
          'textAlign',
          'padding',
        ]}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
