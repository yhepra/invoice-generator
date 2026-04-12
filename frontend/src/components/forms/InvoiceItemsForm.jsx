import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import PropTypes from "prop-types"
import { getTranslation } from "../../data/translations.js"

const sanitizeSimpleHtml = (input) => {
  if (!input) return ""
  const template = document.createElement("template")
  template.innerHTML = String(input)
  const allowed = new Set([
    "B",
    "STRONG",
    "I",
    "EM",
    "U",
    "S",
    "STRIKE",
    "DEL",
    "UL",
    "OL",
    "LI",
    "BR",
    "P",
    "DIV",
    "SPAN",
  ])

  const walk = (node) => {
    const children = Array.from(node.childNodes || [])
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child
        const tag = el.tagName
        if (tag === "SPAN") {
          const style = String(el.getAttribute("style") || "").toLowerCase()
          const wantsBold =
            style.includes("font-weight") &&
            (style.includes("bold") || style.includes("700") || style.includes("800") || style.includes("900"))
          const wantsItalic = style.includes("font-style") && style.includes("italic")
          const wantsUnderline = style.includes("text-decoration") && style.includes("underline")
          const wantsStrike =
            style.includes("text-decoration") &&
            (style.includes("line-through") || style.includes("strikethrough"))

          const wrappers = []
          if (wantsBold) wrappers.push("STRONG")
          if (wantsItalic) wrappers.push("EM")
          if (wantsUnderline) wrappers.push("U")
          if (wantsStrike) wrappers.push("S")

          if (wrappers.length > 0) {
            let current = null
            let root = null
            for (const w of wrappers) {
              const next = document.createElement(w.toLowerCase())
              if (!root) root = next
              if (current) current.appendChild(next)
              current = next
            }
            while (el.firstChild) current.appendChild(el.firstChild)
            el.replaceWith(root)
            continue
          }
        }
        if (!allowed.has(tag)) {
          const frag = document.createDocumentFragment()
          while (el.firstChild) frag.appendChild(el.firstChild)
          el.replaceWith(frag)
          continue
        }
        for (const attr of Array.from(el.attributes || [])) {
          el.removeAttribute(attr.name)
        }
        walk(el)
      }
    }
  }

  walk(template.content)

  const normalizeBlock = (node) => {
    const children = Array.from(node.childNodes || [])
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child
        if (el.tagName === "DIV") {
          const p = document.createElement("p")
          while (el.firstChild) p.appendChild(el.firstChild)
          el.replaceWith(p)
          normalizeBlock(p)
          continue
        }
        normalizeBlock(el)
      }
    }
  }
  normalizeBlock(template.content)

  return template.innerHTML
}

const normalizeToHtml = (value) => {
  const v = String(value || "")
  if (v.trim() === "") return ""
  if (v.includes("<") && v.includes(">")) return sanitizeSimpleHtml(v)
  const template = document.createElement("template")
  template.textContent = v
  return template.innerHTML.replace(/\n/g, "<br>")
}

const isHtmlEffectivelyEmpty = (html) => {
  const raw = String(html || "")
  if (raw.trim() === "") return true
  const withoutBreaks = raw.replace(/<br\s*\/?>/gi, "\n").replace(/&nbsp;/g, " ")
  const text = withoutBreaks.replace(/<[^>]*>/g, "").replace(/\u00A0/g, " ").trim()
  return text === ""
}

function RichTextItemName({ value, onChange, placeholder, t }) {
  const editorRef = useRef(null)
  const lastHtmlRef = useRef("")
  const [isEmpty, setIsEmpty] = useState(true)

  const htmlValue = useMemo(() => normalizeToHtml(value), [value])

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (lastHtmlRef.current !== htmlValue && el.innerHTML !== htmlValue) {
      el.innerHTML = htmlValue
      lastHtmlRef.current = htmlValue
    }
    setIsEmpty(isHtmlEffectivelyEmpty(el.innerHTML))
  }, [htmlValue])

  const emit = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    const sanitized = sanitizeSimpleHtml(el.innerHTML)
    setIsEmpty(isHtmlEffectivelyEmpty(sanitized))
    lastHtmlRef.current = sanitized
    onChange(sanitized)
  }, [onChange])

  const runCmd = useCallback(
    (cmd) => {
      const el = editorRef.current
      if (!el) return
      el.focus()
      document.execCommand(cmd)
      emit()
    },
    [emit],
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => runCmd("bold")}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          aria-label={t("bold") || "Bold"}
          title={t("bold") || "Bold"}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => runCmd("italic")}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm italic text-gray-700 hover:bg-gray-50"
          aria-label={t("italic") || "Italic"}
          title={t("italic") || "Italic"}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => runCmd("underline")}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm underline text-gray-700 hover:bg-gray-50"
          aria-label={t("underline") || "Underline"}
          title={t("underline") || "Underline"}
        >
          U
        </button>
        <button
          type="button"
          onClick={() => runCmd("strikeThrough")}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm line-through text-gray-700 hover:bg-gray-50"
          aria-label={t("strikethrough") || "Strikethrough"}
          title={t("strikethrough") || "Strikethrough"}
        >
          S
        </button>
        <button
          type="button"
          onClick={() => runCmd("insertUnorderedList")}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
          aria-label={t("bullets") || "Bullets"}
          title={t("bullets") || "Bullets"}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => runCmd("insertOrderedList")}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
          aria-label={t("numbering") || "Numbering"}
          title={t("numbering") || "Numbering"}
        >
          1.
        </button>
      </div>

      <div className="relative">
        {isEmpty ? (
          <div className="pointer-events-none absolute left-3 top-2 text-sm text-gray-400">
            {placeholder}
          </div>
        ) : null}
        <div
          ref={editorRef}
          className="w-full min-h-[44px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 [&_p]:m-0 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_br]:leading-none [&_u]:underline [&_s]:line-through [&_del]:line-through [&_strike]:line-through"
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onKeyUp={emit}
          onBlur={emit}
          onPaste={(e) => {
            e.preventDefault()
            const html = e.clipboardData?.getData("text/html") || ""
            const text = e.clipboardData?.getData("text/plain") || ""
            if (html && html.trim()) {
              const sanitized = sanitizeSimpleHtml(html)
              document.execCommand("insertHTML", false, sanitized)
            } else {
              document.execCommand("insertText", false, text)
            }
            emit()
          }}
        />
      </div>
    </div>
  )
}

const InvoiceItemsForm = React.memo(function InvoiceItemsForm({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onClearItems,
  onMoveUp,
  onMoveDown,
  onMoveItem,
  settings
}) {
  const t = (key) => getTranslation(settings?.language, key);
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  const isInteractiveTarget = useCallback((target) => {
    if (!(target instanceof Element)) return false
    return Boolean(
      target.closest(
        'input, textarea, select, button, a, [contenteditable="true"], [contenteditable=""], [contenteditable]',
      ),
    )
  }, [])

  const getDragProps = useCallback(
    (itemId) => ({
      draggable: true,
      onDragStart: (e) => {
        if (isInteractiveTarget(e.target)) {
          e.preventDefault()
          return
        }
        setDraggingId(itemId)
        setDragOverId(null)
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", String(itemId))
      },
      onDragEnd: () => {
        setDraggingId(null)
        setDragOverId(null)
      },
    }),
    [isInteractiveTarget],
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('items')}</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAddItem}
            className="rounded-md p-2 text-brand-600 hover:bg-brand-50 hover:text-brand-700"
            title={t('addItem')}
            aria-label={t('addItem')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onClearItems}
            className="rounded-md p-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            title={t('removeAll')}
            aria-label={t('removeAll')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2m-9 4v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V10" />
            </svg>
          </button>
        </div>
      </div>
      <div
        className="space-y-4"
        onDragOver={(e) => {
          if (!draggingId) return
          if (e.target !== e.currentTarget) return
          e.preventDefault()
          e.dataTransfer.dropEffect = "move"
        }}
        onDrop={(e) => {
          if (e.target !== e.currentTarget) return
          const dragId =
            draggingId ?? Number(e.dataTransfer?.getData("text/plain") || "")
          if (!dragId) return
          e.preventDefault()
          onMoveItem(dragId, null)
          setDraggingId(null)
          setDragOverId(null)
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={[
              "rounded-lg border border-gray-200 bg-white p-4 shadow-sm",
              draggingId === item.id ? "opacity-60" : "",
              dragOverId === item.id && draggingId !== item.id
                ? "ring-2 ring-brand-400"
                : "",
              "cursor-grab active:cursor-grabbing",
            ]
              .filter(Boolean)
              .join(" ")}
            {...getDragProps(item.id)}
            onDragEnter={() => {
              if (!draggingId) return
              if (draggingId === item.id) return
              setDragOverId(item.id)
            }}
            onDragOver={(e) => {
              if (!draggingId) return
              if (draggingId === item.id) return
              e.preventDefault()
              e.dataTransfer.dropEffect = "move"
            }}
            onDrop={(e) => {
              const dragId =
                draggingId ?? Number(e.dataTransfer?.getData("text/plain") || "")
              if (!dragId) return
              if (dragId === item.id) return
              e.preventDefault()
              e.stopPropagation()
              onMoveItem(dragId, item.id)
              setDraggingId(null)
              setDragOverId(null)
            }}
          >
            <div className="mb-3" {...getDragProps(item.id)}>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('itemName')} <span className="text-red-500">*</span>
              </label>
              <RichTextItemName
                value={item.name}
                onChange={(name) => onUpdateItem(item.id, { name })}
                placeholder={t("placeholderItemName")}
                t={t}
              />
            </div>

            <div className="flex items-end gap-3" {...getDragProps(item.id)}>
              <div className="w-24">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('quantity')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "" || parseFloat(val) >= 0) {
                        onUpdateItem(item.id, { quantity: val })
                    }
                  }}
                  placeholder="0"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-right text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('price')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "" || parseFloat(val) >= 0) {
                        onUpdateItem(item.id, { price: val })
                    }
                  }}
                  placeholder="0.00"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-right text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="w-24">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('taxPercent')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.taxPercent ?? ""}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "" || parseFloat(val) >= 0) {
                        onUpdateItem(item.id, { taxPercent: val })
                    }
                  }}
                  placeholder="0"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-right text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex gap-1 pb-1">
                <button
                  type="button"
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-grab active:cursor-grabbing"
                  title={t("drag") || "Drag"}
                  aria-label={t("drag") || "Drag"}
                >
                  ⠿
                </button>
                <button
                  type="button"
                  onClick={() => onMoveUp(item.id)}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  title={t('moveUp')}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onMoveDown(item.id)}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  title={t('moveDown')}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="rounded-md p-2 text-red-500 hover:bg-red-50 hover:text-red-700"
                  title={t('removeItem')}
                  aria-label={t('removeItem')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4h8v2m-9 4v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V10" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

InvoiceItemsForm.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string,
      quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      taxPercent: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  ).isRequired,
  onAddItem: PropTypes.func.isRequired,
  onUpdateItem: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  onClearItems: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
  onMoveItem: PropTypes.func.isRequired
}

export default InvoiceItemsForm
