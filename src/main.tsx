import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Box, CircularProgress } from "@mui/material";
import EmailEditor, { TemplateListItem } from "./app";
import type { LibraryImage, UploadedImage } from "./app/image-context";
import type { SavePayload } from "./app/save-payload";
import { TEditorConfiguration } from "@editor/core";
import theme from "./theme";
import { StoredTemplate } from "./app/context";
import WELCOME from "@sample/welcome";
import RESET_PASSWORD from "@sample/reset-password";
import EMPTY_EMAIL_MESSAGE from "@sample/empty-email-message";

function storedToListItem(t: StoredTemplate): TemplateListItem {
  return {
    id: t.id,
    slug: t.name,
    kind: t.kind ?? "template",
    description: t.description,
    subject: t.subject,
    tags: t.tags,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

function readStoredTemplates(): StoredTemplate[] {
  try {
    const raw = localStorage.getItem("savedTemplates");
    if (!raw) return [];
    return JSON.parse(raw) as StoredTemplate[];
  } catch (error) {
    console.error("Error reading savedTemplates:", error);
    return [];
  }
}

function writeStoredTemplates(items: StoredTemplate[]) {
  localStorage.setItem("savedTemplates", JSON.stringify(items));
}

function broadcastTemplateList(items: StoredTemplate[]) {
  const event = new CustomEvent<TemplateListItem[]>("templateListUpdated", {
    detail: items.map(storedToListItem),
  });
  window.dispatchEvent(event);
}

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

  // Handle saving templates to localStorage. The dev app stashes the rendered
  // bodyHtml/bodyText alongside the source so we can verify they round-tripped.
  const handleSave = (payload: SavePayload) => {
    try {
      const template = payload.editorConfig;
      localStorage.setItem("lastEditedTemplate", JSON.stringify(template));
      localStorage.setItem("lastSavedPayload", JSON.stringify({
        subject: payload.subject,
        variables: payload.variables,
        bodyHtmlLength: payload.bodyHtml.length,
        bodyTextLength: payload.bodyText.length,
      }));

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
          subject: payload.subject,
          createdAt: currentTime,
          updatedAt: currentTime,
        };

        const existing = readStoredTemplates();
        existing.push(newTemplate);
        writeStoredTemplates(existing);

        localStorage.setItem("lastEditedTemplateId", templateId);
        localStorage.setItem("lastEditedTemplateName", templateName);
        broadcastTemplateList(existing);
        return;
      }

      // Otherwise update existing template
      if (currentId && currentName) {
        const existing = readStoredTemplates();
        const index = existing.findIndex((t) => t.id === currentId);
        if (index >= 0) {
          existing[index] = {
            ...existing[index],
            content: template,
            subject: payload.subject,
            updatedAt: new Date().toISOString(),
          };
          writeStoredTemplates(existing);
          broadcastTemplateList(existing);
        }
      }
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  // Load available templates (list endpoint — lean, no editor_config).
  // Returns every user-scoped row regardless of kind; the drawer partitions by `kind`.
  const handleLoadTemplates = async (): Promise<TemplateListItem[]> => {
    return readStoredTemplates().map(storedToListItem);
  };

  // Load sample templates — only the built-in fixtures. User-promoted rows live in loadTemplates.
  const handleLoadSamples = async (): Promise<TemplateListItem[]> => {
    return [
      {
        id: "welcome",
        slug: "Welcome email",
        kind: "sample",
        description: "A simple welcome email template",
        tags: ["marketing"],
      },
      {
        id: "reset-password",
        slug: "Reset password",
        kind: "sample",
        description: "Password reset email template",
        tags: ["transactional"],
      },
      {
        id: "empty-email",
        slug: "Empty email",
        kind: "sample",
        description: "A blank email template to start from scratch",
      },
    ];
  };

  // Load a specific template by ID
  const handleLoadTemplate = async (
    templateId: string,
  ): Promise<TEditorConfiguration | null> => {
    if (templateId === "welcome") return WELCOME;
    if (templateId === "reset-password") return RESET_PASSWORD;
    if (templateId === "empty-email") return EMPTY_EMAIL_MESSAGE;

    try {
      const existing = readStoredTemplates();
      const template = existing.find((t) => t.id === templateId);
      if (template) {
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
      const existing = readStoredTemplates();
      const updated = existing.filter((t) => t.id !== templateId);
      writeStoredTemplates(updated);

      // Clear current template if it was deleted
      const currentTemplateId = localStorage.getItem("lastEditedTemplateId");
      if (currentTemplateId === templateId) {
        localStorage.removeItem("lastEditedTemplateId");
        localStorage.removeItem("lastEditedTemplateName");
        setInitialTemplate(EMPTY_EMAIL_MESSAGE);
      }

      broadcastTemplateList(updated);
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  // Handle template copying (used by duplicate row action)
  const handleCopyTemplate = (templateName: string, content: any) => {
    try {
      const existing = readStoredTemplates();
      const now = new Date().toISOString();
      const newTemplate: StoredTemplate = {
        id: `template-${Date.now()}`,
        name: templateName,
        content,
        createdAt: now,
        updatedAt: now,
      };
      existing.push(newTemplate);
      writeStoredTemplates(existing);
      broadcastTemplateList(existing);
    } catch (error) {
      console.error("Error copying template:", error);
    }
  };

  // Handle promote/demote — flips the stored kind.
  // Built-in samples ('welcome', 'reset-password', 'empty-email') aren't stored locally
  // so promote/demote is a no-op for them in the dev app.
  const handleSetTemplateKind = (
    templateId: string,
    kind: "template" | "sample",
  ) => {
    try {
      const existing = readStoredTemplates();
      const index = existing.findIndex((t) => t.id === templateId);
      if (index < 0) return;
      existing[index] = {
        ...existing[index],
        kind,
        updatedAt: new Date().toISOString(),
      };
      writeStoredTemplates(existing);
      broadcastTemplateList(existing);
    } catch (error) {
      console.error("Error setting template kind:", error);
    }
  };

  // Handle template rename
  const handleRenameTemplate = (templateId: string, newSlug: string) => {
    try {
      const existing = readStoredTemplates();
      const index = existing.findIndex((t) => t.id === templateId);
      if (index < 0) return;
      existing[index] = {
        ...existing[index],
        name: newSlug,
        updatedAt: new Date().toISOString(),
      };
      writeStoredTemplates(existing);

      const currentTemplateId = localStorage.getItem("lastEditedTemplateId");
      if (currentTemplateId === templateId) {
        localStorage.setItem("lastEditedTemplateName", newSlug);
      }

      broadcastTemplateList(existing);
    } catch (error) {
      console.error("Error renaming template:", error);
    }
  };

  // Handle saving a template with a new name. Persists subject + the source
  // editorConfig — the rendered bodyHtml/bodyText would normally go to the
  // backend that sends emails; the dev app just records their lengths to
  // confirm the renderer ran.
  const handleSaveAs = async (
    templateName: string,
    payload: SavePayload,
  ): Promise<{ id: string; slug: string }> => {
    try {
      const templateId = `template-${Date.now()}`;
      const now = new Date().toISOString();
      const newTemplate: StoredTemplate = {
        id: templateId,
        name: templateName,
        content: payload.editorConfig,
        subject: payload.subject,
        createdAt: now,
        updatedAt: now,
      };

      const existing = readStoredTemplates();
      existing.push(newTemplate);
      writeStoredTemplates(existing);

      localStorage.setItem("lastEditedTemplate", JSON.stringify(payload.editorConfig));
      localStorage.setItem("lastEditedTemplateId", templateId);
      localStorage.setItem("lastEditedTemplateName", templateName);
      localStorage.setItem("lastSavedPayload", JSON.stringify({
        subject: payload.subject,
        variables: payload.variables,
        bodyHtmlLength: payload.bodyHtml.length,
        bodyTextLength: payload.bodyText.length,
      }));

      broadcastTemplateList(existing);

      return { id: templateId, slug: templateName };
    } catch (error) {
      console.error("Error saving template:", error);
      throw error;
    }
  };

  // Image upload/library stubs. The real consumer would POST to its own image
  // service; here we stash data URLs in localStorage so the round-trip is fully
  // observable without a backend.
  const handleUploadImage = async (file: File): Promise<UploadedImage> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
    const dims = await new Promise<{ width: number; height: number } | null>(
      (resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve(null);
        img.src = dataUrl;
      },
    );
    const uploaded: UploadedImage = {
      url: dataUrl,
      width: dims?.width,
      height: dims?.height,
      alt: file.name.replace(/\.[^.]+$/, ""),
    };
    try {
      const existing = JSON.parse(localStorage.getItem("uploadedImages") ?? "[]") as LibraryImage[];
      existing.push({ ...uploaded, uploadedAt: new Date().toISOString() });
      localStorage.setItem("uploadedImages", JSON.stringify(existing));
    } catch (error) {
      console.error("Error persisting uploaded image:", error);
    }
    return uploaded;
  };

  const handleLoadImages = async (): Promise<LibraryImage[]> => {
    try {
      return JSON.parse(localStorage.getItem("uploadedImages") ?? "[]") as LibraryImage[];
    } catch {
      return [];
    }
  };

  const handleDeleteImage = async (url: string): Promise<void> => {
    try {
      const existing = JSON.parse(localStorage.getItem("uploadedImages") ?? "[]") as LibraryImage[];
      localStorage.setItem(
        "uploadedImages",
        JSON.stringify(existing.filter((img) => img.url !== url)),
      );
    } catch (error) {
      console.error("Error deleting image:", error);
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
      theme={theme}
      persistenceEnabled={true}
      minHeight="100vh"
      initialTemplate={initialTemplate || undefined}
      initialTemplateId={initialTemplateId || undefined}
      initialTemplateName={initialTemplateName || undefined}
      onSave={handleSave}
      loadSamples={handleLoadSamples}
      loadTemplates={handleLoadTemplates}
      loadTemplate={handleLoadTemplate}
      deleteTemplate={handleDeleteTemplate}
      copyTemplate={handleCopyTemplate}
      renameTemplate={handleRenameTemplate}
      setTemplateKind={handleSetTemplateKind}
      saveAs={handleSaveAs}
      uploadImage={handleUploadImage}
      loadImages={handleLoadImages}
      deleteImage={handleDeleteImage}
    />
  );
};

// Get the existing root element
const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <EmailEditorWrapper />,
);
