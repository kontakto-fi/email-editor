import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  Stack,
  Typography,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

import { resetDocument, useSamplesDrawerOpen } from "@editor/editor-context";
import { SampleTemplate } from "../index";
import getConfiguration from "@configuration";
import SaveTemplateDialog from "../email-canvas/save-template-dialog";
import { useEmailEditor } from "../context";

import SidebarButton from "./sidebar-button";

export const SAMPLES_DRAWER_WIDTH = 240;

export interface SamplesDrawerProps {
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
   * Whether the drawer is enabled.
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback to load samples dynamically.
   * This will be called when the drawer is opened.
   */
  loadSamples?: () => Promise<SampleTemplate[]>;

  /**
   * Callback to load existing templates dynamically.
   * This will be called when the drawer is opened.
   */
  loadTemplates?: () => Promise<SampleTemplate[]>;

  /**
   * Callback to load a specific template by ID.
   * This will be called when a template is selected from the drawer.
   */
  loadTemplate?: (templateId: string) => Promise<any>;

  /**
   * ID of the currently active template
   */
  currentTemplateId?: string | null;
}

export default function SamplesDrawer({
  enterDuration = 225,
  exitDuration = 225,
  enabled = true,
  loadSamples,
  loadTemplates,
  loadTemplate,
  currentTemplateId,
}: SamplesDrawerProps = {}) {
  const samplesDrawerOpen = useSamplesDrawerOpen();
  const [samples, setSamples] = useState<SampleTemplate[]>([]);
  const [templates, setTemplates] = useState<SampleTemplate[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [newTemplateDialogOpen, setNewTemplateDialogOpen] = useState(false);

  // Load samples
  useEffect(() => {
    if (enabled && samplesDrawerOpen && loadSamples) {
      setLoadingSamples(true);
      loadSamples()
        .then((results) => {
          setSamples(results);
          setLoadingSamples(false);
        })
        .catch((error) => {
          console.error("Failed to load samples:", error);
          setLoadingSamples(false);
        });
    }
  }, [enabled, samplesDrawerOpen, loadSamples]);

  // Load existing templates
  useEffect(() => {
    if (enabled && loadTemplates) {
      setLoadingTemplates(true);
      loadTemplates()
        .then((results) => {
          setTemplates(results);
          setLoadingTemplates(false);
        })
        .catch((error) => {
          console.error("Failed to load templates:", error);
          setLoadingTemplates(false);
        });
    }
  }, [enabled, loadTemplates]);

  // Listen for template list updates
  useEffect(() => {
    const handleTemplateListUpdate = (e: CustomEvent<SampleTemplate[]>) => {
      setTemplates(e.detail);
    };

    window.addEventListener('templateListUpdated', handleTemplateListUpdate as EventListener);
    return () => window.removeEventListener('templateListUpdated', handleTemplateListUpdate as EventListener);
  }, []);

  // Refresh templates list when localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'savedTemplates' && loadTemplates) {
        loadTemplates().then(setTemplates);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadTemplates]);

  // Handle opening the new template dialog
  const handleNewTemplateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setNewTemplateDialogOpen(true);
  };

  // Handle creating a new empty template with a name
  const handleCreateNewTemplate = async (templateName: string) => {
    // Get empty configuration
    const emptyConfig = await getConfiguration("#");

    // Set the document with empty config
    resetDocument(emptyConfig);

    // Store the new template in localStorage
    const templateId = `template-${Date.now()}`;

    const storedTemplate = {
      id: templateId,
      name: templateName,
      content: emptyConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Get existing templates
    const existingTemplatesJSON = localStorage.getItem("savedTemplates");
    const existingTemplates = existingTemplatesJSON
      ? JSON.parse(existingTemplatesJSON)
      : [];

    // Add new template
    existingTemplates.push(storedTemplate);

    // Save to localStorage
    localStorage.setItem("savedTemplates", JSON.stringify(existingTemplates));
    localStorage.setItem("lastEditedTemplate", JSON.stringify(emptyConfig));
    localStorage.setItem("lastEditedTemplateId", templateId);
    localStorage.setItem("lastEditedTemplateName", templateName);

    // Refresh templates list
    if (loadTemplates) {
      loadTemplates().then(setTemplates);
    }

    window.location.hash = "#"; // Update the URL hash
  };

  if (!enabled) {
    return null;
  }

  return (
    <>
      <Drawer
        variant="persistent"
        anchor="left"
        open={samplesDrawerOpen}
        slotProps={{
          backdrop: { style: { position: "absolute" } },
        }}
        PaperProps={{
          style: { position: "absolute" },
        }}
        ModalProps={{
          container: document.getElementById("drawer-container"),
          style: { position: "absolute" },
          keepMounted: true,
        }}
        transitionDuration={{
          enter: enterDuration,
          exit: exitDuration,
        }}
        sx={{
          width: samplesDrawerOpen ? SAMPLES_DRAWER_WIDTH : 0,
        }}
      >
        <Stack
          spacing={3}
          py={1}
          px={2}
          width={SAMPLES_DRAWER_WIDTH}
          justifyContent="space-between"
          height="100%"
        >
          <Stack
            spacing={2}
            sx={{
              "& .MuiButtonBase-root": {
                width: "100%",
                justifyContent: "flex-start",
              },
            }}
          >
            <Typography variant="h6" component="h1" sx={{ p: 2 }}>
              Templates
            </Typography>

            {/* New Template Button */}
            <Button
              href="#"
              onClick={handleNewTemplateClick}
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{
                mb: 1,
                borderRadius: 1,
                textTransform: "none",
                justifyContent: "flex-start",
                px: 2,
              }}
            >
              Create New Template
            </Button>

            {/* Existing Templates Section */}
            {loadTemplates && (
              <>
                <Typography
                  variant="subtitle2"
                  component="h2"
                  sx={{ fontWeight: "bold", mt: 2 }}
                >
                  Your Templates
                </Typography>

                {loadingTemplates ? (
                  <Stack alignItems="center" width="100%" py={1}>
                    <CircularProgress size={24} />
                  </Stack>
                ) : templates.length > 0 ? (
                  <Stack alignItems="flex-start" width="100%">
                    {templates.map((template) => (
                      <Box
                        key={template.id}
                        width="100%"
                        display="flex"
                        alignItems="center"
                        sx={{
                          bgcolor: currentTemplateId === template.id
                            ? "rgba(0, 0, 0, 0.08)"
                            : "transparent",
                          borderRadius: 1,
                          "&:hover": {
                            bgcolor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        <SidebarButton
                          href={`#template/${template.id}`}
                          templateLoader={loadTemplate
                            ? () => loadTemplate(template.id)
                            : undefined}
                          sx={{ flexGrow: 1 }}
                        >
                          {template.name}
                        </SidebarButton>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", py: 1 }}
                  >
                    No saved templates
                  </Typography>
                )}

                <Divider />
              </>
            )}

            {/* Sample Templates Section */}
            {loadSamples && (
              <>
                <Typography
                  variant="subtitle2"
                  component="h2"
                  sx={{ fontWeight: "bold", mt: 1 }}
                >
                  Sample Templates
                </Typography>

                {loadingSamples ? (
                  <Stack alignItems="center" width="100%" py={1}>
                    <CircularProgress size={24} />
                  </Stack>
                ) : (
                  <Stack alignItems="flex-start">
                    {samples.map((sample) => (
                      <SidebarButton
                        key={sample.id}
                        href={`#sample/${sample.id}`}
                        templateLoader={loadTemplate
                          ? () => loadTemplate(sample.id)
                          : undefined}
                      >
                        {sample.name}
                      </SidebarButton>
                    ))}
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </Stack>
      </Drawer>

      <SaveTemplateDialog
        open={newTemplateDialogOpen}
        onClose={() => setNewTemplateDialogOpen(false)}
        onSave={handleCreateNewTemplate}
        defaultName="New Template"
      />
    </>
  );
}
