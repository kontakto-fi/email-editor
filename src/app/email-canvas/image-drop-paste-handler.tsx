import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { CloudUploadOutlined } from '@mui/icons-material';
import {
  getDocument,
  setDocument,
  setSelectedBlockId,
} from '@editor/editor-context';
import { useImageCallbacks, type UploadedImage } from '../image-context';

type Props = {
  enabled: boolean;
  children: React.ReactNode;
};

function generateId() {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function buildImageBlock(uploaded: UploadedImage) {
  return {
    type: 'Image' as const,
    data: {
      props: {
        url: uploaded.url,
        width: uploaded.width ?? null,
        height: uploaded.height ?? null,
        alt: uploaded.alt ?? '',
        contentAlignment: 'middle' as const,
      },
      style: { padding: { top: 16, bottom: 16, left: 24, right: 24 } },
    },
  };
}

function appendImageBlock(uploaded: UploadedImage) {
  const doc = getDocument();
  const root: any = doc.root;
  if (!root || root.type !== 'EmailLayout') return;
  const id = generateId();
  const childrenIds = [...((root.data.childrenIds as string[] | null) ?? []), id];
  setDocument({
    [id]: buildImageBlock(uploaded),
    root: { ...root, data: { ...root.data, childrenIds } },
  } as any);
  setSelectedBlockId(id);
}

function findImageFile(items: FileList | DataTransferItemList | null | undefined): File | null {
  if (!items) return null;
  const fileList = items instanceof FileList ? Array.from(items) : Array.from(items);
  for (const item of fileList) {
    const file = item instanceof File ? item : (item as DataTransferItem).getAsFile?.();
    if (file && file.type.startsWith('image/')) return file;
  }
  return null;
}

/**
 * Listens for image-file drops and clipboard pastes on the canvas wrapper.
 * Calls `uploadImage` then appends a new Image block at the root. Renders a
 * drop overlay while a file is dragged over. No-op when uploadImage is not
 * provided or `enabled` is false.
 */
export default function ImageDropPasteHandler({ enabled, children }: Props) {
  const { uploadImage } = useImageCallbacks();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const active = enabled && Boolean(uploadImage);

  useEffect(() => {
    if (!active || !uploadImage) return;
    const handlePaste = async (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return;
      const file = findImageFile(e.clipboardData?.files);
      if (!file) return;
      e.preventDefault();
      setUploading(true);
      try {
        const uploaded = await uploadImage(file);
        appendImageBlock(uploaded);
      } catch {
        // silent: surfaced via console; consumer can show their own toast
      } finally {
        setUploading(false);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [active, uploadImage]);

  if (!active) return <>{children}</>;

  const onDragEnter = (e: React.DragEvent) => {
    if (!Array.from(e.dataTransfer?.items ?? []).some((i) => i.kind === 'file')) return;
    dragDepth.current += 1;
    setDragging(true);
  };
  const onDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };
  const onDragOver = (e: React.DragEvent) => {
    if (!Array.from(e.dataTransfer?.items ?? []).some((i) => i.kind === 'file')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  const onDrop = async (e: React.DragEvent) => {
    dragDepth.current = 0;
    setDragging(false);
    const file = findImageFile(e.dataTransfer?.files);
    if (!file || !uploadImage) return;
    e.preventDefault();
    setUploading(true);
    try {
      const uploaded = await uploadImage(file);
      appendImageBlock(uploaded);
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      ref={wrapperRef}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      sx={{ position: 'relative' }}
    >
      {children}
      {(dragging || uploading) && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(33, 150, 243, 0.06)',
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: 12,
            color: 'primary.dark',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, fontSize: 14 }}>
            <CloudUploadOutlined />
            {uploading ? 'Uploading…' : 'Drop image to insert'}
          </Box>
        </Box>
      )}
    </Box>
  );
}
