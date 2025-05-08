import React, { useState } from 'react';

import { SaveOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import { useEmailEditor } from '../context';
import { useSnackbar } from './snackbar-provider';
import SaveTemplateDialog from './save-template-dialog';
import { useDocument } from '@editor/editor-context';

interface SaveButtonProps {
  loadTemplates?: () => Promise<any>;
}

export default function SaveButton({ loadTemplates }: SaveButtonProps) {
  const { saveTemplate, currentTemplateId, setCurrentTemplate } = useEmailEditor();
  const { showMessage } = useSnackbar();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const document = useDocument();

  const handleSave = async () => {
    try {
      // If it's a sample template or no template is selected, show the save dialog
      if (!currentTemplateId || currentTemplateId === 'welcome' || currentTemplateId.startsWith('sample/')) {
        setSaveDialogOpen(true);
        return;
      }

      // Otherwise, save the template directly
      saveTemplate();
      showMessage('Template saved successfully!');

      // Refresh templates list
      if (loadTemplates) {
        await loadTemplates();
      }
    } catch (error) {
      console.error('Error saving template:', error);
      showMessage('Error saving template');
    }
  };

  const handleSaveAs = async (templateName: string) => {
    try {
      // Create new template ID
      const templateId = `template-${Date.now()}`;

      // Get existing templates
      const existingTemplatesJSON = localStorage.getItem('savedTemplates');
      const existingTemplates = existingTemplatesJSON ? JSON.parse(existingTemplatesJSON) : [];

      // Create new template
      const newTemplate = {
        id: templateId,
        name: templateName,
        content: document,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to templates
      existingTemplates.push(newTemplate);
      localStorage.setItem('savedTemplates', JSON.stringify(existingTemplates));

      // Update current template info
      localStorage.setItem('lastEditedTemplate', JSON.stringify(document));
      localStorage.setItem('lastEditedTemplateId', templateId);
      localStorage.setItem('lastEditedTemplateName', templateName);

      // Update context
      setCurrentTemplate(templateId, templateName);

      // Refresh templates list
      if (loadTemplates) {
        const updatedTemplates = await loadTemplates();
        // Dispatch a custom event to notify about template list update
        window.dispatchEvent(new CustomEvent('templateListUpdated', { detail: updatedTemplates }));
      }

      showMessage('Template saved successfully!');
      setSaveDialogOpen(false);

      // Update URL
      window.location.hash = `#template/${templateId}`;
    } catch (error) {
      console.error('Error saving template:', error);
      showMessage('Error saving template');
    }
  };

  return (
    <>
      <IconButton onClick={handleSave}>
        <Tooltip title="Save template">
          <SaveOutlined fontSize="small" />
        </Tooltip>
      </IconButton>

      <SaveTemplateDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveAs}
        defaultName={currentTemplateId === 'welcome' ? 'Welcome Template' : 'New Template'}
      />
    </>
  );
} 