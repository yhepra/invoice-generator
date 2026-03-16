import React from "react"
import PropTypes from "prop-types"
import formatCurrency from "../utils/formatCurrency.js"
import itemTotal from "../utils/itemTotal.js"
import { getTranslation } from "../data/translations.js"

export default function CompactInvoice({ invoice }) {
  const { seller, customer, details, items, totals, settings } = invoice
  const t = (key) => getTranslation(settings.language, key)
  const headerTitleNormalized = String(details.headerTitle || "").trim().toLowerCase()
  const isQuotation =
    headerTitleNormalized.startsWith("quotation") ||
    headerTitleNormalized.startsWith("penawaran") ||
    headerTitleNormalized === String(t("quotation")).trim().toLowerCase()
  const numberLabel = isQuotation ? t("quotationNumber") : t("number")
  const dateLabel = isQuotation ? t("quotationDate") : t("date")
  const dueDateLabel = isQuotation ? t("validUntil") : t("dueDate")

  return (
    <div className="invoice-content flex w-full flex-col bg-white text-sm text-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{details.headerTitle || t("invoice")}</h1>
          <p className="text-xs text-gray-600">{seller.name}</p>
          {seller.address ? <p className="text-xs text-gray-600">{seller.address}</p> : null}
          {seller.phone ? <p className="text-xs text-gray-600">{seller.phone}</p> : null}
          {seller.email ? <p className="text-xs text-gray-600">{seller.email}</p> : null}
        </div>
        <div className="text-right">
          {seller.logo ? (
            <img src={seller.logo} alt="Logo" className="h-16 w-auto object-contain ml-auto" />
          ) : null}
          <p className="mt-2 text-xs font-semibold">{numberLabel}</p>
          <p className="text-xs text-gray-700">{details.number}</p>
          <p className="mt-2 text-xs font-semibold">{dateLabel}</p>
          <p className="text-xs text-gray-700">{formatDate(details.invoiceDate)}</p>
          <p className="mt-2 text-xs font-semibold">{dueDateLabel}</p>
          <p className="text-xs text-gray-700">{formatDate(details.dueDate)}</p>
        </div>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-6 text-xs">
        <div>
          <p className="font-semibold uppercase tracking-wide text-gray-600">{t("from")}</p>
          <p className="mt-1 text-gray-900">{seller.name || t("placeholderName")}</p>
          {seller.address ? <p className="text-gray-700">{seller.address}</p> : null}
          {seller.phone ? <p className="text-gray-700">{seller.phone}</p> : null}
          {seller.email ? <p className="text-gray-700">{seller.email}</p> : null}
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wide text-gray-600">{t("billTo")}</p>
          <p className="mt-1 text-gray-900">{customer.name || t("placeholderName")}</p>
          {customer.address ? <p className="text-gray-700">{customer.address}</p> : null}
          {customer.phone ? <p className="text-gray-700">{customer.phone}</p> : null}
          {customer.email ? <p className="text-gray-700">{customer.email}</p> : null}
        </div>
      </section>

      <section className="mt-4">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600">
              <th className="py-2 text-left font-medium">{t("item")}</th>
              <th className="py-2 text-left font-medium">{t("quantity")}</th>
              <th className="py-2 text-left font-medium">{t("price")}</th>
              <th className="py-2 text-right font-medium">{t("total")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 last:border-b-0">
                <td className="py-2 pr-2 text-gray-900">{item.name}</td>
                <td className="py-2 pr-2 text-gray-700">{item.quantity}</td>
                <td className="py-2 pr-2 text-gray-700">{formatCurrency(Number(item.price || 0), settings)}</td>
                <td className="py-2 text-right text-gray-900">
                  {formatCurrency(itemTotal(item, settings), settings)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="mt-4 ml-auto w-64 text-xs">
        <div className="flex justify-between py-1">
          <span className="text-gray-600">{t("subtotal")}</span>
          <span className="font-medium">{formatCurrency(totals.subtotal, settings)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-600">{t("tax")}</span>
          <span className="font-medium">{formatCurrency(totals.taxAmount, settings)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 mt-2">
          <span className="font-semibold">{t("total")}</span>
          <span className="font-semibold">{formatCurrency(totals.total, settings)}</span>
        </div>
      </div>

      {details.notes ? (
        <section className="invoice-notes mt-3 text-xs">
          <p className="font-semibold text-gray-700">{t("notes")}</p>
          <p className="mt-1 whitespace-pre-line text-gray-700">{details.notes}</p>
        </section>
      ) : null}

      {details.terms ? (
        <section className="invoice-terms mt-1 text-xs">
          <p className="font-semibold text-gray-700">{t("terms")}</p>
          <p className="mt-1 whitespace-pre-line text-gray-700">{details.terms}</p>
        </section>
      ) : null}

      <footer className="invoice-footer">
        {settings.footerText ? (
          <div className="text-center text-xs text-gray-500">{settings.footerText}</div>
        ) : null}
      </footer>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString()
}

CompactInvoice.propTypes = {
  invoice: PropTypes.shape({
    seller: PropTypes.object.isRequired,
    customer: PropTypes.object.isRequired,
    details: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    totals: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
  }).isRequired,
}
