import React, { useState } from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import { AddOutlined, SaveOutlined, SaveAsOutlined } from '@mui/icons-material';
import { resetDocument, useDocument } from '@editor/editor-context';
import { t } from '@i18n';
import { useEmailEditor } from '../context';
import { useSnackbar } from './snackbar-provider';
import { buildSavePayload, type SavePayload } from '../save-payload';
import SaveTemplateDialog from './save-template-dialog';
import EMPTY_EMAIL_MESSAGE from '@sample/empty-email-message';
import type { TemplateListItem } from '../index';

type SaveBarProps = {
  loadTemplates?: () => Promise<TemplateListItem[]>;
  saveAs?: (templateName: string, payload: SavePayload) => Promise<{ id: string; slug: string }>;
};

type DialogMode = null | 'save-as' | 'new-blank';

export default function SaveBar({ loadTemplates, saveAs }: SaveBarProps) {
  const {
    saveTemplate,
    currentTemplateId,
    currentTemplateName,
    currentTemplateKind,
    setCurrentTemplate,
    loadTemplate: ctxLoadTemplate,
  } = useEmailEditor();
  const { showMessage } = useSnackbar();
  const document = useDocument();
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const hasOpenRow = Boolean(currentTemplateId);
  const isSample = currentTemplateKind === 'sample';
  const primaryLabel = hasOpenRow ? t('savebar.save', 'Save') : t('savebar.save-as-new', 'Save as new…');

  const handlePrimary = async () => {
    try {
      if (!hasOpenRow) {
        setNameError(null);
        setDialogMode('save-as');
        return;
      }
      saveTemplate();
      showMessage(isSample ? t('savebar.sample-saved', 'Sample saved') : t('savebar.template-saved', 'Template saved'));
      if (loadTemplates) await loadTemplates();
    } catch (e) {
      console.error('Error saving:', e);
      showMessage(t('savebar.error-saving', 'Error saving'));
    }
  };

  const handleSaveAs = async (name: string): Promise<boolean> => {
    if (!saveAs) return false;
    try {
      const starterContent = dialogMode === 'new-blank' ? EMPTY_EMAIL_MESSAGE : document;
      const { id, slug } = await saveAs(name, buildSavePayload(starterContent));
      resetDocument(starterContent);
      setCurrentTemplate(id, slug, 'template');
      ctxLoadTemplate(starterContent, id, slug, 'template');
      if (loadTemplates) await loadTemplates();
      showMessage(
        dialogMode === 'new-blank'
          ? t('savebar.new-template-created', 'New template created')
          : t('savebar.template-saved', 'Template saved')
      );
      window.location.hash = `#template/${id}`;
      return true;
    } catch (e) {
      console.error('Error in saveAs:', e);
      showMessage(t('savebar.error-saving', 'Error saving'));
      return false;
    }
  };

  return (
    <>
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 2,
          pb: 3,
        }}
      >
        <Box
          sx={{
            pointerEvents: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.25,
            px: 2,
            py: 1.25,
            backgroundColor: 'background.paper',
            borderRadius: 999,
            boxShadow:
              '0 2px 6px rgba(33, 36, 67, 0.06), 0 16px 40px rgba(33, 36, 67, 0.14)',
          }}
        >
          {hasOpenRow && currentTemplateName && (
            <Box
              sx={{
                pl: 1,
                pr: 1,
                fontSize: 14,
                color: 'text.secondary',
                maxWidth: 220,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={currentTemplateName}
            >
              {isSample ? `${t('savebar.sample-prefix', 'Sample')} · ` : ''}
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {currentTemplateName}
              </Box>
            </Box>
          )}
          <Tooltip title={
            hasOpenRow
              ? (isSample
                  ? t('savebar.save-changes-to-sample', 'Save changes to this sample')
                  : t('savebar.save-changes', 'Save changes'))
              : t('savebar.save-as-new-template', 'Save as a new template')
          }>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveOutlined />}
              onClick={handlePrimary}
              sx={{ borderRadius: 999, textTransform: 'none', px: 2.5, fontSize: 15, fontWeight: 600 }}
            >
              {primaryLabel}
            </Button>
          </Tooltip>
          {hasOpenRow && saveAs && (
            <Tooltip title={t('savebar.save-as-new-template', 'Save as a new template')}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<SaveAsOutlined />}
                onClick={() => {
                  setNameError(null);
                  setDialogMode('save-as');
                }}
                sx={{ borderRadius: 999, textTransform: 'none', px: 2, fontSize: 14 }}
              >
                {t('savebar.save-as', 'Save as…')}
              </Button>
            </Tooltip>
          )}
          {saveAs && (
            <Tooltip title={t('savebar.start-fresh', 'Start a fresh template')}>
              <Button
                variant="text"
                size="large"
                startIcon={<AddOutlined />}
                onClick={() => {
                  setNameError(null);
                  setDialogMode('new-blank');
                }}
                sx={{ borderRadius: 999, textTransform: 'none', px: 2, fontSize: 14, color: 'text.secondary' }}
              >
                {t('savebar.new', 'New')}
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      <SaveTemplateDialog
        open={dialogMode !== null}
        onClose={() => {
          setDialogMode(null);
          setNameError(null);
        }}
        onSave={handleSaveAs}
        onNameChange={() => setNameError(null)}
        defaultName={
          dialogMode === 'new-blank'
            ? 'New Template'
            : currentTemplateName
              ? `${currentTemplateName} (Copy)`
              : 'New Template'
        }
        error={nameError}
      />
    </>
  );
}
