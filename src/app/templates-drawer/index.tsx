import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Divider,
  Drawer,
  Stack,
  Typography,
} from "@mui/material";
import { useSamplesDrawerOpen } from "@editor/editor-context";
import { SampleTemplate } from "../index";
import { TEditorConfiguration } from "@editor/core";
import SidebarButton from "./sidebar-button";
import EMPTY_EMAIL_MESSAGE from "@sample/empty-email-message";

export const SAMPLES_DRAWER_WIDTH = 240;

// Empty template definition that will always be available
const EMPTY_TEMPLATE: SampleTemplate = {
  id: "empty-email",
  name: "Empty email",
  description: "A blank email template to start from scratch",
};

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
   * Callback to delete a template by ID
   */
  deleteTemplate?: (templateId: string) => void;
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
}: SamplesDrawerProps) {
  const samplesDrawerOpen = useSamplesDrawerOpen();
  const [samples, setSamples] = useState<SampleTemplate[]>([EMPTY_TEMPLATE]);
  const [templates, setTemplates] = useState<SampleTemplate[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Special handler for empty template
  const handleLoadTemplate = async (templateId: string) => {
    if (templateId === "empty-email") {
      return EMPTY_EMAIL_MESSAGE;
    }
    
    if (loadTemplate) {
      return loadTemplate(templateId);
    }
    
    return null;
  };

  // Load samples
  useEffect(() => {
    if (enabled && samplesDrawerOpen && loadSamples) {
      setLoadingSamples(true);
      loadSamples()
        .then((results) => {
          // Ensure we always have the empty template
          const existingEmptyTemplate = results.find(sample => sample.id === "empty-email");
          if (!existingEmptyTemplate) {
            setSamples([EMPTY_TEMPLATE, ...results]);
          } else {
            setSamples(results);
          }
          setLoadingSamples(false);
        })
        .catch((error) => {
          console.error("Failed to load samples:", error);
          setSamples([EMPTY_TEMPLATE]); // Fallback to empty template
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

  if (!enabled) {
    return null;
  }

  return (
    <>
      <Drawer
        variant="persistent"
        anchor="left"
        open={samplesDrawerOpen}
        componentsProps={{
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
                          templateLoader={() => handleLoadTemplate(template.id)}
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
                      templateLoader={() => handleLoadTemplate(sample.id)}
                    >
                      {sample.name}
                    </SidebarButton>
                  ))}
                </Stack>
              )}
            </>
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
}
