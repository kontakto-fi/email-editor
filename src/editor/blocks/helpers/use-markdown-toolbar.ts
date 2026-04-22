import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

export type MarkdownToolbarSelection = { start: number; end: number };

type Options = {
  text: string;
  isSelected: boolean;
  commitText: (newText: string) => void;
  trackSelection?: (selection: MarkdownToolbarSelection) => void;
};

export function useMarkdownToolbar({ text, isSelected, commitText, trackSelection }: Options) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [selection, setSelection] = useState<MarkdownToolbarSelection>({ start: 0, end: 0 });
  const [linkPrompt, setLinkPrompt] = useState(false);
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
      setLinkPrompt(false);
    }
  }, [isSelected, selection.start, selection.end]);

  const wrapSelection = (prefix: string, suffix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? selection.start;
    const end = ta.selectionEnd ?? selection.end;
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

  const handleLinkRequest = () => {
    if (selection.start === selection.end) return;
    setLinkPrompt(true);
  };

  const handleLinkSubmit = (url: string) => {
    const start = selection.start;
    const end = selection.end;
    if (start === end) {
      setLinkPrompt(false);
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
    setLinkPrompt(false);
  };

  const handleLinkCancel = () => {
    setLinkPrompt(false);
    textareaRef.current?.focus();
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
    } else if (key === 'k') {
      e.preventDefault();
      handleLinkRequest();
    }
  };

  const toolbarVisible = isSelected && (selection.start !== selection.end || linkPrompt);

  return {
    textareaRef: textareaRef as RefObject<HTMLTextAreaElement>,
    selection,
    trackFocus,
    handleKeyDown,
    toolbarProps: {
      visible: toolbarVisible,
      linkPrompt,
      onBold: handleBold,
      onItalic: handleItalic,
      onLinkRequest: handleLinkRequest,
      onLinkSubmit: handleLinkSubmit,
      onLinkCancel: handleLinkCancel,
    },
  };
}
