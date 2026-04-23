import React, { useRef, useState } from 'react';

import {
  CloudUploadOutlined,
  CollectionsOutlined,
  ErrorOutlineOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignCenterOutlined,
  VerticalAlignTopOutlined,
} from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Stack, ToggleButton, Tooltip } from '@mui/material';
import { ImageProps, ImagePropsSchema } from '@blocks';
import { t } from '@i18n';

import BaseSidebarPanel from './helpers/base-sidebar-panel';
import RadioGroupInput from './helpers/inputs/radio-group-input';
import TextDimensionInput from './helpers/inputs/text-dimension-input';
import TextInput from './helpers/inputs/text-input';
import MultiStylePropertyPanel from './helpers/style-inputs/multi-style-property-panel';
import ImageLibraryDialog from './image-library-dialog';
import { useImageCallbacks, type LibraryImage, type UploadedImage } from '../../../image-context';

type ImageSidebarPanelProps = {
  data: ImageProps;
  setData: (v: ImageProps) => void;
};

function isHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^http:\/\//i.test(value.trim());
}

export default function ImageSidebarPanel({ data, setData }: ImageSidebarPanelProps) {
  const [, setErrors] = useState<Zod.ZodError | null>(null);
  const { uploadImage, loadImages } = useImageCallbacks();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const updateData = (d: unknown) => {
    const res = ImagePropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  const applyUploadedImage = (uploaded: UploadedImage | LibraryImage) => {
    updateData({
      ...data,
      props: {
        ...data.props,
        url: uploaded.url,
        width: uploaded.width ?? data.props?.width ?? null,
        height: uploaded.height ?? data.props?.height ?? null,
        alt: uploaded.alt ?? data.props?.alt ?? '',
      },
    });
  };

  const handleFile = async (file: File) => {
    if (!uploadImage) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded = await uploadImage(file);
      applyUploadedImage(uploaded);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const url = data.props?.url ?? '';
  const showHttpWarning = isHttpUrl(url);

  return (
    <BaseSidebarPanel title="Image block">
      {(uploadImage || loadImages) && (
        <Stack direction="row" spacing={1}>
          {uploadImage && (
            <>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                startIcon={uploading ? <CircularProgress size={14} /> : <CloudUploadOutlined fontSize="small" />}
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? t('image.uploading', 'Uploading…') : t('image.upload', 'Upload')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) await handleFile(file);
                }}
              />
            </>
          )}
          {loadImages && (
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<CollectionsOutlined fontSize="small" />}
              onClick={() => setLibraryOpen(true)}
            >
              {t('image.library', 'Library')}
            </Button>
          )}
        </Stack>
      )}

      {uploadError && (
        <Alert severity="error" onClose={() => setUploadError(null)} sx={{ mt: 1 }}>
          {uploadError}
        </Alert>
      )}

      <TextInput
        label={t('image.source-url', 'Source URL')}
        defaultValue={url}
        onChange={(v) => {
          const next = v.trim().length === 0 ? null : v.trim();
          updateData({ ...data, props: { ...data.props, url: next } });
        }}
      />
      {showHttpWarning && (
        <Box sx={{ mt: -1, mb: 1, display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
          <ErrorOutlineOutlined fontSize="small" sx={{ color: 'warning.main', mt: '2px' }} />
          <Box sx={{ fontSize: 12, color: 'warning.dark' }}>
            {t('image.http-warning', 'Non-HTTPS URL: Gmail and other clients strip mixed content. Use https:// for reliable delivery.')}
          </Box>
        </Box>
      )}

      <TextInput
        label={t('image.alt-text', 'Alt text')}
        defaultValue={data.props?.alt ?? ''}
        onChange={(alt) => updateData({ ...data, props: { ...data.props, alt } })}
      />
      <TextInput
        label={t('image.link-href', 'Click through URL')}
        defaultValue={data.props?.linkHref ?? ''}
        onChange={(v) => {
          const linkHref = v.trim().length === 0 ? null : v.trim();
          updateData({ ...data, props: { ...data.props, linkHref } });
        }}
      />
      <Stack direction="row" spacing={2}>
        <TextDimensionInput
          label={t('field.width', 'Width')}
          defaultValue={data.props?.width}
          onChange={(width) => updateData({ ...data, props: { ...data.props, width } })}
        />
        <TextDimensionInput
          label={t('field.height', 'Height')}
          defaultValue={data.props?.height}
          onChange={(height) => updateData({ ...data, props: { ...data.props, height } })}
        />
      </Stack>

      <RadioGroupInput
        label={t('style.alignment', 'Alignment')}
        defaultValue={data.props?.contentAlignment ?? 'middle'}
        onChange={(contentAlignment) => updateData({ ...data, props: { ...data.props, contentAlignment } })}
      >
        <ToggleButton value="top">
          <VerticalAlignTopOutlined fontSize="small" />
        </ToggleButton>
        <ToggleButton value="middle">
          <VerticalAlignCenterOutlined fontSize="small" />
        </ToggleButton>
        <ToggleButton value="bottom">
          <VerticalAlignBottomOutlined fontSize="small" />
        </ToggleButton>
      </RadioGroupInput>

      <MultiStylePropertyPanel
        names={['backgroundColor', 'textAlign', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />

      {loadImages && (
        <ImageLibraryDialog
          open={libraryOpen}
          onClose={() => setLibraryOpen(false)}
          onPick={(image) => {
            applyUploadedImage(image);
            setLibraryOpen(false);
          }}
        />
      )}
    </BaseSidebarPanel>
  );
}
