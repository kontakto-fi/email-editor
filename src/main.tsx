import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  Box,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
import EmailEditor, { SampleTemplate } from "./app";
import { TEditorConfiguration } from "@editor/core";
import theme from "./theme";
import { StoredTemplate } from "./app/context";
import WELCOME from "@sample/welcome";
import RESET_PASSWORD from "@sample/reset-password";
import EMPTY_EMAIL_MESSAGE from "@sample/empty-email-message";

// Wrapper component to handle sample loading and context initialization
const EmailEditorWrapper = () => {
  const [initialTemplate, setInitialTemplate] = useState<
    TEditorConfiguration | null
  >(null);
  const [initialTemplateId, setInitialTemplateId] = useState<string | null>(
    null,
  );
  const [initialTemplateName, setInitialTemplateName] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Load initial template on mount
  useEffect(() => {
    const loadInitialTemplate = async () => {
      try {
        const lastEditedTemplate = localStorage.getItem("lastEditedTemplate");
        if (lastEditedTemplate) {
          setInitialTemplate(JSON.parse(lastEditedTemplate));
          setInitialTemplateId(localStorage.getItem("lastEditedTemplateId"));
          setInitialTemplateName(
            localStorage.getItem("lastEditedTemplateName"),
          );
        } else {
          setInitialTemplate(WELCOME);
        }
      } catch (error) {
        console.error("Error loading initial template:", error);
        setInitialTemplate(EMPTY_EMAIL_MESSAGE);
      } finally {
        setLoading(false);
      }
    };
    loadInitialTemplate();
  }, []);

  // Handle saving templates to localStorage
  const handleSave = (template: TEditorConfiguration) => {
    try {
      // Always save last edited template
      localStorage.setItem("lastEditedTemplate", JSON.stringify(template));

      const currentId = localStorage.getItem("lastEditedTemplateId");
      const currentName = localStorage.getItem("lastEditedTemplateName");

      // If we're saving a sample template or there's no current template, create a new one
      if (!currentId || currentId === "welcome") {
        const templateId = `template-${Date.now()}`;
        const templateName = currentName || "New Template";
        const currentTime = new Date().toISOString();

        const newTemplate: StoredTemplate = {
          id: templateId,
          name: templateName,
          content: template,
          createdAt: currentTime,
          updatedAt: currentTime,
        };

        // Get existing templates and add the new one
        const existingTemplatesJSON = localStorage.getItem("savedTemplates");
        const existingTemplates: StoredTemplate[] = existingTemplatesJSON
          ? JSON.parse(existingTemplatesJSON)
          : [];
        existingTemplates.push(newTemplate);

        // Save updated templates list
        localStorage.setItem(
          "savedTemplates",
          JSON.stringify(existingTemplates),
        );

        // Update current template info
        localStorage.setItem("lastEditedTemplateId", templateId);
        localStorage.setItem("lastEditedTemplateName", templateName);
        return;
      }

      // Otherwise update existing template
      if (currentId && currentName) {
        const existingTemplatesJSON = localStorage.getItem("savedTemplates");
        const existingTemplates: StoredTemplate[] = existingTemplatesJSON
          ? JSON.parse(existingTemplatesJSON)
          : [];
        const templateIndex = existingTemplates.findIndex((t) =>
          t.id === currentId
        );

        if (templateIndex >= 0) {
          existingTemplates[templateIndex] = {
            ...existingTemplates[templateIndex],
            content: template,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(
            "savedTemplates",
            JSON.stringify(existingTemplates),
          );
        }
      }
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  // Load available templates
  const handleLoadTemplates = async (): Promise<SampleTemplate[]> => {
    try {
      const savedTemplatesJSON = localStorage.getItem("savedTemplates");
      if (!savedTemplatesJSON) return [];

      const savedTemplates: StoredTemplate[] = JSON.parse(savedTemplatesJSON);
      return savedTemplates.map((template) => ({
        id: template.id,
        name: template.name,
        description: `Last updated: ${
          new Date(template.updatedAt).toLocaleString()
        }`,
      }));
    } catch (error) {
      console.error("Error loading templates:", error);
      return [];
    }
  };

  // Load sample templates
  const handleLoadSamples = async (): Promise<SampleTemplate[]> => {
    return [
      {
        id: "welcome",
        name: "Welcome email",
        description: "A simple welcome email template",
      },
      {
        id: "reset-password",
        name: "Reset password",
        description: "Password reset email template",
      },
      {
        id: "empty-email",
        name: "Empty email",
        description: "A blank email template to start from scratch",
      },
    ];
  };

  // Load a specific template by ID
  const handleLoadTemplate = async (
    templateId: string,
  ): Promise<TEditorConfiguration | null> => {
    if (templateId === "welcome") {
      return WELCOME;
    }
    
    if (templateId === "reset-password") {
      return RESET_PASSWORD;
    }
    
    if (templateId === "empty-email") {
      return EMPTY_EMAIL_MESSAGE;
    }

    try {
      const savedTemplatesJSON = localStorage.getItem("savedTemplates");
      if (!savedTemplatesJSON) return null;

      const savedTemplates: StoredTemplate[] = JSON.parse(savedTemplatesJSON);
      const template = savedTemplates.find((t) => t.id === templateId);

      if (template) {
        // Update last edited template info
        localStorage.setItem(
          "lastEditedTemplate",
          JSON.stringify(template.content),
        );
        localStorage.setItem("lastEditedTemplateId", template.id);
        localStorage.setItem("lastEditedTemplateName", template.name);
        return template.content;
      }
    } catch (error) {
      console.error("Error loading template:", error);
    }
    return null;
  };

  // Handle template deletion
  const handleDeleteTemplate = (templateId: string) => {
    try {
      const existingTemplatesJSON = localStorage.getItem("savedTemplates");
      if (!existingTemplatesJSON) return;

      const existingTemplates: StoredTemplate[] = JSON.parse(
        existingTemplatesJSON,
      );
      const updatedTemplates = existingTemplates.filter((template) =>
        template.id !== templateId
      );
      localStorage.setItem("savedTemplates", JSON.stringify(updatedTemplates));

      // Clear current template if it was deleted
      const currentTemplateId = localStorage.getItem("lastEditedTemplateId");
      if (currentTemplateId === templateId) {
        localStorage.removeItem("lastEditedTemplateId");
        localStorage.removeItem("lastEditedTemplateName");
        // If current template was deleted, load empty template
        setInitialTemplate(EMPTY_EMAIL_MESSAGE);
      }
      
      // Dispatch event to notify components about template deletion
      const templateListUpdatedEvent = new CustomEvent('templateListUpdated', {
        detail: updatedTemplates.map((template: StoredTemplate) => ({
          id: template.id,
          name: template.name,
          description: `Last updated: ${new Date(template.updatedAt).toLocaleString()}`,
        }))
      });
      window.dispatchEvent(templateListUpdatedEvent);
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  // Handle template copying
  const handleCopyTemplate = (templateName: string, content: any) => {
    try {
      // Get existing templates
      const existingTemplatesJSON = localStorage.getItem('savedTemplates');
      const existingTemplates: StoredTemplate[] = existingTemplatesJSON 
        ? JSON.parse(existingTemplatesJSON) 
        : [];

      // Create new template
      const templateId = `template-${Date.now()}`;
      const newTemplate: StoredTemplate = {
        id: templateId,
        name: templateName,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to templates
      existingTemplates.push(newTemplate);
      localStorage.setItem('savedTemplates', JSON.stringify(existingTemplates));

      // Dispatch event to notify components about the new template
      const templateListUpdatedEvent = new CustomEvent('templateListUpdated', {
        detail: existingTemplates.map((template: StoredTemplate) => ({
          id: template.id,
          name: template.name,
          description: `Last updated: ${new Date(template.updatedAt).toLocaleString()}`,
        }))
      });
      window.dispatchEvent(templateListUpdatedEvent);
    } catch (error) {
      console.error("Error copying template:", error);
    }
  };

  // Handle saving a template with a new name
  const handleSaveAs = async (templateName: string, content: any): Promise<{id: string, name: string}> => {
    try {
      // Create new template ID
      const templateId = `template-${Date.now()}`;

      // Get existing templates
      const existingTemplatesJSON = localStorage.getItem('savedTemplates');
      const existingTemplates = existingTemplatesJSON ? JSON.parse(existingTemplatesJSON) : [];

      // Create new template
      const newTemplate = {
        id: templateId,
        name: templateName,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to templates
      existingTemplates.push(newTemplate);
      localStorage.setItem('savedTemplates', JSON.stringify(existingTemplates));

      // Update current template info
      localStorage.setItem('lastEditedTemplate', JSON.stringify(content));
      localStorage.setItem('lastEditedTemplateId', templateId);
      localStorage.setItem('lastEditedTemplateName', templateName);

      // Dispatch event to notify components about template list update
      const templateListUpdatedEvent = new CustomEvent('templateListUpdated', {
        detail: existingTemplates.map((template: StoredTemplate) => ({
          id: template.id,
          name: template.name,
          description: `Last updated: ${new Date(template.updatedAt).toLocaleString()}`,
        }))
      });
      window.dispatchEvent(templateListUpdatedEvent);

      return { id: templateId, name: templateName };
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <EmailEditor
      persistenceEnabled={true}
      initialTemplate={initialTemplate || undefined}
      initialTemplateId={initialTemplateId || undefined}
      initialTemplateName={initialTemplateName || undefined}
      onSave={handleSave}
      loadSamples={handleLoadSamples}
      loadTemplates={handleLoadTemplates}
      loadTemplate={handleLoadTemplate}
      deleteTemplate={handleDeleteTemplate}
      copyTemplate={handleCopyTemplate}
      saveAs={handleSaveAs}
    />
  );
};

// Get the existing root element
const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <div>
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <EmailEditorWrapper />
    </ThemeProvider>
  </div>,
);
