import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AddOutlined,
  CheckOutlined,
  ContentCopyOutlined,
  DeleteOutlined,
  GridOnOutlined,
  SquareOutlined,
} from '@mui/icons-material';

import { useEmailEditor } from '../context';
import {
  setWorkspaceBackground,
  useDocument,
  usePersistenceEnabled,
  useWorkspaceBackground,
} from '@editor/editor-context';
import { t } from '@i18n';
import BaseSidebarPanel from './configuration-panel/input-panels/helpers/base-sidebar-panel';
import TemplateDownloadButton from './template-panel-download-button';

export interface TemplatePanelProps {
  loadTemplates?: () => Promise<any[]>;
  deleteTemplate?: (templateId: string) => void;
  copyTemplate?: (templateName: string, content: any) => void;
  renameTemplate?: (
    templateId: string,
    newSlug: string,
    opts?: { tags?: string[] },
  ) => void | Promise<void>;
}

export default function TemplatePanel({
  deleteTemplate,
  copyTemplate,
  renameTemplate,
}: TemplatePanelProps) {
  const {
    currentTemplateId,
    currentTemplateName,
    currentTemplateTags,
    setCurrentTemplate,
    setCurrentTemplateTags,
  } = useEmailEditor();
  const document = useDocument();
  const persistenceEnabled = usePersistenceEnabled();
  const workspaceBackground = useWorkspaceBackground();

  const handleDelete = () => {
    if (!currentTemplateId || !window.confirm(t('settings.delete-confirm', 'Are you sure you want to delete this template?'))) {
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
      window.alert(t('settings.copied', 'Template copied successfully!'));
    }
  };

  const workspaceToggle = (
    <BaseSidebarPanel title="Editor appearance">
      <Stack spacing={1}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {t('settings.workspace-background', 'Workspace background')}
        </Typography>
        <ToggleButtonGroup
          value={workspaceBackground}
          exclusive
          size="small"
          onChange={(_, v) => v && setWorkspaceBackground(v)}
        >
          <ToggleButton value="checkerboard" sx={{ textTransform: 'none', gap: 0.75 }}>
            <GridOnOutlined fontSize="small" />
            {t('settings.checkerboard', 'Checkerboard')}
          </ToggleButton>
          <ToggleButton value="solid" sx={{ textTransform: 'none', gap: 0.75 }}>
            <SquareOutlined fontSize="small" />
            {t('settings.solid', 'Solid')}
          </ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {t('settings.editor-only-hint', 'Editor-only — never reaches the rendered email.')}
        </Typography>
      </Stack>
    </BaseSidebarPanel>
  );

  if (!currentTemplateId) {
    return (
      <>
        <BaseSidebarPanel title="Template">{t('settings.no-template', 'No template selected')}</BaseSidebarPanel>
        {workspaceToggle}
      </>
    );
  }

  return (
    <>
      <BaseSidebarPanel title="Details">
        <DetailsEditor
          templateId={currentTemplateId}
          currentName={currentTemplateName ?? ''}
          currentTags={currentTemplateTags}
          canEdit={Boolean(renameTemplate)}
          onSave={async (name, tags) => {
            if (!renameTemplate) return;
            await renameTemplate(currentTemplateId, name, { tags });
            setCurrentTemplate(currentTemplateId, name);
            setCurrentTemplateTags(tags);
          }}
        />
      </BaseSidebarPanel>

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
                fontSize: '0.8rem',
              }}
            >
              {t('settings.save-disabled', 'Save functionality is disabled. To enable saving, provide the necessary callback functions.')}
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
                {t('settings.save-as-sample', 'Save as Sample Template')}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlined />}
                onClick={handleDelete}
                fullWidth
                disabled={!deleteTemplate}
              >
                {t('settings.delete', 'Delete Template')}
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
      {workspaceToggle}
    </>
  );
}

type DetailsEditorProps = {
  templateId: string;
  currentName: string;
  currentTags: string[];
  canEdit: boolean;
  onSave: (name: string, tags: string[]) => Promise<void> | void;
};

function DetailsEditor({ templateId, currentName, currentTags, canEdit, onSave }: DetailsEditorProps) {
  const [name, setName] = useState(currentName);
  const [tags, setTags] = useState<string[]>(currentTags);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Re-sync when the loaded template changes.
  useEffect(() => {
    setName(currentName);
  }, [templateId, currentName]);
  useEffect(() => {
    setTags(currentTags);
  }, [templateId, currentTags.join('')]); // eslint-disable-line react-hooks/exhaustive-deps

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTagInput('');
      return;
    }
    setTags([...tags, trimmed]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const dirty =
    name !== currentName ||
    tags.length !== currentTags.length ||
    tags.some((t, i) => t !== currentTags[i]);

  const handleSave = async () => {
    if (!canEdit || !dirty || !name.trim()) return;
    setSaving(true);
    try {
      await onSave(name.trim(), tags);
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1600);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        label={t('rename.name-label', 'Name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={!canEdit || saving}
        fullWidth
      />
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
          {t('rename.tags', 'Tags')}
        </Typography>
        {tags.length > 0 ? (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                onDelete={canEdit && !saving ? () => removeTag(tag) : undefined}
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1 }}>
            {t('rename.no-tags', 'No tags yet.')}
          </Typography>
        )}
        <TextField
          size="small"
          fullWidth
          placeholder={t('rename.add-tag', 'Add a tag')}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          disabled={!canEdit || saving}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag();
            } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
              e.preventDefault();
              removeTag(tags[tags.length - 1]);
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={addTag}
                  disabled={!canEdit || saving || !tagInput.trim()}
                  startIcon={<AddOutlined fontSize="small" />}
                  sx={{ textTransform: 'none' }}
                >
                  {t('common.add', 'Add')}
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Tooltip title={canEdit ? '' : t('settings.no-rename-cb', 'Wire a renameTemplate callback to enable editing from here')} placement="top">
        <span>
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={handleSave}
            disabled={!canEdit || saving || !dirty || !name.trim()}
            startIcon={justSaved ? <CheckOutlined fontSize="small" /> : null}
          >
            {saving ? t('common.saving', 'Saving…') : justSaved ? t('settings.saved', 'Saved') : t('settings.save-details', 'Save details')}
          </Button>
        </span>
      </Tooltip>
    </Stack>
  );
}
