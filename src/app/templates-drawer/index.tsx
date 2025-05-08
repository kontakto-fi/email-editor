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
import { useSamplesDrawerOpen } from "@editor/editor-context";
import { SampleTemplate } from "../index";
import SaveTemplateDialog from "../email-canvas/save-template-dialog";
import { TEditorConfiguration } from "@editor/core";
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
  loadTemplate?: (templateId: string) => Promise<TEditorConfiguration | null>;

  /**
   * ID of the currently active template
   */
  currentTemplateId?: string | null;

  /**
   * Callback to create a new empty template
   */
  onCreateTemplate?: (templateName: string) => Promise<void>;
}

export default function SamplesDrawer({
  enterDuration = 225,
  exitDuration = 225,
  enabled = true,
  loadSamples,
  loadTemplates,
  loadTemplate,
  currentTemplateId,
  onCreateTemplate,
}: SamplesDrawerProps) {
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

  // Handle opening the new template dialog
  const handleNewTemplateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setNewTemplateDialogOpen(true);
  };

  // Handle creating a new empty template with a name
  const handleCreateNewTemplate = async (templateName: string) => {
    try {
      await onCreateTemplate?.(templateName);
      setNewTemplateDialogOpen(false);
      
      // Refresh templates list
      if (loadTemplates) {
        const updatedTemplates = await loadTemplates();
        setTemplates(updatedTemplates);
      }
    } catch (error) {
      console.error("Error creating template:", error);
    }
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
            {onCreateTemplate && (
              <Button
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
            )}

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
                          templateId={template.id}
                          templateLoader={() => loadTemplate?.(template.id) ?? Promise.reject()}
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
                        templateId={sample.id}
                        templateLoader={() => loadTemplate?.(sample.id) ?? Promise.reject()}
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
