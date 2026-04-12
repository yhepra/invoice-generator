import React, { useCallback, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { sanitizeRichText } from "../../utils/sanitizeRichText.js";

const IconBold = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M7 5h6a4 4 0 010 8H7z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 13h7a4 4 0 010 8H7z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconItalic = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M19 4h-7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 20H5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 4l-4 16" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconUnderline = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M7 4v6a5 5 0 0010 0V4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconStrike = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M4 12h16" strokeLinecap="round" />
    <text
      x="12"
      y="12"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="12"
      fontWeight="700"
      fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
      fill="currentColor"
      stroke="none"
    >
      S
    </text>
  </svg>
);

const IconOl = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M10 6h11" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 12h11" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 18h11" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6h2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 12h2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 18h2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconUl = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M10 6h11" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 12h11" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 18h11" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 6h.01" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 12h.01" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 18h.01" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const exec = (command) => {
  try {
    document.execCommand(command);
  } catch (e) {
    void e;
  }
};

export default function WysiwygEditor({
  value,
  onChange,
  placeholder,
  ariaLabel,
  minHeight = 96,
  compact = false,
}) {
  const editorRef = useRef(null);
  const lastValueRef = useRef("");

  const safeValue = useMemo(() => sanitizeRichText(value), [value]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (lastValueRef.current === safeValue) return;
    if (el.innerHTML !== safeValue) {
      el.innerHTML = safeValue;
    }
    lastValueRef.current = safeValue;
  }, [safeValue]);

  const focusEditor = useCallback(() => {
    editorRef.current?.focus();
  }, []);

  const handleCommand = useCallback(
    (command) => {
      focusEditor();
      exec(command);
      const el = editorRef.current;
      if (!el) return;
      const sanitized = sanitizeRichText(el.innerHTML);
      if (sanitized !== el.innerHTML) el.innerHTML = sanitized;
      lastValueRef.current = sanitized;
      onChange(sanitized);
    },
    [focusEditor, onChange],
  );

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const sanitized = sanitizeRichText(el.innerHTML);
    if (sanitized !== el.innerHTML) el.innerHTML = sanitized;
    lastValueRef.current = sanitized;
    onChange(sanitized);
  }, [onChange]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const clipboard = e.clipboardData;
    const rawHtml = clipboard?.getData("text/html") || "";
    const text = clipboard?.getData("text/plain") || "";
    const sanitized = sanitizeRichText(rawHtml || text);
    try {
      document.execCommand("insertHTML", false, sanitized);
    } catch {
      document.execCommand("insertText", false, text);
    }
  }, []);

  return (
    <div className="rounded-md border border-gray-300 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 px-2 py-1">
        <button
          type="button"
          onClick={() => handleCommand("bold")}
          className={`inline-flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${
            compact ? "h-8 w-8" : "h-9 w-9"
          }`}
          aria-label="Bold"
        >
          <IconBold className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => handleCommand("italic")}
          className={`inline-flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${
            compact ? "h-8 w-8" : "h-9 w-9"
          }`}
          aria-label="Italic"
        >
          <IconItalic className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => handleCommand("underline")}
          className={`inline-flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${
            compact ? "h-8 w-8" : "h-9 w-9"
          }`}
          aria-label="Underline"
        >
          <IconUnderline className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => handleCommand("strikeThrough")}
          className={`inline-flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${
            compact ? "h-8 w-8" : "h-9 w-9"
          }`}
          aria-label="Strikethrough"
        >
          <IconStrike className="h-5 w-5" />
        </button>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <button
          type="button"
          onClick={() => handleCommand("insertOrderedList")}
          className={`inline-flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${
            compact ? "h-8 w-8" : "h-9 w-9"
          }`}
          aria-label="Ordered list"
        >
          <IconOl className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => handleCommand("insertUnorderedList")}
          className={`inline-flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${
            compact ? "h-8 w-8" : "h-9 w-9"
          }`}
          aria-label="Unordered list"
        >
          <IconUl className="h-5 w-5" />
        </button>
      </div>

      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label={ariaLabel}
          className={`wysiwyg-content px-3 py-2 text-sm outline-none ${compact ? "min-h-[44px]" : "min-h-[96px]"}`}
          style={{ minHeight }}
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={handleInput}
        />
        {(!safeValue || safeValue === "<br>") && placeholder ? (
          <div className="pointer-events-none absolute left-3 top-2 text-sm text-gray-400">
            {placeholder}
          </div>
        ) : null}
      </div>
    </div>
  );
}

WysiwygEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  ariaLabel: PropTypes.string,
  minHeight: PropTypes.number,
  compact: PropTypes.bool,
};
