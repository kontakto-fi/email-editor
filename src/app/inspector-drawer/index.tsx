import React from 'react';

import { Box, Drawer, Tab, Tabs } from '@mui/material';

import { 
  setSidebarTab, 
  useInspectorDrawerOpen, 
  useSelectedSidebarTab
} from '@editor/editor-context';

import ConfigurationPanel from './configuration-panel';
import StylesPanel from './styles-panel';
import TemplatePanel from './template-panel';

export const INSPECTOR_DRAWER_WIDTH = 320;

export interface InspectorDrawerProps {
  /**
   * Duration for enter transition in milliseconds.
   * @default 225
   */
  enterDuration?: number;
  
  /**
   * Duration for exit transition in milliseconds.
   * @default 225
   */
  exitDuration?: number;

  /**
   * Callback to delete a template by ID
   */
  deleteTemplate?: (templateId: string) => void;
  
  /**
   * Callback to copy a template with a new name
   */
  copyTemplate?: (templateName: string, content: any) => void;

  /**
   * Indicates whether the template is saving enabled
   */
  savingEnabled?: boolean;
}

export default function InspectorDrawer({ 
  enterDuration = 225, 
  exitDuration = 225,
  deleteTemplate,
  copyTemplate,
  savingEnabled = true
}: InspectorDrawerProps = {}) {
  const selectedSidebarTab = useSelectedSidebarTab();
  const inspectorDrawerOpen = useInspectorDrawerOpen();

  const renderCurrentSidebarPanel = () => {
    switch (selectedSidebarTab) {
      case 'block-configuration':
        return <ConfigurationPanel />;
      case 'styles':
        return <StylesPanel />;
      case 'template-settings':
        return <TemplatePanel 
          deleteTemplate={deleteTemplate} 
          copyTemplate={copyTemplate}
        />;
    }
  };

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={inspectorDrawerOpen}
      PaperProps={{
        style: { position: 'absolute' }
      }}
      ModalProps={{
        container: document.getElementById('drawer-container'),
        style: { position: 'absolute' },
        keepMounted: true
      }}
      transitionDuration={{
        enter: enterDuration,
        exit: exitDuration
      }}
      sx={{
        width: inspectorDrawerOpen ? INSPECTOR_DRAWER_WIDTH : 0,
      }}
    >
      <Box sx={{ width: INSPECTOR_DRAWER_WIDTH, height: 49, borderBottom: 1, borderColor: 'divider' }}>
        <Box px={2}>
          <Tabs value={selectedSidebarTab} onChange={(_, v) => setSidebarTab(v)}>
            <Tab value="styles" label="Styles" />
            <Tab value="block-configuration" label="Inspect" />
            <Tab value="template-settings" label="Settings" />
          </Tabs>
        </Box>
      </Box>
      <Box sx={{ width: INSPECTOR_DRAWER_WIDTH, height: 'calc(100% - 49px)', overflow: 'auto' }}>
        {renderCurrentSidebarPanel()}
      </Box>
    </Drawer>
  );
}
