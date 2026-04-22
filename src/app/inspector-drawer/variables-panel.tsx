import React from 'react';
import {
  Alert,
  Box,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { AddOutlined, DeleteOutline } from '@mui/icons-material';
import { setDocument, useDocument } from '@editor/editor-context';
import type {
  EmailLayoutProps,
} from '@editor/blocks/email-layout/email-layout-props-schema';

type TemplateVariable = {
  name: string;
  description?: string | null;
};

// Handlebars-compatible identifier: start with letter or _, followed by letters/digits/_.
// Dotted paths (e.g. user.name) are allowed at the consumer level but not declared here.
const VARIABLE_NAME_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function validateName(name: string, index: number, all: TemplateVariable[]): string | null {
  if (!name.trim()) return 'Name is required';
  if (!VARIABLE_NAME_RE.test(name)) return 'Use letters, digits, underscore; start with a letter or underscore';
  const duplicate = all.some((v, i) => i !== index && v.name === name);
  if (duplicate) return 'Already declared';
  return null;
}

export default function VariablesPanel() {
  const document = useDocument();
  const root = document.root;

  if (!root || root.type !== 'EmailLayout') {
    return (
      <Box p={2}>
        <Alert severity="info">Open a template to manage variables.</Alert>
      </Box>
    );
  }

  const data = root.data as EmailLayoutProps;
  const variables: TemplateVariable[] = (data.variables ?? []).map((v) => ({
    name: v.name,
    description: v.description ?? '',
  }));

  const commit = (next: TemplateVariable[]) => {
    setDocument({
      root: {
        ...root,
        data: {
          ...data,
          variables: next.map((v) => ({
            name: v.name,
            description: v.description ? v.description : undefined,
          })),
        },
      },
    });
  };

  const updateAt = (index: number, patch: Partial<TemplateVariable>) => {
    const next = variables.map((v, i) => (i === index ? { ...v, ...patch } : v));
    commit(next);
  };

  const add = () => {
    commit([...variables, { name: '', description: '' }]);
  };

  const removeAt = (index: number) => {
    commit(variables.filter((_, i) => i !== index));
  };

  return (
    <Box p={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Variables
        </Typography>
        <Tooltip title="Add variable">
          <IconButton size="small" onClick={add} aria-label="Add variable">
            <AddOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
        Declared variables travel with the template. Reference them in subject and body as{' '}
        <Box component="code" sx={{ fontFamily: 'monospace' }}>{'{{name}}'}</Box>.
      </Typography>

      {variables.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No variables declared. Click + to add one.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {variables.map((v, i) => {
            const nameError = validateName(v.name, i, variables);
            return (
              <Stack key={i} spacing={0.75} sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <TextField
                    label="Name"
                    size="small"
                    fullWidth
                    value={v.name}
                    onChange={(e) => updateAt(i, { name: e.target.value })}
                    error={Boolean(nameError)}
                    helperText={nameError ?? ' '}
                  />
                  <Tooltip title="Remove">
                    <IconButton
                      size="small"
                      onClick={() => removeAt(i)}
                      aria-label={`Remove ${v.name || 'variable'}`}
                      sx={{ mt: 0.5 }}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <TextField
                  label="Description"
                  size="small"
                  fullWidth
                  value={v.description ?? ''}
                  onChange={(e) => updateAt(i, { description: e.target.value })}
                  placeholder="Optional"
                />
              </Stack>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
