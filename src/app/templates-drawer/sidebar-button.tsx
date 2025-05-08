import React from 'react';
import { Button, SxProps, Theme } from '@mui/material';
import { resetDocument } from '@editor/editor-context';
import { useEmailEditor } from '../context';
import { TEditorConfiguration } from '@editor/core';

export interface SidebarButtonProps {
  templateId: string;
  children: JSX.Element | string;
  templateLoader: () => Promise<TEditorConfiguration | null>;
  sx?: SxProps<Theme>;
}

export default function SidebarButton({ 
  templateId, 
  children,
  templateLoader,
  sx
}: SidebarButtonProps) {
  const { setCurrentTemplate } = useEmailEditor();
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      const template = await templateLoader();
      if (template) {
        resetDocument(template);
        setCurrentTemplate(templateId, null);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };
  
  return (
    <Button size="small" onClick={handleClick} sx={sx}>
      {children}
    </Button>
  );
}
