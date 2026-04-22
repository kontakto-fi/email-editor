import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AddOutlined,
  SearchOutlined,
} from '@mui/icons-material';
import { useSamplesDrawerOpen, resetDocument } from '@editor/editor-context';
import { TemplateKind, TemplateListItem } from '../index';
import { TEditorConfiguration } from '@editor/core';
import { useEmailEditor } from '../context';
import { useSnackbar } from '../email-canvas/snackbar-provider';
import { buildSavePayload, SavePayload } from '../save-payload';
import TemplateRow from './template-row';
import RenameDialog from './rename-dialog';
import SaveTemplateDialog from '../email-canvas/save-template-dialog';
import EMPTY_EMAIL_MESSAGE from '@sample/empty-email-message';

export const SAMPLES_DRAWER_WIDTH = 320;

// Empty template definition that will always be available
const EMPTY_TEMPLATE: TemplateListItem = {
  id: 'empty-email',
  slug: 'Empty email',
  kind: 'sample',
  description: 'A blank email template to start from scratch',
};

type SortKey = 'updatedAt' | 'createdAt' | 'slug';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'createdAt', label: 'Recently created' },
  { value: 'slug', label: 'Name (A–Z)' },
];

function compareTemplates(a: TemplateListItem, b: TemplateListItem, key: SortKey): number {
  if (key === 'slug') {
    return a.slug.localeCompare(b.slug);
  }
  const av = a[key];
  const bv = b[key];
  if (!av && !bv) return 0;
  if (!av) return 1;
  if (!bv) return -1;
  return new Date(bv).getTime() - new Date(av).getTime();
}

export interface SamplesDrawerProps {
  enterDuration?: number;
  exitDuration?: number;
  enabled?: boolean;
  loadSamples?: () => Promise<TemplateListItem[]>;
  loadTemplates?: () => Promise<TemplateListItem[]>;
  loadTemplate?: (templateId: string) => Promise<TEditorConfiguration | null>;
  currentTemplateId?: string | null;
  deleteTemplate?: (templateId: string) => void;
  copyTemplate?: (templateName: string, content: any) => void;
  renameTemplate?: (templateId: string, newSlug: string) => void | Promise<void>;
  setTemplateKind?: (templateId: string, kind: TemplateKind) => void | Promise<void>;
  saveAs?: (templateName: string, payload: SavePayload) => Promise<{ id: string; slug: string }>;
}

export default function SamplesDrawer({
  enterDuration = 225,
  exitDuration = 225,
  enabled = true,
  loadSamples,
  loadTemplates,
  loadTemplate,
  currentTemplateId,
  deleteTemplate,
  copyTemplate,
  renameTemplate,
  setTemplateKind,
  saveAs,
}: SamplesDrawerProps) {
  const samplesDrawerOpen = useSamplesDrawerOpen();
  const { setCurrentTemplate, loadTemplate: ctxLoadTemplate } = useEmailEditor();
  const { showMessage } = useSnackbar();

  const [samples, setSamples] = useState<TemplateListItem[]>([EMPTY_TEMPLATE]);
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const [renameTarget, setRenameTarget] = useState<TemplateListItem | null>(null);
  const [pendingSaveAs, setPendingSaveAs] = useState<{ content: TEditorConfiguration; defaultName: string } | null>(null);
  const [newError, setNewError] = useState<string | null>(null);

  // Handler for the empty template + delegation
  const handleLoadTemplate = async (templateId: string) => {
    if (templateId === 'empty-email') {
      return EMPTY_EMAIL_MESSAGE;
    }
    if (loadTemplate) {
      return loadTemplate(templateId);
    }
    return null;
  };

  // Defensive kind coercion so older consumers that don't send `kind` still partition correctly.
  const withKind = (items: TemplateListItem[], fallback: TemplateKind): TemplateListItem[] =>
    items.map((item) => (item.kind ? item : { ...item, kind: fallback }));

  // Load samples
  useEffect(() => {
    if (!enabled || !samplesDrawerOpen || !loadSamples) return;
    setLoadingSamples(true);
    loadSamples()
      .then((results) => {
        const normalized = withKind(results, 'sample');
        const existingEmpty = normalized.find((s) => s.id === 'empty-email');
        setSamples(existingEmpty ? normalized : [EMPTY_TEMPLATE, ...normalized]);
      })
      .catch((error) => {
        console.error('Failed to load samples:', error);
        setSamples([EMPTY_TEMPLATE]);
      })
      .finally(() => setLoadingSamples(false));
  }, [enabled, samplesDrawerOpen, loadSamples]);

  // Load existing templates
  const refreshTemplates = async () => {
    if (!loadTemplates) return;
    setLoadingTemplates(true);
    setTemplatesError(null);
    try {
      const results = await loadTemplates();
      setTemplates(withKind(results, 'template'));
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplatesError('Could not load templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (!enabled || !loadTemplates) return;
    refreshTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, loadTemplates]);

  // Listen for template list updates (fallback path for hosts that dispatch the event)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<TemplateListItem[]>).detail;
      if (Array.isArray(detail)) setTemplates(withKind(detail, 'template'));
    };
    window.addEventListener('templateListUpdated', handler);
    return () => window.removeEventListener('templateListUpdated', handler);
  }, []);

  // Partition by kind — an item's section is determined by `kind`, not by which callback returned it.
  // If an id appears in both lists, the most recent state wins (templates list wins ties).
  const { templateRows, sampleRows } = useMemo(() => {
    const byId = new Map<string, TemplateListItem>();
    for (const s of samples) byId.set(s.id, s);
    for (const t of templates) byId.set(t.id, t);
    const all = Array.from(byId.values());
    return {
      templateRows: all.filter((t) => t.kind === 'template'),
      sampleRows: all.filter((t) => t.kind === 'sample'),
    };
  }, [samples, templates]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const t of templateRows) t.tags?.forEach((tag) => set.add(tag));
    for (const s of sampleRows) s.tags?.forEach((tag) => set.add(tag));
    return Array.from(set).sort();
  }, [templateRows, sampleRows]);

  const matchesSearchAndTags = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (t: TemplateListItem) => {
      if (term) {
        const haystack = [t.slug, t.description, t.subject]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (activeTags.length > 0) {
        if (!t.tags || t.tags.length === 0) return false;
        if (!activeTags.every((tag) => t.tags!.includes(tag))) return false;
      }
      return true;
    };
  }, [search, activeTags]);

  const filteredTemplates = useMemo(
    () => templateRows.filter(matchesSearchAndTags).slice().sort((a, b) => compareTemplates(a, b, sortKey)),
    [templateRows, matchesSearchAndTags, sortKey]
  );

  const filteredSamples = useMemo(
    () => sampleRows.filter(matchesSearchAndTags).slice().sort((a, b) => compareTemplates(a, b, sortKey)),
    [sampleRows, matchesSearchAndTags, sortKey]
  );

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleDuplicate = (template: TemplateListItem) => {
    if (!copyTemplate) return;
    const content = null; // must fetch full content before duplicating
    (async () => {
      try {
        const full = await handleLoadTemplate(template.id);
        if (!full) {
          showMessage('Could not load template to duplicate');
          return;
        }
        copyTemplate(`${template.slug} (Copy)`, full);
        showMessage('Template duplicated');
      } catch (e) {
        console.error('Error duplicating template:', e);
        showMessage('Error duplicating template');
      }
    })();
    void content;
  };

  const handleDelete = (template: TemplateListItem) => {
    if (!deleteTemplate) return;
    if (!window.confirm(`Delete "${template.slug}"? This cannot be undone.`)) return;
    deleteTemplate(template.id);
    showMessage('Template deleted');
  };

  const handleRenameSubmit = async (newSlug: string) => {
    if (!renameTarget || !renameTemplate) return;
    await renameTemplate(renameTarget.id, newSlug);
    // Optimistic: update local list so the UI reflects the rename without waiting on the host's event.
    setTemplates((prev) =>
      prev.map((t) => (t.id === renameTarget.id ? { ...t, slug: newSlug } : t)),
    );
    if (currentTemplateId === renameTarget.id) {
      setCurrentTemplate(renameTarget.id, newSlug);
    }
    showMessage('Template renamed');
  };

  const flipKindLocally = (id: string, kind: TemplateKind) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, kind } : t)));
    setSamples((prev) => prev.map((t) => (t.id === id ? { ...t, kind } : t)));
  };

  const handleSetKind = (template: TemplateListItem, kind: TemplateKind) => {
    if (!setTemplateKind) return;
    (async () => {
      try {
        await setTemplateKind(template.id, kind);
        flipKindLocally(template.id, kind);
        if (currentTemplateId === template.id) {
          setCurrentTemplate(template.id, template.slug, kind);
        }
        showMessage(kind === 'sample' ? 'Promoted to sample' : 'Demoted to template');
      } catch (e) {
        console.error('Error updating template kind:', e);
        showMessage('Error updating template kind');
      }
    })();
  };

  const handleDuplicateAsTemplate = (sample: TemplateListItem) => {
    if (!saveAs) return;
    (async () => {
      try {
        const content = await handleLoadTemplate(sample.id);
        if (!content) {
          showMessage('Could not load sample');
          return;
        }
        resetDocument(content);
        setPendingSaveAs({ content, defaultName: `${sample.slug} (Copy)` });
      } catch (e) {
        console.error('Error duplicating sample:', e);
        showMessage('Error duplicating sample');
      }
    })();
  };

  const handleSaveAsSubmit = async (templateName: string): Promise<boolean> => {
    if (!saveAs || !pendingSaveAs) return false;
    const taken = templateRows.some((t) => t.slug.toLowerCase() === templateName.toLowerCase());
    if (taken) {
      setNewError('A template with this name already exists');
      return false;
    }
    try {
      const content = pendingSaveAs.content;
      const { id, slug } = await saveAs(templateName, buildSavePayload(content));
      resetDocument(content);
      setCurrentTemplate(id, slug, 'template');
      ctxLoadTemplate(content, id, slug, 'template');
      showMessage('New template created!');
      window.location.hash = `#template/${id}`;
      await refreshTemplates();
      return true;
    } catch (e) {
      console.error('Error creating template:', e);
      showMessage('Error creating template');
      return false;
    }
  };

  const openNewTemplateDialog = () => {
    setNewError(null);
    setPendingSaveAs({ content: EMPTY_EMAIL_MESSAGE, defaultName: 'New Template' });
  };

  if (!enabled) {
    return null;
  }

  const existingSlugs = templates.map((t) => t.slug);

  return (
    <>
      <Drawer
        variant="persistent"
        anchor="left"
        open={samplesDrawerOpen}
        PaperProps={{ style: { position: 'absolute' } }}
        ModalProps={{
          container: document.getElementById('drawer-container'),
          style: { position: 'absolute' },
          keepMounted: true,
        }}
        transitionDuration={{ enter: enterDuration, exit: exitDuration }}
        sx={{ width: samplesDrawerOpen ? SAMPLES_DRAWER_WIDTH : 0 }}
      >
        <Stack
          py={1}
          px={2}
          width={SAMPLES_DRAWER_WIDTH}
          height="100%"
          spacing={1.5}
          sx={{ overflowY: 'auto' }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 1 }}>
            <Typography variant="h6" component="h1">
              Templates
            </Typography>
            {saveAs && (
              <Tooltip title="New template">
                <IconButton
                  size="small"
                  onClick={openNewTemplateDialog}
                  aria-label="New template"
                >
                  <AddOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {loadTemplates && (
            <>
              <TextField
                size="small"
                placeholder="Search templates"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                size="small"
                label="Sort by"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              {allTags.length > 0 && (
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip
                    label="All"
                    size="small"
                    clickable
                    color={activeTags.length === 0 ? 'primary' : 'default'}
                    variant={activeTags.length === 0 ? 'filled' : 'outlined'}
                    onClick={() => setActiveTags([])}
                  />
                  {allTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      clickable
                      color={activeTags.includes(tag) ? 'primary' : 'default'}
                      variant={activeTags.includes(tag) ? 'filled' : 'outlined'}
                      onClick={() => toggleTag(tag)}
                    />
                  ))}
                </Stack>
              )}

              <Box>
                <Typography variant="subtitle2" component="h2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Your Templates
                </Typography>

                {loadingTemplates ? (
                  <Stack alignItems="center" width="100%" py={2}>
                    <CircularProgress size={24} />
                  </Stack>
                ) : templatesError ? (
                  <Alert severity="error" sx={{ my: 1 }}>
                    {templatesError}
                  </Alert>
                ) : filteredTemplates.length > 0 ? (
                  <Stack spacing={0.25} sx={{ width: '100%' }}>
                    {filteredTemplates.map((template) => (
                      <TemplateRow
                        key={template.id}
                        template={template}
                        isCurrent={currentTemplateId === template.id}
                        templateLoader={() => handleLoadTemplate(template.id)}
                        onDuplicate={copyTemplate ? () => handleDuplicate(template) : undefined}
                        onRename={renameTemplate ? () => setRenameTarget(template) : undefined}
                        onDelete={deleteTemplate ? () => handleDelete(template) : undefined}
                        onPromote={setTemplateKind ? () => handleSetKind(template, 'sample') : undefined}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>
                    {templateRows.length === 0
                      ? 'No saved templates yet'
                      : 'No templates match your filters'}
                  </Typography>
                )}
              </Box>

              <Divider />
            </>
          )}

          <Box>
            <Typography variant="subtitle2" component="h2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Sample Templates
            </Typography>

            {loadingSamples ? (
              <Stack alignItems="center" width="100%" py={2}>
                <CircularProgress size={24} />
              </Stack>
            ) : filteredSamples.length > 0 ? (
              <Stack spacing={0.25} sx={{ width: '100%' }}>
                {filteredSamples.map((sample) => (
                  <TemplateRow
                    key={sample.id}
                    template={sample}
                    isCurrent={currentTemplateId === sample.id}
                    templateLoader={() => handleLoadTemplate(sample.id)}
                    onDuplicateAsTemplate={saveAs ? () => handleDuplicateAsTemplate(sample) : undefined}
                    onDemote={setTemplateKind && sample.id !== 'empty-email' ? () => handleSetKind(sample, 'template') : undefined}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>
                {sampleRows.length === 0 ? 'No samples available' : 'No samples match your filters'}
              </Typography>
            )}
          </Box>
        </Stack>
      </Drawer>

      {renameTarget && (
        <RenameDialog
          open={!!renameTarget}
          currentSlug={renameTarget.slug}
          existingSlugs={existingSlugs.filter((s) => s !== renameTarget.slug)}
          onClose={() => setRenameTarget(null)}
          onSubmit={handleRenameSubmit}
        />
      )}

      <SaveTemplateDialog
        open={!!pendingSaveAs}
        onClose={() => {
          setPendingSaveAs(null);
          setNewError(null);
        }}
        onSave={handleSaveAsSubmit}
        onNameChange={() => setNewError(null)}
        defaultName={pendingSaveAs?.defaultName ?? 'New Template'}
        error={newError}
      />
    </>
  );
}
