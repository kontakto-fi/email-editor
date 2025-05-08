import React from 'react';

import { Button, SxProps, Theme } from '@mui/material';

import { resetDocument } from '@editor/editor-context';
import getConfiguration from '@configuration';
import { useEmailEditor } from '../context';

export interface SidebarButtonProps {
  href: string;
  children: JSX.Element | string;
  templateLoader?: () => Promise<any>;
  sx?: SxProps<Theme>;
}

export default function SidebarButton({ 
  href, 
  children,
  templateLoader,
  sx
}: SidebarButtonProps) {
  const { setCurrentTemplate } = useEmailEditor();
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default hash navigation
    
    let config;
    
    if (templateLoader) {
      // Use the provided template loader
      config = await templateLoader();
    } else {
      // Fall back to the default configuration loader
      config = await getConfiguration(href);
    }
    
    if (config) {
      resetDocument(config);
      window.location.hash = href; // Update the URL hash manually
      
      // Extract template ID from href
      const templateId = href.startsWith('#template/') 
        ? href.replace('#template/', '')
        : href.startsWith('#sample/') 
          ? href.replace('#sample/', '')
          : null;
          
      // Update current template in context
      setCurrentTemplate(templateId, null);
    }
  };
  
  return (
    <Button size="small" href={href} onClick={handleClick} sx={sx}>
      {children}
    </Button>
  );
}
