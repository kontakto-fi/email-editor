import React, { useState } from 'react';

import { OtpProps, OtpPropsDefaults, OtpPropsSchema } from '@blocks/otp';
import { t } from '@i18n';

import BaseSidebarPanel from './helpers/base-sidebar-panel';
import TextInput from './helpers/inputs/text-input';
import MultiStylePropertyPanel from './helpers/style-inputs/multi-style-property-panel';

type OtpSidebarPanelProps = {
  data: OtpProps;
  setData: (v: OtpProps) => void;
};
export default function OtpSidebarPanel({ data, setData }: OtpSidebarPanelProps) {
  const [, setErrors] = useState<Zod.ZodError | null>(null);

  const updateData = (d: unknown) => {
    const res = OtpPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  return (
    <BaseSidebarPanel title={t('otp.title', 'OTP / Code block')}>
      <TextInput
        label={t('otp.code', 'Code')}
        rows={1}
        defaultValue={data.props?.code ?? OtpPropsDefaults.code}
        onChange={(code) => updateData({ ...data, props: { ...data.props, code } })}
      />
      <MultiStylePropertyPanel
        names={[
          'color',
          'backgroundColor',
          'borderColor',
          'borderRadius',
          'fontFamily',
          'fontSize',
          'fontWeight',
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
