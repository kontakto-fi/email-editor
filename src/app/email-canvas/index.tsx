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
  usePersistenceEnabled
} from '@editor/editor-context';
import ToggleInspectorPanelButton from '../inspector-drawer/toggle-inspector-panel-button';
import ToggleSamplesPanelButton from '../templates-drawer/toggle-samples-panel-button';

import HtmlPanel from './html-panel';
import JsonPanel from './json-panel';
import TextPanel from './text-panel';
import MainTabsGroup from './main-tabs-group';
import SaveButton from './save-button';
import NewTemplateButton from './new-template-button';
import SubjectInput from './subject-input';
import SubjectPreview from './subject-preview';
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

export default function TemplatePanel({ loadTemplates, saveAs, samplesDrawerEnabled = true }: TemplatePanelProps) {
  const document = useDocument();
  const selectedMainTab = useSelectedMainTab();
  const selectedScreenSize = useSelectedScreenSize();
  const persistenceEnabled = usePersistenceEnabled();

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
          <Stack direction="row" spacing={2}>
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
            {showSaveButtons && (
              <>
                <NewTemplateButton loadTemplates={loadTemplates} saveAs={saveAs} />
                <SaveButton loadTemplates={loadTemplates} saveAs={saveAs} />
              </>
            )}
          </Stack>
        </Stack>
        <ToggleInspectorPanelButton />
      </Stack>
      {selectedMainTab === 'editor' && <SubjectInput />}
      {selectedMainTab === 'preview' && <SubjectPreview />}
      <Box sx={{
        paddingBottom: '50px',
        minWidth: 370
              }}>
        {renderMainPanel()}
      </Box>
    </>
  );
}
