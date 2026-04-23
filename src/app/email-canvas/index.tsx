import React from 'react';

import { MonitorOutlined, PhoneIphoneOutlined } from '@mui/icons-material';
import { Box, Stack, SxProps, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { Reader } from '@email-builder';

import EditorBlock from '@editor/editor-block';
import {
  setSelectedScreenSize,
  useDocument,
  useSelectedMainTab,
  useSelectedScreenSize,
  usePersistenceEnabled,
  useWorkspaceBackground
} from '@editor/editor-context';
import ToggleInspectorPanelButton from '../inspector-drawer/toggle-inspector-panel-button';
import ToggleSamplesPanelButton from '../templates-drawer/toggle-samples-panel-button';

import HtmlPanel from './html-panel';
import JsonPanel from './json-panel';
import TextPanel from './text-panel';
import MainTabsGroup from './main-tabs-group';
import SaveBar from './save-bar';
import UndoRedoButtons from './undo-redo-buttons';
import SubjectInput from './subject-input';
import SubjectPreview from './subject-preview';
import ImageDropPasteHandler from './image-drop-paste-handler';
import { TemplateListItem } from '../index';
import type { SavePayload } from '../save-payload';
import {
  applySampleValuesToDocument,
  buildSampleValueMap,
  TemplateVariable,
} from '../variables/variable-utils';

interface TemplatePanelProps {
  loadTemplates?: () => Promise<TemplateListItem[]>;
  saveAs?: (templateName: string, payload: SavePayload) => Promise<{ id: string; slug: string }>;
  samplesDrawerEnabled?: boolean;
}

// Editor-mode workspace backgrounds. 'checkerboard' is a 12-px light/dark
// squares pattern (opt-in default per user ask); 'solid' is the previous flat
// gray. Both sit behind the email card and never reach the rendered output.
const WORKSPACE_SOLID = '#e7e8ec';
const WORKSPACE_CHECKERBOARD =
  'repeating-conic-gradient(#eceef2 0% 25%, #dfe1e6 0% 50%) 50% / 12px 12px';

export default function TemplatePanel({ loadTemplates, saveAs, samplesDrawerEnabled = true }: TemplatePanelProps) {
  const document = useDocument();
  const selectedMainTab = useSelectedMainTab();
  const selectedScreenSize = useSelectedScreenSize();
  const persistenceEnabled = usePersistenceEnabled();
  const workspaceBackground = useWorkspaceBackground();

  let mainBoxSx: SxProps = {
    height: '100%',
  };
  if (selectedScreenSize === 'mobile') {
    mainBoxSx = {
      ...mainBoxSx,
      margin: '32px auto',
      width: 370,
      height: 800,
      boxShadow:
        'rgba(33, 36, 67, 0.04) 0px 10px 20px, rgba(33, 36, 67, 0.08) 0px 2px 4px',
      borderRadius: '16px',
    };
  }

  const handleScreenSizeChange = (_: unknown, value: unknown) => {
    switch (value) {
      case 'mobile':
      case 'desktop':
        setSelectedScreenSize(value);
        return;
      default:
        setSelectedScreenSize('desktop');
    }
  };

  const renderMainPanel = () => {
    switch (selectedMainTab) {
      case 'editor':
        return (
          <Box sx={mainBoxSx}>
            <EditorBlock id="root" />
          </Box>
        );
      case 'preview': {
        const rootBlock = document.root;
        const layoutData =
          rootBlock && rootBlock.type === 'EmailLayout' ? (rootBlock.data as any) : undefined;
        const samples = buildSampleValueMap(
          (layoutData?.variables ?? []) as TemplateVariable[]
        );
        const previewDoc = applySampleValuesToDocument(document, samples);
        return (
          <Box sx={mainBoxSx}>
            <Reader document={previewDoc} rootBlockId="root" />
          </Box>
        );
      }
      case 'html':
        return <HtmlPanel />;
      case 'text':
        return <TextPanel />;
      case 'json':
        return <JsonPanel />;
    }
  };

  const showSaveButtons = persistenceEnabled;

  return (
    <>
      <Stack
        sx={{
          height: 49,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 'appBar',
          px: 1,
        }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        {samplesDrawerEnabled && <ToggleSamplesPanelButton />}
        <Stack px={2} direction="row" gap={2} width="100%" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2}>
            <MainTabsGroup />
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            {selectedMainTab === 'editor' && <UndoRedoButtons />}
            <ToggleButtonGroup value={selectedScreenSize} exclusive size="small" onChange={handleScreenSizeChange}>
              <ToggleButton value="desktop">
                <Tooltip title="Desktop view">
                  <MonitorOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="mobile">
                <Tooltip title="Mobile view">
                  <PhoneIphoneOutlined fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
        <ToggleInspectorPanelButton />
      </Stack>
      {selectedMainTab === 'editor' && <SubjectInput />}
      {selectedMainTab === 'preview' && <SubjectPreview />}
      <ImageDropPasteHandler enabled={selectedMainTab === 'editor'}>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: '16px',
            minWidth: 370,
            // Fills to the bottom of the viewport in editor mode so the
            // workspace gray doesn't end midway under a short email.
            // 49px toolbar + 49px subject bar = 98px fixed chrome above.
            minHeight: selectedMainTab === 'editor' ? 'calc(100vh - 98px)' : undefined,
            background:
              selectedMainTab === 'editor'
                ? workspaceBackground === 'checkerboard'
                  ? WORKSPACE_CHECKERBOARD
                  : WORKSPACE_SOLID
                : undefined,
          }}
        >
          <Box sx={{ flexGrow: 1 }}>{renderMainPanel()}</Box>
          {showSaveButtons && selectedMainTab === 'editor' && (
            <SaveBar loadTemplates={loadTemplates} saveAs={saveAs} />
          )}
        </Box>
      </ImageDropPasteHandler>
    </>
  );
}
