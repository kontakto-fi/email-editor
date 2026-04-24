import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

export type MarkdownToolbarSelection = { start: number; end: number };
export type MarkdownToolbarPrompt = 'none' | 'link' | 'color' | 'font';

type Options = {
  text: string;
  isSelected: boolean;
  commitText: (newText: string) => void;
  trackSelection?: (selection: MarkdownToolbarSelection) => void;
};

export function useMarkdownToolbar({ text, isSelected, commitText, trackSelection }: Options) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [selection, setSelection] = useState<MarkdownToolbarSelection>({ start: 0, end: 0 });
  const [activePrompt, setActivePrompt] = useState<MarkdownToolbarPrompt>('none');
  const pendingSelectionRef = useRef<MarkdownToolbarSelection | null>(null);

  const textRef = useRef(text);
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  const syncSelection = useCallback(
    (start: number, end: number) => {
      const next = { start, end };
      setSelection(next);
      trackSelection?.(next);
    },
    [trackSelection]
  );

  const trackFocus = useCallback(
    (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const el = e.currentTarget;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      syncSelection(start, end);
    },
    [syncSelection]
  );

  useEffect(() => {
    const target = pendingSelectionRef.current;
    if (!target) return;
    const ta = textareaRef.current;
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(target.start, target.end);
    syncSelection(target.start, target.end);
    pendingSelectionRef.current = null;
  }, [text, syncSelection]);

  useEffect(() => {
    if (!isSelected || selection.start === selection.end) {
      setActivePrompt('none');
    }
  }, [isSelected, selection.start, selection.end]);

  const wrapSelection = (prefix: string, suffix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    // Prefer the textarea's live selection when it's non-empty. If the
    // textarea's DOM selection has collapsed (e.g. because a native color
    // picker briefly stole focus), fall back to the last tracked React-state
    // selection so async popover flows still find the right range.
    let start = ta.selectionStart ?? selection.start;
    let end = ta.selectionEnd ?? selection.end;
    if (start === end) {
      start = selection.start;
      end = selection.end;
    }
    if (start === end) return;
    const current = textRef.current;
    const selected = current.slice(start, end);
    const before = current.slice(0, start);
    const after = current.slice(end);
    const wrapped = `${prefix}${selected}${suffix}`;
    const newText = `${before}${wrapped}${after}`;
    const newStart = start + prefix.length;
    const newEnd = newStart + selected.length;
    pendingSelectionRef.current = { start: newStart, end: newEnd };
    commitText(newText);
  };

  const handleBold = () => wrapSelection('**', '**');
  const handleItalic = () => wrapSelection('*', '*');
  const handleUnderline = () => wrapSelection('<u>', '</u>');
  const handleOverline = () =>
    wrapSelection('<span style="text-decoration:overline">', '</span>');

  const openPrompt = (kind: Exclude<MarkdownToolbarPrompt, 'none'>) => {
    if (selection.start === selection.end) return;
    setActivePrompt(kind);
  };
  const cancelPrompt = () => {
    setActivePrompt('none');
    textareaRef.current?.focus();
  };

  const handleLinkRequest = () => openPrompt('link');
  const handleColorRequest = () => openPrompt('color');
  const handleFontRequest = () => openPrompt('font');

  const handleLinkSubmit = (url: string) => {
    const start = selection.start;
    const end = selection.end;
    if (start === end) {
      setActivePrompt('none');
      return;
    }
    const current = textRef.current;
    const selected = current.slice(start, end);
    const before = current.slice(0, start);
    const after = current.slice(end);
    const wrapped = `[${selected}](${url})`;
    const newText = `${before}${wrapped}${after}`;
    const newStart = start + wrapped.length;
    pendingSelectionRef.current = { start: newStart, end: newStart };
    commitText(newText);
    setActivePrompt('none');
  };

  const handleColorSubmit = (color: string) => {
    wrapSelection(`<span style="color: ${color}">`, '</span>');
    setActivePrompt('none');
  };

  const handleFontSubmit = (fontFamily: string) => {
    wrapSelection(`<span style="font-family: ${fontFamily}">`, '</span>');
    setActivePrompt('none');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const key = e.key.toLowerCase();
    if (key === 'b') {
      e.preventDefault();
      handleBold();
    } else if (key === 'i') {
      e.preventDefault();
      handleItalic();
    } else if (key === 'u') {
      e.preventDefault();
      handleUnderline();
    } else if (key === 'k') {
      e.preventDefault();
      handleLinkRequest();
    }
  };

  const toolbarVisible = isSelected && (selection.start !== selection.end || activePrompt !== 'none');

  return {
    textareaRef: textareaRef as RefObject<HTMLTextAreaElement>,
    selection,
    trackFocus,
    handleKeyDown,
    toolbarProps: {
      visible: toolbarVisible,
      activePrompt,
      onBold: handleBold,
      onItalic: handleItalic,
      onUnderline: handleUnderline,
      onOverline: handleOverline,
      onLinkRequest: handleLinkRequest,
      onLinkSubmit: handleLinkSubmit,
      onColorRequest: handleColorRequest,
      onColorSubmit: handleColorSubmit,
      onFontRequest: handleFontRequest,
      onFontSubmit: handleFontSubmit,
      onPromptCancel: cancelPrompt,
    },
  };
}
