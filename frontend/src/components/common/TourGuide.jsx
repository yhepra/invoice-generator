import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const findTarget = (selector) => {
  if (!selector) return null;
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
};

const getRect = (el) => {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (!rect || rect.width === 0 || rect.height === 0) return null;
  return rect;
};

export default function TourGuide({
  open,
  steps,
  stepIndex,
  onClose,
  onNext,
  onBack,
  labels,
}) {
  const step = steps?.[stepIndex] || null;
  const [rect, setRect] = useState(null);
  const rafRef = useRef(null);

  const selector = step?.selector || null;

  const isFirst = stepIndex <= 0;
  const isLast = stepIndex >= (steps?.length || 0) - 1;

  const refresh = useCallback(() => {
    if (!open) return;
    const el = findTarget(selector);
    if (el) {
      const r = getRect(el);
      if (r) {
        setRect(r);
        try {
          el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        } catch (e) {
          void e;
        }
      } else {
        setRect(null);
      }
    } else {
      setRect(null);
    }
  }, [open, selector]);

  useLayoutEffect(() => {
    refresh();
  }, [refresh, stepIndex]);

  useEffect(() => {
    if (!open) return undefined;

    const onWindowChange = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => refresh());
    };

    window.addEventListener("resize", onWindowChange);
    window.addEventListener("scroll", onWindowChange, true);

    return () => {
      window.removeEventListener("resize", onWindowChange);
      window.removeEventListener("scroll", onWindowChange, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open, refresh, selector, stepIndex]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onBack();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onBack, onClose, onNext]);

  const highlightStyle = useMemo(() => {
    if (!open || !rect) return null;
    const pad = 8;
    const top = clamp(rect.top - pad, 8, window.innerHeight - 16);
    const left = clamp(rect.left - pad, 8, window.innerWidth - 16);
    const width = clamp(rect.width + pad * 2, 24, window.innerWidth - left - 8);
    const height = clamp(rect.height + pad * 2, 24, window.innerHeight - top - 8);
    return { top, left, width, height };
  }, [open, rect]);

  const tooltipStyle = useMemo(() => {
    if (!open) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    const w = 360;
    const margin = 12;

    if (!highlightStyle) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }

    const preferredTop = highlightStyle.top + highlightStyle.height + margin;
    const canPlaceBottom = preferredTop + 220 < window.innerHeight;

    const top = canPlaceBottom
      ? preferredTop
      : Math.max(margin, highlightStyle.top - 220 - margin);

    const left = clamp(
      highlightStyle.left + highlightStyle.width / 2 - w / 2,
      margin,
      window.innerWidth - w - margin,
    );

    return { top, left };
  }, [open, highlightStyle]);

  if (!open || !step) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {highlightStyle ? (
        <div
          className="absolute rounded-xl border border-white/30 bg-transparent pointer-events-none"
          style={{
            top: `${highlightStyle.top}px`,
            left: `${highlightStyle.left}px`,
            width: `${highlightStyle.width}px`,
            height: `${highlightStyle.height}px`,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.60)",
          }}
        />
      ) : null}

      <div
        className="absolute w-[360px] max-w-[calc(100vw-24px)] rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/10"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">{step.title}</div>
            <div className="mt-1 text-sm text-gray-600">{step.body}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label={labels.close}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            {stepIndex + 1}/{steps.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              {labels.skip}
            </button>
            <button
              type="button"
              onClick={onBack}
              disabled={isFirst}
              className="rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-40"
            >
              {labels.back}
            </button>
            <button
              type="button"
              onClick={isLast ? onClose : onNext}
              className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              {isLast ? labels.done : labels.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

TourGuide.propTypes = {
  open: PropTypes.bool.isRequired,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      selector: PropTypes.string,
      title: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
    }),
  ).isRequired,
  stepIndex: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  labels: PropTypes.shape({
    next: PropTypes.string.isRequired,
    back: PropTypes.string.isRequired,
    done: PropTypes.string.isRequired,
    skip: PropTypes.string.isRequired,
    close: PropTypes.string.isRequired,
  }).isRequired,
};

