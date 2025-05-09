import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { DeleteOutlined, ContentCopyOutlined } from '@mui/icons-material';

import { useEmailEditor } from '../context';
import { useDocument, usePersistenceEnabled } from '@editor/editor-context';
import BaseSidebarPanel from './configuration-panel/input-panels/helpers/base-sidebar-panel';
import TemplateDownloadButton from './template-panel-download-button';

export interface TemplatePanelProps {
  loadTemplates?: () => Promise<any[]>;
  deleteTemplate?: (templateId: string) => void;
  copyTemplate?: (templateName: string, content: any) => void;
}

export default function TemplatePanel({ deleteTemplate, copyTemplate }: TemplatePanelProps) {
  const { currentTemplateId, currentTemplateName } = useEmailEditor();
  const document = useDocument();
  const persistenceEnabled = usePersistenceEnabled();

  const handleDelete = () => {
    if (!currentTemplateId || !window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    if (deleteTemplate) {
      // Use the provided deleteTemplate function
      deleteTemplate(currentTemplateId);
      
      // Refresh the page to load a new template
      window.location.hash = '';
      window.location.reload();
    }
  };

  const handleCopyToSamples = () => {
    if (!currentTemplateName || !document) return;

    if (copyTemplate) {
      // Use the provided copyTemplate function
      copyTemplate(`${currentTemplateName} (Copy)`, document);
      
      // Show confirmation
      window.alert('Template copied successfully!');
    }
  };

  if (!currentTemplateId) {
    return <BaseSidebarPanel title="Template">No template selected</BaseSidebarPanel>;
  }

  return (
    <>
      <BaseSidebarPanel title="Template">
        <Stack spacing={2}>
          {!persistenceEnabled && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                padding: 1, 
                bgcolor: 'rgba(0,0,0,0.04)', 
                borderRadius: 1,
                fontSize: '0.8rem' 
              }}
            >
              Save functionality is disabled. To enable saving, provide the necessary callback functions.
            </Typography>
          )}
          {persistenceEnabled && (
            <>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ContentCopyOutlined />}
                onClick={handleCopyToSamples}
                fullWidth
                disabled={!copyTemplate}
              >
                Save as Sample Template
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlined />}
                onClick={handleDelete}
                fullWidth
                disabled={!deleteTemplate}
              >
                Delete Template
              </Button>
            </>
          )}
        </Stack>
      </BaseSidebarPanel>
      
      {persistenceEnabled && (
        <BaseSidebarPanel title="Export">
          <Stack spacing={2}>
            <TemplateDownloadButton />
          </Stack>
        </BaseSidebarPanel>
      )}
    </>
  );
}
