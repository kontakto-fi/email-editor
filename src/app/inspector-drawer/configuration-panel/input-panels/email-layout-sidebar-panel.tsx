import React, { useState } from 'react';

import { RoundedCornerOutlined } from '@mui/icons-material';

import EmailLayoutPropsSchema, {
  EmailLayoutProps,
} from '@editor/blocks/email-layout/email-layout-props-schema';
import { t } from '@i18n';

import BaseSidebarPanel from './helpers/base-sidebar-panel';
import BooleanInput from './helpers/inputs/boolean-input';
import ColorInput, { NullableColorInput } from './helpers/inputs/color-input';
import { NullableFontFamily } from './helpers/inputs/font-family';
import SliderInput from './helpers/inputs/slider-input';

type EmailLayoutSidebarFieldsProps = {
  data: EmailLayoutProps;
  setData: (v: EmailLayoutProps) => void;
};
export default function EmailLayoutSidebarFields({ data, setData }: EmailLayoutSidebarFieldsProps) {
  const [, setErrors] = useState<Zod.ZodError | null>(null);

  const updateData = (d: unknown) => {
    const res = EmailLayoutPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  const backdropDisabled = data.backdropDisabled ?? false;

  return (
    <BaseSidebarPanel title="Global">
      <BooleanInput
        label={t('global.disable-backdrop', 'Disable backdrop')}
        defaultValue={backdropDisabled}
        onChange={(backdropDisabled) => updateData({ ...data, backdropDisabled })}
      />
      {!backdropDisabled && (
        <>
          <ColorInput
            label={t('global.backdrop-color', 'Backdrop color')}
            defaultValue={data.backdropColor ?? '#F5F5F5'}
            onChange={(backdropColor) => updateData({ ...data, backdropColor })}
          />
          <ColorInput
            label={t('global.canvas-color', 'Canvas color')}
            defaultValue={data.canvasColor ?? '#FFFFFF'}
            onChange={(canvasColor) => updateData({ ...data, canvasColor })}
          />
          <NullableColorInput
            label={t('global.canvas-border-color', 'Canvas border color')}
            defaultValue={data.borderColor ?? null}
            onChange={(borderColor) => updateData({ ...data, borderColor })}
          />
          <SliderInput
            iconLabel={<RoundedCornerOutlined />}
            units="px"
            step={4}
            marks
            min={0}
            max={48}
            label={t('global.canvas-border-radius', 'Canvas border radius')}
            defaultValue={data.borderRadius ?? 0}
            onChange={(borderRadius) => updateData({ ...data, borderRadius })}
          />
        </>
      )}
      <NullableFontFamily
        label={t('style.font-family', 'Font family')}
        defaultValue="MODERN_SANS"
        onChange={(fontFamily) => updateData({ ...data, fontFamily })}
      />
      <ColorInput
        label={t('style.text-color', 'Text color')}
        defaultValue={data.textColor ?? '#262626'}
        onChange={(textColor) => updateData({ ...data, textColor })}
      />
    </BaseSidebarPanel>
  );
}
