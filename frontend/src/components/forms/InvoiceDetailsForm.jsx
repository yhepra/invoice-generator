import React from "react"
import PropTypes from "prop-types"
import { useNavigate } from "react-router-dom"
import { getTranslation } from "../../data/translations.js"
import WysiwygEditor from "../common/WysiwygEditor.jsx"

const InvoiceDetailsForm = React.memo(function InvoiceDetailsForm({
  details,
  onChange,
  onSettingsChange,
  user,
  settings,
}) {
  const navigate = useNavigate()
  const isPremium = user && (user.plan === "premium" || user.plan === "lifetime")
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
        <label className="block text-sm text-gray-600 mb-1">{t("template") || "Template"}</label>
        <select
          value={settings?.template || "simple"}
          onChange={(e) => {
            const val = e.target.value;
            if ((val === "template1" || val === "template2") && !isPremium) {
              navigate("/upgrade");
              return;
            }
            if (onSettingsChange) onSettingsChange({ template: val });
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="simple">Simple Clean</option>
          <option value="template1">Modern Orange {!isPremium ? "🔒 (Premium)" : ""}</option>
          <option value="template2">Corporate Blue {!isPremium ? "🔒 (Premium)" : ""}</option>
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
      <div>
        <label className="block text-sm text-gray-600 mb-1">{t("notes")}</label>
        <WysiwygEditor
          value={details.notes}
          onChange={(html) => onChange({ notes: html })}
          placeholder={t("notes")}
          ariaLabel={t("notes")}
          minHeight={96}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">{t("terms")}</label>
        <WysiwygEditor
          value={details.terms}
          onChange={(html) => onChange({ terms: html })}
          placeholder={t("terms")}
          ariaLabel={t("terms")}
          minHeight={96}
        />
      </div>
    </div>
  )
})

InvoiceDetailsForm.propTypes = {
  details: PropTypes.shape({
    number: PropTypes.string,
    invoiceDate: PropTypes.string,
    dueDate: PropTypes.string,
    notes: PropTypes.string,
    terms: PropTypes.string,
    headerTitle: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSettingsChange: PropTypes.func,
  user: PropTypes.object,
  settings: PropTypes.object
}

export default InvoiceDetailsForm
