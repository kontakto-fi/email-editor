import React, { useState } from 'react';

import { AspectRatioOutlined } from '@mui/icons-material';
import { ToggleButton } from '@mui/material';
import { SignaturePropsDefaults, SignaturePropsSchema } from '@blocks';
import type { SignatureProps } from '@blocks';
import { t } from '@i18n';

import BaseSidebarPanel from './helpers/base-sidebar-panel';
import ColorInput from './helpers/inputs/color-input';
import RadioGroupInput from './helpers/inputs/radio-group-input';
import SliderInput from './helpers/inputs/slider-input';
import TextInput from './helpers/inputs/text-input';
import MultiStylePropertyPanel from './helpers/style-inputs/multi-style-property-panel';

type SignatureSidebarPanelProps = {
  data: SignatureProps;
  setData: (v: SignatureProps) => void;
};
export default function SignatureSidebarPanel({ data, setData }: SignatureSidebarPanelProps) {
  const [, setErrors] = useState<Zod.ZodError | null>(null);
  const updateData = (d: unknown) => {
    const res = SignaturePropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  const greeting = data.props?.greeting ?? SignaturePropsDefaults.greeting;
  const name = data.props?.name ?? SignaturePropsDefaults.name;
  const title = data.props?.title ?? SignaturePropsDefaults.title;
  const company = data.props?.company ?? SignaturePropsDefaults.company;
  const address = data.props?.address ?? SignaturePropsDefaults.address;
  const email = data.props?.email ?? SignaturePropsDefaults.email;
  const phone = data.props?.phone ?? SignaturePropsDefaults.phone;
  const website = data.props?.website ?? SignaturePropsDefaults.website;
  const imageUrl = data.props?.imageUrl ?? SignaturePropsDefaults.imageUrl;
  const imageSize = data.props?.imageSize ?? SignaturePropsDefaults.imageSize;
  const imageShape = data.props?.imageShape ?? SignaturePropsDefaults.imageShape;
  const layout = data.props?.layout ?? SignaturePropsDefaults.layout;
  const nameColor = data.props?.nameColor ?? SignaturePropsDefaults.nameColor;
  const textColor = data.props?.textColor ?? SignaturePropsDefaults.textColor;
  const linkColor = data.props?.linkColor ?? SignaturePropsDefaults.linkColor;

  return (
    <BaseSidebarPanel title="Signature block">
      <TextInput
        label={t('signature.greeting', 'Greeting')}
        defaultValue={greeting}
        onChange={(greeting) => updateData({ ...data, props: { ...data.props, greeting } })}
      />
      <TextInput
        label={t('signature.name', 'Name')}
        defaultValue={name}
        onChange={(name) => updateData({ ...data, props: { ...data.props, name } })}
      />
      <TextInput
        label={t('signature.title', 'Title')}
        defaultValue={title}
        onChange={(title) => updateData({ ...data, props: { ...data.props, title } })}
      />
      <TextInput
        label={t('signature.company', 'Company')}
        defaultValue={company}
        onChange={(company) => updateData({ ...data, props: { ...data.props, company } })}
      />
      <TextInput
        label={t('signature.address', 'Address')}
        defaultValue={address}
        onChange={(address) => updateData({ ...data, props: { ...data.props, address } })}
      />
      <TextInput
        label={t('signature.email', 'Email')}
        defaultValue={email}
        onChange={(email) => updateData({ ...data, props: { ...data.props, email } })}
      />
      <TextInput
        label={t('signature.phone', 'Phone')}
        defaultValue={phone}
        onChange={(phone) => updateData({ ...data, props: { ...data.props, phone } })}
      />
      <TextInput
        label={t('signature.website', 'Website')}
        defaultValue={website}
        onChange={(website) => updateData({ ...data, props: { ...data.props, website } })}
      />
      <TextInput
        label={t('signature.image-url', 'Image URL')}
        defaultValue={imageUrl}
        onChange={(imageUrl) => updateData({ ...data, props: { ...data.props, imageUrl } })}
      />
      <SliderInput
        label={t('signature.image-size', 'Image size')}
        iconLabel={<AspectRatioOutlined sx={{ color: 'text.secondary' }} />}
        units="px"
        step={4}
        min={32}
        max={128}
        defaultValue={imageSize}
        onChange={(imageSize) => updateData({ ...data, props: { ...data.props, imageSize } })}
      />
      <RadioGroupInput
        label={t('signature.image-shape', 'Image shape')}
        defaultValue={imageShape}
        onChange={(imageShape) => updateData({ ...data, props: { ...data.props, imageShape } })}
      >
        <ToggleButton value="circle">{t('signature.shape.circle', 'Circle')}</ToggleButton>
        <ToggleButton value="square">{t('signature.shape.square', 'Square')}</ToggleButton>
        <ToggleButton value="rounded">{t('signature.shape.rounded', 'Rounded')}</ToggleButton>
      </RadioGroupInput>
      <RadioGroupInput
        label={t('signature.layout', 'Layout')}
        defaultValue={layout}
        onChange={(layout) => updateData({ ...data, props: { ...data.props, layout } })}
      >
        <ToggleButton value="horizontal">{t('signature.layout.horizontal', 'Horizontal')}</ToggleButton>
        <ToggleButton value="vertical">{t('signature.layout.vertical', 'Vertical')}</ToggleButton>
      </RadioGroupInput>
      <ColorInput
        label={t('signature.name-color', 'Name color')}
        defaultValue={nameColor}
        onChange={(nameColor) => updateData({ ...data, props: { ...data.props, nameColor } })}
      />
      <ColorInput
        label={t('style.text-color', 'Text color')}
        defaultValue={textColor}
        onChange={(textColor) => updateData({ ...data, props: { ...data.props, textColor } })}
      />
      <ColorInput
        label={t('signature.link-color', 'Link color')}
        defaultValue={linkColor}
        onChange={(linkColor) => updateData({ ...data, props: { ...data.props, linkColor } })}
      />
      <MultiStylePropertyPanel
        names={['backgroundColor', 'fontFamily', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
