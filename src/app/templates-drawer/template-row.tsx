import React, { useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ContentCopyOutlined,
  DeleteOutlined,
  DriveFileRenameOutlineOutlined,
  FileDownloadOutlined,
  FileUploadOutlined,
  LibraryAddOutlined,
  MoreVertOutlined,
} from '@mui/icons-material';
import { resetDocument } from '@editor/editor-context';
import { TEditorConfiguration } from '@editor/core';
import { useEmailEditor } from '../context';
import { TemplateListItem } from '../index';

export interface TemplateRowProps {
  template: TemplateListItem;
  isCurrent: boolean;
  templateLoader: () => Promise<TEditorConfiguration | null>;
  onDuplicate?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onPromote?: () => void;
  onDemote?: () => void;
  onDuplicateAsTemplate?: () => void;
}

function relativeTime(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso).getTime();
  if (Number.isNaN(date)) return null;
  const diffMs = Date.now() - date;
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMo = Math.round(diffDay / 30);
  if (diffMo < 12) return `${diffMo}mo ago`;
  const diffYr = Math.round(diffMo / 12);
  return `${diffYr}y ago`;
}

export default function TemplateRow({
  template,
  isCurrent,
  templateLoader,
  onDuplicate,
  onRename,
  onDelete,
  onPromote,
  onDemote,
  onDuplicateAsTemplate,
}: TemplateRowProps) {
  const { setCurrentTemplate } = useEmailEditor();
  const [hover, setHover] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const closeMenu = () => setMenuAnchor(null);
  const openMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };
  const runAction = (fn?: () => void) => () => {
    closeMenu();
    fn?.();
  };

  const handleClick = async () => {
    try {
      const content = await templateLoader();
      if (content) {
        resetDocument(content);
        setCurrentTemplate(template.id, template.slug, template.kind);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const updated = relativeTime(template.updatedAt);
  const hasActions = Boolean(
    onDuplicate || onRename || onDelete || onPromote || onDemote || onDuplicateAsTemplate,
  );

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        position: 'relative',
        width: '100%',
        px: 1.5,
        py: 1,
        borderRadius: 1,
        cursor: 'pointer',
        bgcolor: isCurrent ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        <Box sx={{ flexGrow: 1, minWidth: 0, pr: hasActions ? 3 : 0 }}>
          <Stack direction="row" alignItems="baseline" spacing={1} sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                flexGrow: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={template.slug}
            >
              {template.slug}
            </Typography>
            {updated && !hasActions && (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', flexShrink: 0, fontSize: '0.7rem' }}
              >
                {updated}
              </Typography>
            )}
          </Stack>
          {template.description && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.3,
              }}
            >
              {template.description}
            </Typography>
          )}
          {template.tags && template.tags.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
              {template.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.75 } }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Stack>

      {hasActions && (
        <>
          <Tooltip title="More">
            <IconButton
              size="small"
              onClick={openMenu}
              aria-label="Row actions"
              aria-haspopup="menu"
              aria-expanded={Boolean(menuAnchor) || undefined}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                opacity: hover || isCurrent || Boolean(menuAnchor) ? 1 : 0.45,
                transition: 'opacity 120ms',
              }}
            >
              <MoreVertOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={closeMenu}
            onClick={stop}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { minWidth: 200 } } }}
          >
            {onRename && (
              <MenuItem onClick={runAction(onRename)}>
                <ListItemIcon>
                  <DriveFileRenameOutlineOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit name &amp; tags…</ListItemText>
              </MenuItem>
            )}
            {onDuplicate && (
              <MenuItem onClick={runAction(onDuplicate)}>
                <ListItemIcon>
                  <ContentCopyOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText>Duplicate</ListItemText>
              </MenuItem>
            )}
            {onDuplicateAsTemplate && (
              <MenuItem onClick={runAction(onDuplicateAsTemplate)}>
                <ListItemIcon>
                  <LibraryAddOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText>Duplicate as template</ListItemText>
              </MenuItem>
            )}
            {onPromote && (
              <MenuItem onClick={runAction(onPromote)}>
                <ListItemIcon>
                  <FileUploadOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText>Promote to sample</ListItemText>
              </MenuItem>
            )}
            {onDemote && (
              <MenuItem onClick={runAction(onDemote)}>
                <ListItemIcon>
                  <FileDownloadOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText>Demote to template</ListItemText>
              </MenuItem>
            )}
            {onDelete && [
              <Divider key="divider" />,
              <MenuItem key="delete" onClick={runAction(onDelete)} sx={{ color: 'error.main' }}>
                <ListItemIcon sx={{ color: 'error.main' }}>
                  <DeleteOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>,
            ]}
          </Menu>
        </>
      )}
    </Box>
  );
}
