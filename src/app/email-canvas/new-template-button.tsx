import React, { useState } from 'react';
import { Add as AddIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import { useDocument, resetDocument } from '@editor/editor-context';
import { useSnackbar } from './snackbar-provider';
import SaveTemplateDialog from './save-template-dialog';
import EMPTY_EMAIL_MESSAGE from '@sample/empty-email-message';
import { useEmailEditor } from '../context';

interface NewTemplateButtonProps {
  loadTemplates?: () => Promise<any>;
  saveAs?: (templateName: string, content: any) => Promise<{id: string, name: string}>;
}

export default function NewTemplateButton({ loadTemplates, saveAs }: NewTemplateButtonProps) {
  const { setCurrentTemplate, loadTemplate } = useEmailEditor();
  const { showMessage } = useSnackbar();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<{id: string, name: string}[]>([]);
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
    // Check if name already exists
    const nameExists = templates.some(template => 
      template.name.toLowerCase() === name.toLowerCase()
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
        // Use provided saveAs function with the empty template
        const { id: templateId, name } = await saveAs(templateName, EMPTY_EMAIL_MESSAGE);
        
        // Actually load the empty template into the editor
        resetDocument(EMPTY_EMAIL_MESSAGE);
        
        // Update context
        setCurrentTemplate(templateId, name);
        loadTemplate(EMPTY_EMAIL_MESSAGE, templateId, name);
        
        // Refresh templates list
        if (loadTemplates) {
          await loadTemplates();
        }
        
        // Show success message
        showMessage('New template created!');
        
        // Update URL
        window.location.hash = `#template/${templateId}`;
        
        return true; // Return true to indicate success
      }
    } catch (error) {
      console.error('Error creating template:', error);
      showMessage('Error creating template');
    }
    return false; // Return false if there was an error
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