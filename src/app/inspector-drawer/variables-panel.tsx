import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AddOutlined,
  ContentCopyOutlined,
  DataObjectOutlined,
  DeleteOutline,
  InputOutlined,
} from '@mui/icons-material';
import {
  getLastFocusedEditable,
  setDocument,
  useDocument,
  useLastFocusedEditable,
} from '@editor/editor-context';
import { TEditorConfiguration } from '@editor/core';
import type { EmailLayoutProps } from '@editor/blocks/email-layout/email-layout-props-schema';
import { t } from '@i18n';
import {
  buildRenamePatch,
  collectTokenUsage,
  TemplateVariable,
  validateVariableName,
} from '../variables/variable-utils';

type DocVariable = {
  name: string;
  description?: string | null;
  sampleValue?: string | null;
};

function toPersistShape(v: TemplateVariable): DocVariable {
  return {
    name: v.name,
    description: v.description ? v.description : undefined,
    sampleValue: v.sampleValue ? v.sampleValue : undefined,
  };
}

export default function VariablesPanel() {
  const document = useDocument();
  const lastFocused = useLastFocusedEditable();
  const root = document.root;

  if (!root || root.type !== 'EmailLayout') {
    return (
      <Box p={2}>
        <Alert severity="info">{t('variables.open-template', 'Open a template to manage variables.')}</Alert>
      </Box>
    );
  }

  const data = root.data as EmailLayoutProps;
  const variables: TemplateVariable[] = (data.variables ?? []).map((v) => ({
    name: v.name,
    description: v.description ?? '',
    sampleValue: (v as DocVariable).sampleValue ?? '',
  }));

  const usage = useMemo(() => collectTokenUsage(document), [document]);
  const declaredNames = useMemo(() => new Set(variables.map((v) => v.name)), [variables]);
  const undeclared = useMemo(
    () => [...usage.keys()].filter((n) => n && !declaredNames.has(n)),
    [usage, declaredNames]
  );

  const writeVariables = (next: TemplateVariable[], extraPatch: Partial<TEditorConfiguration> = {}) => {
    const baseRoot: any = (extraPatch as any).root ?? root;
    const newRoot = {
      ...baseRoot,
      data: {
        ...baseRoot.data,
        variables: next.map(toPersistShape),
      },
    };
    setDocument({ ...(extraPatch as any), root: newRoot } as any);
  };

  const updateAt = (index: number, patch: Partial<TemplateVariable>) => {
    const next = variables.map((v, i) => (i === index ? { ...v, ...patch } : v));
    writeVariables(next);
  };

  const add = () => {
    writeVariables([...variables, { name: '', description: '', sampleValue: '' }]);
  };

  const addFromToken = (name: string) => {
    writeVariables([...variables, { name, description: '', sampleValue: '' }]);
  };

  const removeAt = (index: number) => {
    const v = variables[index];
    const usageCount = v.name ? usage.get(v.name) ?? 0 : 0;
    if (usageCount > 0) {
      const ok = window.confirm(
        t('variables.confirm-delete', 'Variable is still referenced in the body. Delete anyway?') +
          ` (${v.name}, ${usageCount})`
      );
      if (!ok) return;
    }
    writeVariables(variables.filter((_, i) => i !== index));
  };

  const commitRename = (index: number, newName: string) => {
    const oldName = variables[index].name;
    const trimmed = newName.trim();
    if (trimmed === oldName) return;
    const error = validateVariableName(trimmed, variables, index);
    if (error) return;
    const patch = oldName ? buildRenamePatch(document, oldName, trimmed) : {};
    const next = variables.map((v, i) => (i === index ? { ...v, name: trimmed } : v));
    writeVariables(next, patch);
  };

  const canInsert = Boolean(
    lastFocused &&
      (lastFocused.field === 'subject' ||
        (lastFocused.blockId && document[lastFocused.blockId]))
  );

  const insertIntoFocused = (name: string) => {
    const focused = getLastFocusedEditable();
    if (!focused) return;
    const token = `{{${name}}}`;

    if (focused.field === 'subject') {
      const layoutData = root.data as any;
      const current: string = layoutData.subject ?? '';
      const next =
        current.slice(0, focused.selectionStart) + token + current.slice(focused.selectionEnd);
      setDocument({
        root: { ...root, data: { ...layoutData, subject: next } },
      });
      return;
    }

    const block: any = document[focused.blockId];
    if (!block) return;
    const blockData = block.data;
    const props = blockData?.props ?? {};
    const field = focused.field; // 'text' | 'contents'
    const current: string = props[field] ?? '';
    const next =
      current.slice(0, focused.selectionStart) + token + current.slice(focused.selectionEnd);
    setDocument({
      [focused.blockId]: {
        ...block,
        data: { ...blockData, props: { ...props, [field]: next } },
      },
    } as any);
  };

  const copy = async (name: string) => {
    try {
      await navigator.clipboard.writeText(`{{${name}}}`);
    } catch {
      // Clipboard may be blocked (e.g., insecure context); silently ignore.
    }
  };

  return (
    <Box p={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {t('variables.title', 'Variables')}
        </Typography>
        <Tooltip title={t('variables.add', 'Add variable')}>
          <IconButton size="small" onClick={add} aria-label={t('variables.add', 'Add variable')}>
            <AddOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
        {t(
          'variables.intro',
          'Declared variables travel with the template. Reference them in subject and body as {{name}}. In Preview mode, tokens render with the sample values below.'
        )}
      </Typography>

      {undeclared.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle sx={{ fontSize: 13 }}>{t('variables.undeclared', 'Undeclared in body')}</AlertTitle>
          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
            {undeclared.map((name) => (
              <Chip
                key={name}
                size="small"
                label={name}
                onClick={() => addFromToken(name)}
                onDelete={() => addFromToken(name)}
                deleteIcon={<AddOutlined />}
                sx={{ fontFamily: 'monospace' }}
              />
            ))}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            {t('variables.click-to-declare', 'Click a token to declare it.')}
          </Typography>
        </Alert>
      )}

      {variables.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('variables.none', 'No variables declared. Click + to add one.')}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {variables.map((v, i) => (
            <VariableRow
              key={i}
              index={i}
              variable={v}
              siblings={variables}
              usageCount={v.name ? usage.get(v.name) ?? 0 : 0}
              canInsert={canInsert}
              onCommitRename={(name) => commitRename(i, name)}
              onChangeDescription={(description) => updateAt(i, { description })}
              onChangeSampleValue={(sampleValue) => updateAt(i, { sampleValue })}
              onRemove={() => removeAt(i)}
              onInsert={() => v.name && insertIntoFocused(v.name)}
              onCopy={() => v.name && copy(v.name)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

type VariableRowProps = {
  index: number;
  variable: TemplateVariable;
  siblings: TemplateVariable[];
  usageCount: number;
  canInsert: boolean;
  onCommitRename: (name: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeSampleValue: (value: string) => void;
  onRemove: () => void;
  onInsert: () => void;
  onCopy: () => void;
};

function VariableRow({
  index,
  variable,
  siblings,
  usageCount,
  canInsert,
  onCommitRename,
  onChangeDescription,
  onChangeSampleValue,
  onRemove,
  onInsert,
  onCopy,
}: VariableRowProps) {
  const [draftName, setDraftName] = useState(variable.name);
  const [isEditing, setIsEditing] = useState(false);

  // Re-sync from props when the stored name changes from the outside (e.g., an
  // undeclared-token add, or a sibling edit causing re-render). Avoid
  // overwriting an in-progress edit.
  useEffect(() => {
    if (!isEditing) setDraftName(variable.name);
  }, [variable.name, isEditing]);

  const nameError = validateVariableName(draftName, siblings, index);
  const unused = Boolean(variable.name) && usageCount === 0;
  const hasName = Boolean(variable.name);

  const commit = () => {
    setIsEditing(false);
    if (nameError) {
      setDraftName(variable.name);
      return;
    }
    if (draftName.trim() !== variable.name) {
      onCommitRename(draftName.trim());
    }
  };

  return (
    <Stack spacing={0.75} sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <TextField
          label={t('rename.name-label', 'Name')}
          size="small"
          fullWidth
          value={draftName}
          onChange={(e) => {
            setDraftName(e.target.value);
            setIsEditing(true);
          }}
          onFocus={() => setIsEditing(true)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              (e.target as HTMLInputElement).blur();
            } else if (e.key === 'Escape') {
              setDraftName(variable.name);
              setIsEditing(false);
              (e.target as HTMLInputElement).blur();
            }
          }}
          error={Boolean(nameError)}
          helperText={nameError ?? ' '}
        />
        <Stack direction="row" spacing={0.25} sx={{ mt: 0.5 }}>
          <Tooltip title={t('variables.copy-token', 'Copy {{name}} token')}>
            <span>
              <IconButton
                size="small"
                onClick={onCopy}
                disabled={!hasName}
                aria-label={t('variables.copy-token', 'Copy {{name}} token')}
              >
                <ContentCopyOutlined fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={canInsert ? t('variables.insert-at-cursor', 'Insert at cursor') : t('variables.focus-first', 'Focus a text field first')}>
            <span>
              <IconButton
                size="small"
                onClick={onInsert}
                disabled={!hasName || !canInsert}
                aria-label={t('variables.insert-at-cursor', 'Insert at cursor')}
              >
                <InputOutlined fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('variables.remove', 'Remove')}>
            <IconButton
              size="small"
              onClick={onRemove}
              aria-label={t('variables.remove', 'Remove')}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <TextField
        label={t('variables.description', 'Description')}
        size="small"
        fullWidth
        value={variable.description ?? ''}
        onChange={(e) => onChangeDescription(e.target.value)}
        placeholder={t('variables.optional', 'Optional')}
      />
      <TextField
        label={t('variables.sample-value', 'Sample value')}
        size="small"
        fullWidth
        value={variable.sampleValue ?? ''}
        onChange={(e) => onChangeSampleValue(e.target.value)}
        placeholder={t('variables.sample-hint', 'Shown in Preview mode')}
        InputProps={{
          startAdornment: (
            <DataObjectOutlined
              fontSize="small"
              sx={{ color: 'text.secondary', mr: 0.75 }}
            />
          ),
        }}
      />
      <Stack direction="row" spacing={0.5} sx={{ pt: 0.25 }}>
        {hasName &&
          (unused ? (
            <Chip size="small" color="warning" variant="outlined" label={t('variables.unused', 'Unused in body')} />
          ) : (
            <Chip
              size="small"
              variant="outlined"
              label={`${usageCount} ${usageCount === 1 ? t('variables.ref-one', 'ref') : t('variables.ref-many', 'refs')}`}
            />
          ))}
      </Stack>
    </Stack>
  );
}
