import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import PropTypes from "prop-types"
import { getTranslation } from "../../data/translations.js"

const sanitizeSimpleHtml = (input) => {
  if (!input) return ""
  const template = document.createElement("template")
  template.innerHTML = String(input)
  const allowed = new Set(["B", "STRONG", "I", "EM", "U", "S", "STRIKE", "DEL", "UL", "OL", "LI", "BR", "P", "DIV", "SPAN"])

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

function RichTextField({ value, onChange, placeholder, t }) {
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
          className="w-full min-h-[84px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 [&_p]:m-0 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_br]:leading-none [&_u]:underline [&_s]:line-through [&_del]:line-through [&_strike]:line-through"
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

const InvoiceDetailsForm = React.memo(function InvoiceDetailsForm({
  details,
  onChange,
  user,
  settings,
}) {
  const isPremium = user && user.plan === "premium"
  const t = (key) => getTranslation(settings?.language, key)

  const headerTitleNormalized = String(details.headerTitle || "").trim().toLowerCase()
  const isQuotation =
    headerTitleNormalized.startsWith("quotation") ||
    headerTitleNormalized.startsWith("penawaran") ||
    headerTitleNormalized === String(t("quotation")).trim().toLowerCase()
  const documentTypeValue = isQuotation ? "quotation" : "invoice"

  const numberLabel = isQuotation ? t("quotationNumber") : t("number")
  const dateLabel = isQuotation ? t("quotationDate") : t("date")
  const dueDateLabel = isQuotation ? t("validUntil") : t("dueDate")

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{t("details")}</h2>
      <div>
        <label className="block text-sm text-gray-600 mb-1">{t("documentType")}</label>
        <select
          value={documentTypeValue}
          onChange={(e) => {
            const type = e.target.value
            onChange({
              headerTitle: type === "quotation" ? t("quotation") : t("invoice")
            })
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="invoice">{t("invoice")}</option>
          <option value="quotation">{t("quotation")}</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">{t("headerTitle")}</label>
        <input
          type="text"
          value={details.headerTitle || t(documentTypeValue)}
          onChange={(e) => {
            if (e.target.value.length <= 30) {
              onChange({ headerTitle: e.target.value })
            }
          }}
          maxLength={30}
          placeholder={t("placeholderHeader")}
          readOnly={!isPremium}
          className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${!isPremium ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />
        {!isPremium && (
          <p className="text-xs text-gray-500 mt-1">{t("upgradeToPremiumHeader")}</p>
        )}
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          {numberLabel} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={details.number}
          onChange={(e) => onChange({ number: e.target.value })}
          placeholder={t("invoiceNumber")}
          readOnly={!isPremium}
          className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${!isPremium ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />
        {!isPremium && (
          <p className="text-xs text-gray-500 mt-1">{t("upgradeToPremiumNumber")}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {dateLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={details.invoiceDate}
            onChange={(e) => onChange({ invoiceDate: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {dueDateLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={details.dueDate}
            onChange={(e) => onChange({ dueDate: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>
      <RichTextField
        value={details.notes}
        onChange={(v) => onChange({ notes: v })}
        placeholder={t("notes")}
        t={t}
      />
      <RichTextField
        value={details.terms}
        onChange={(v) => onChange({ terms: v })}
        placeholder={t("terms")}
        t={t}
      />
    </div>
  )
})

InvoiceDetailsForm.propTypes = {
  details: PropTypes.shape({
    number: PropTypes.string,
    invoiceDate: PropTypes.string,
    dueDate: PropTypes.string,
    notes: PropTypes.string,
    terms: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  user: PropTypes.object,
  settings: PropTypes.object
}

export default InvoiceDetailsForm
