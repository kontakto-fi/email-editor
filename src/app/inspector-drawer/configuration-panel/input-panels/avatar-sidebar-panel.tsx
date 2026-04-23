import React, { useState } from 'react';

import { AspectRatioOutlined } from '@mui/icons-material';
import { ToggleButton } from '@mui/material';
import { AvatarPropsDefaults, AvatarPropsSchema } from '@blocks';
import type { AvatarProps } from '@blocks';
import { t } from '@i18n';

import BaseSidebarPanel from './helpers/base-sidebar-panel';
import RadioGroupInput from './helpers/inputs/radio-group-input';
import SliderInput from './helpers/inputs/slider-input';
import TextInput from './helpers/inputs/text-input';
import MultiStylePropertyPanel from './helpers/style-inputs/multi-style-property-panel';

type AvatarSidebarPanelProps = {
  data: AvatarProps;
  setData: (v: AvatarProps) => void;
};
export default function AvatarSidebarPanel({ data, setData }: AvatarSidebarPanelProps) {
  const [, setErrors] = useState<Zod.ZodError | null>(null);
  const updateData = (d: unknown) => {
    const res = AvatarPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  const size = data.props?.size ?? AvatarPropsDefaults.size;
  const imageUrl = data.props?.imageUrl ?? AvatarPropsDefaults.imageUrl;
  const alt = data.props?.alt ?? AvatarPropsDefaults.alt;
  const shape = data.props?.shape ?? AvatarPropsDefaults.shape;

  return (
    <BaseSidebarPanel title="Avatar block">
      <SliderInput
        label={t('field.size', 'Size')}
        iconLabel={<AspectRatioOutlined sx={{ color: 'text.secondary' }} />}
        units="px"
        step={3}
        min={32}
        max={256}
        defaultValue={size}
        onChange={(size) => {
          updateData({ ...data, props: { ...data.props, size } });
        }}
      />
      <RadioGroupInput
        label={t('avatar.shape', 'Shape')}
        defaultValue={shape}
        onChange={(shape) => {
          updateData({ ...data, props: { ...data.props, shape } });
        }}
      >
        <ToggleButton value="circle">{t('signature.shape.circle', 'Circle')}</ToggleButton>
        <ToggleButton value="square">{t('signature.shape.square', 'Square')}</ToggleButton>
        <ToggleButton value="rounded">{t('signature.shape.rounded', 'Rounded')}</ToggleButton>
      </RadioGroupInput>
      <TextInput
        label={t('signature.image-url', 'Image URL')}
        defaultValue={imageUrl}
        onChange={(imageUrl) => {
          updateData({ ...data, props: { ...data.props, imageUrl } });
        }}
      />
      <TextInput
        label={t('image.alt-text', 'Alt text')}
        defaultValue={alt}
        onChange={(alt) => {
          updateData({ ...data, props: { ...data.props, alt } });
        }}
      />

      <MultiStylePropertyPanel
        names={['textAlign', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
