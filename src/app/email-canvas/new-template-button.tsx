import React, { useState } from 'react';
import { Add as AddIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import { useDocument, resetDocument } from '@editor/editor-context';
import { useSnackbar } from './snackbar-provider';
import SaveTemplateDialog from './save-template-dialog';
import EMPTY_EMAIL_MESSAGE from '@sample/empty-email-message';
import { useEmailEditor } from '../context';
import { TemplateListItem } from '../index';
import { buildSavePayload, SavePayload } from '../save-payload';

interface NewTemplateButtonProps {
  loadTemplates?: () => Promise<TemplateListItem[]>;
  saveAs?: (templateName: string, payload: SavePayload) => Promise<{ id: string; slug: string }>;
}

export default function NewTemplateButton({ loadTemplates, saveAs }: NewTemplateButtonProps) {
  const { setCurrentTemplate, loadTemplate } = useEmailEditor();
  const { showMessage } = useSnackbar();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [nameError, setNameError] = useState<string | null>(null);

  // Load templates when component mounts or when needed for validation
  const fetchTemplates = async () => {
    if (loadTemplates) {
      try {
        const result = await loadTemplates();
        setTemplates(result);
        return result;
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    }
    return [];
  };

  const handleNewTemplate = async () => {
    // Fetch latest templates for validation
    await fetchTemplates();
    setNameError(null);
    setSaveDialogOpen(true);
  };

  const validateTemplateName = (name: string): boolean => {
    // Check if slug already exists
    const nameExists = templates.some(template =>
      template.slug.toLowerCase() === name.toLowerCase()
    );

    if (nameExists) {
      setNameError('A template with this name already exists');
      return false;
    }

    setNameError(null);
    return true;
  };

  const handleNameChange = () => {
    // Reset error state when name changes
    setNameError(null);
  };

  const handleCreateTemplate = async (templateName: string) => {
    // Validate template name first - this needs to be done here as well
    // because the dialog won't close if validation fails
    if (!validateTemplateName(templateName)) {
      return false; // Return false to indicate validation failed
    }

    try {
      if (saveAs) {
        const { id: templateId, slug } = await saveAs(templateName, buildSavePayload(EMPTY_EMAIL_MESSAGE));

        resetDocument(EMPTY_EMAIL_MESSAGE);

        setCurrentTemplate(templateId, slug, 'template');
        loadTemplate(EMPTY_EMAIL_MESSAGE, templateId, slug, 'template');

        if (loadTemplates) {
          await loadTemplates();
        }

        showMessage('New template created!');

        window.location.hash = `#template/${templateId}`;

        return true;
      }
    } catch (error) {
      console.error('Error creating template:', error);
      showMessage('Error creating template');
    }
    return false;
  };

  return (
    <>
    <IconButton
      onClick={handleNewTemplate}
      sx={{
        backgroundColor: 'grey.100',
        '&:hover': {
          backgroundColor: 'grey.200',
        },
      }}
    >
        <Tooltip title="New template">
          <AddIcon fontSize="small" />
        </Tooltip>
      </IconButton>

      <SaveTemplateDialog
        open={saveDialogOpen}
        onClose={() => {
          setSaveDialogOpen(false);
          setNameError(null);
        }}
        onSave={handleCreateTemplate}
        onNameChange={handleNameChange}
        defaultName="New Template"
        error={nameError}
      />
    </>
  );
} 