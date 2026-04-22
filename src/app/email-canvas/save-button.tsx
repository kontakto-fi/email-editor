import React, { useState } from 'react';

import { SaveOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import { useEmailEditor } from '../context';
import { useSnackbar } from './snackbar-provider';
import SaveTemplateDialog from './save-template-dialog';
import { useDocument } from '@editor/editor-context';
import { TemplateListItem } from '../index';
import { buildSavePayload, SavePayload } from '../save-payload';

interface SaveButtonProps {
  loadTemplates?: () => Promise<TemplateListItem[]>;
  saveAs?: (templateName: string, payload: SavePayload) => Promise<{ id: string; slug: string }>;
}

export default function SaveButton({ loadTemplates, saveAs }: SaveButtonProps) {
  const { saveTemplate, currentTemplateId, currentTemplateKind, setCurrentTemplate } = useEmailEditor();
  const { showMessage } = useSnackbar();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const document = useDocument();

  const isSample = currentTemplateKind === 'sample';

  const handleSave = async () => {
    try {
      // Samples are read-only: route Save to Save-As so the user creates a new template.
      // Also fall through to Save-As when nothing is selected yet.
      if (!currentTemplateId || isSample) {
        setSaveDialogOpen(true);
        return;
      }

      saveTemplate();
      showMessage('Template saved successfully!');

      if (loadTemplates) {
        await loadTemplates();
      }
    } catch (error) {
      console.error('Error saving template:', error);
      showMessage('Error saving template');
    }
  };

  const handleSaveAs = async (templateName: string): Promise<boolean> => {
    try {
      if (saveAs) {
        const { id: templateId, slug } = await saveAs(templateName, buildSavePayload(document));

        setCurrentTemplate(templateId, slug, 'template');

        if (loadTemplates) {
          await loadTemplates();
        }

        showMessage('Template saved successfully!');
        setSaveDialogOpen(false);

        window.location.hash = `#template/${templateId}`;

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving template:', error);
      showMessage('Error saving template');
      return false;
    }
  };

  return (
    <>
      <IconButton onClick={handleSave}
        sx={{
          backgroundColor: 'grey.100',
          '&:hover': {
            backgroundColor: 'grey.200',
          },
        }}
      >
        <Tooltip title={isSample ? 'Save as new template' : 'Save template'}>
          <SaveOutlined fontSize="small" />
        </Tooltip>
      </IconButton>

      <SaveTemplateDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveAs}
        defaultName={isSample ? 'New Template' : 'New Template'}
      />
    </>
  );
}