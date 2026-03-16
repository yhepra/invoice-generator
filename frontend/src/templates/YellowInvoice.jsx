import React from "react"
import PropTypes from "prop-types"
import formatCurrency from "../utils/formatCurrency.js"
import itemTotal from "../utils/itemTotal.js"
import { getTranslation } from "../data/translations.js"

export default function YellowInvoice({ invoice, user }) {
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
    <div className="invoice-content flex w-full flex-col bg-white text-gray-900">
      <div className="relative">
        <div className="h-2 bg-gray-100"></div>
        <div className="h-2 bg-yellow-400 w-1/5"></div>
      </div>
      <header className="flex items-center justify-between border-b border-gray-200 pb-5 pt-4">
        <div className="flex items-start gap-4">
          {seller.logo ? (
            <img src={seller.logo} alt="Logo" className="h-12 w-auto object-contain" />
          ) : null}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{details.headerTitle || t("invoice")}</h1>
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="inline-block rounded bg-gray-900 px-3 py-1 text-white">{details.number}</div>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
            <div className="text-gray-600">{dateLabel}</div>
            <div className="text-gray-900">{formatDate(details.invoiceDate)}</div>
            <div className="text-gray-600">{dueDateLabel}</div>
            <div className="text-gray-900">{formatDate(details.dueDate)}</div>
          </div>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-8 text-sm">
        <div>
          <p className="font-semibold uppercase tracking-wide text-gray-600">{t("from")}</p>
          <p className="mt-1 font-medium text-gray-900">{seller.name || t("placeholderName")}</p>
          {seller.address ? <p className="text-gray-700">{seller.address}</p> : null}
          {seller.phone ? <p className="text-gray-700">{seller.phone}</p> : null}
          {seller.email ? <p className="text-gray-700">{seller.email}</p> : null}
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wide text-gray-600">{t("billTo")}</p>
          <p className="mt-1 font-medium text-gray-900">{customer.name || t("placeholderName")}</p>
          {customer.address ? <p className="text-gray-700">{customer.address}</p> : null}
          {customer.phone ? <p className="text-gray-700">{customer.phone}</p> : null}
          {customer.email ? <p className="text-gray-700">{customer.email}</p> : null}
        </div>
      </section>

      <section className="mt-6">
        <table className="w-full border-collapse overflow-hidden rounded-lg">
          <thead>
            <tr className="bg-gray-900 text-left text-xs uppercase tracking-wide text-white">
              <th className="px-3 py-2 w-12">#</th>
              <th className="px-3 py-2">{t("item")}</th>
              <th className="px-3 py-2">{t("price")}</th>
              <th className="px-3 py-2">{t("quantity")}</th>
              <th className="px-3 py-2 text-right">{t("total")}</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {items.map((it, idx) => (
              <tr key={it.id} className={idx % 2 ? "bg-gray-50" : "bg-white"}>
                <td className="px-3 py-2 text-gray-600">{idx + 1}</td>
                <td className="px-3 py-2 text-gray-900">{it.name}</td>
                <td className="px-3 py-2 text-gray-700">{formatCurrency(Number(it.price || 0), settings)}</td>
                <td className="px-3 py-2 text-gray-700">{it.quantity}</td>
                <td className="px-3 py-2 text-right text-gray-900">
                  {formatCurrency(itemTotal(it, settings), settings)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="mt-6 flex items-start justify-between">
        <div className="max-w-md text-xs text-gray-700 space-y-3">
          {details.notes ? (
            <div>
              <p className="font-semibold text-gray-800">{t("notes")}</p>
              <p className="mt-1 whitespace-pre-line">{details.notes}</p>
            </div>
          ) : null}
          {details.terms ? (
            <div>
              <p className="font-semibold text-gray-800">{t("terms")}</p>
              <p className="mt-1 whitespace-pre-line">{details.terms}</p>
            </div>
          ) : null}
        </div>
        <div className="ml-6 w-64">
          <div className="rounded-t-lg border border-gray-200">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-gray-600">{t("subtotal")}</span>
              <span className="font-medium">{formatCurrency(totals.subtotal, settings)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2">
              <span className="text-gray-600">{t("tax")}</span>
              <span className="font-medium">{formatCurrency(totals.taxAmount, settings)}</span>
            </div>
          </div>
          <div className="rounded-b-lg bg-yellow-400 px-4 py-3 flex items-center justify-between">
            <span className="text-gray-900 font-semibold">{t("total")}</span>
            <span className="text-gray-900 font-extrabold">{formatCurrency(totals.total, settings)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <div className="h-1 w-24 bg-yellow-400"></div>
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString()
}

YellowInvoice.propTypes = {
  invoice: PropTypes.shape({
    seller: PropTypes.object.isRequired,
    customer: PropTypes.object.isRequired,
    details: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    totals: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
  }).isRequired,
  user: PropTypes.object,
}
