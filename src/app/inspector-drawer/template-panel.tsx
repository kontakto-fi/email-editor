import React from 'react';
import { Button, Stack } from '@mui/material';
import { DeleteOutlined, ContentCopyOutlined } from '@mui/icons-material';

import { useEmailEditor } from '../context';
import { useDocument } from '@editor/editor-context';
import { StoredTemplate } from '../context';
import BaseSidebarPanel from './configuration-panel/input-panels/helpers/base-sidebar-panel';

export default function TemplatePanel() {
  const { currentTemplateId, currentTemplateName } = useEmailEditor();
  const document = useDocument();

  const handleDelete = () => {
    if (!currentTemplateId || !window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    // Get existing templates
    const existingTemplatesJSON = localStorage.getItem('savedTemplates');
    if (!existingTemplatesJSON) return;

    const existingTemplates: StoredTemplate[] = JSON.parse(existingTemplatesJSON);
    const updatedTemplates = existingTemplates.filter((template: StoredTemplate) => template.id !== currentTemplateId);
    
    // Update localStorage
    localStorage.setItem('savedTemplates', JSON.stringify(updatedTemplates));
    localStorage.removeItem('lastEditedTemplateId');
    localStorage.removeItem('lastEditedTemplateName');

    // Refresh the page to load a new template
    window.location.hash = '#';
    window.location.reload();
  };

  const handleCopyToSamples = () => {
    if (!currentTemplateName || !document) return;

    // Get existing templates
    const existingTemplatesJSON = localStorage.getItem('savedTemplates');
    const existingTemplates: StoredTemplate[] = existingTemplatesJSON ? JSON.parse(existingTemplatesJSON) : [];

    // Create new template
    const templateId = `template-${Date.now()}`;
    const newTemplate: StoredTemplate = {
      id: templateId,
      name: `${currentTemplateName} (Copy)`,
      content: document,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to templates
    existingTemplates.push(newTemplate);
    localStorage.setItem('savedTemplates', JSON.stringify(existingTemplates));

    // Show confirmation
    window.alert('Template copied successfully!');
  };

  if (!currentTemplateId) {
    return <BaseSidebarPanel title="Template">No template selected</BaseSidebarPanel>;
  }

  return (
    <BaseSidebarPanel title="Template">
      <Stack spacing={2}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ContentCopyOutlined />}
          onClick={handleCopyToSamples}
          fullWidth
        >
          Save as Sample Template
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteOutlined />}
          onClick={handleDelete}
          fullWidth
        >
          Delete Template
        </Button>
      </Stack>
    </BaseSidebarPanel>
  );
}
