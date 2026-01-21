import React from "react"
import PropTypes from "prop-types"
import formatCurrency from "../utils/formatCurrency.js"
import itemTotal from "../utils/itemTotal.js"

export default function SimpleInvoice({ invoice }) {
  const { seller, customer, details, items, totals, settings } = invoice

  return (
    <div className="invoice-content flex w-full flex-col bg-white text-sm text-gray-900">
      <header className="flex items-start justify-between border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">INVOICE</h1>
          <p className="mt-1 text-xs text-gray-500">Generated with Invoice Generator</p>
        </div>
        <div className="text-right text-xs">
          <p className="font-semibold">Invoice No.</p>
          <p className="text-gray-700">{details.number}</p>
          <p className="mt-2 font-semibold">Invoice Date</p>
          <p className="text-gray-700">{details.invoiceDate}</p>
          <p className="mt-2 font-semibold">Due Date</p>
          <p className="text-gray-700">{details.dueDate}</p>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-8 text-xs">
        <div>
          <p className="font-semibold uppercase tracking-wide text-gray-600">
            From
          </p>
          <p className="mt-2 font-semibold text-gray-900">{seller.name || "Seller name"}</p>
          <p className="whitespace-pre-line text-gray-700">
            {seller.address || "Seller address"}
          </p>
          <p className="mt-1 text-gray-700">{seller.phone}</p>
          <p className="mt-1 text-gray-700">{seller.email}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wide text-gray-600">
            Bill To
          </p>
          <p className="mt-2 font-semibold text-gray-900">
            {customer.name || "Customer name"}
          </p>
          <p className="whitespace-pre-line text-gray-700">
            {customer.address || "Customer address"}
          </p>
          <p className="mt-1 text-gray-700">{customer.phone}</p>
          <p className="mt-1 text-gray-700">{customer.email}</p>
        </div>
      </section>

      <section className="mt-8">
        <table className="min-w-full table-fixed border-collapse text-xs">
          <thead>
            <tr className="border-b border-t border-gray-200 bg-gray-50">
              <th className="py-2 text-left font-semibold text-gray-700">Item</th>
              <th className="w-24 py-2 text-right font-semibold text-gray-700">
                Qty
              </th>
              <th className="w-32 py-2 text-right font-semibold text-gray-700">
                Price
              </th>
              <th className="w-24 py-2 text-right font-semibold text-gray-700">
                Tax (%)
              </th>
              <th className="w-32 py-2 text-right font-semibold text-gray-700">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-2 pr-2 text-left text-gray-800">
                  {item.name || "Item"}
                </td>
                <td className="py-2 text-right text-gray-800">
                  {item.quantity || 0}
                </td>
                <td className="py-2 text-right text-gray-800">
                  {formatCurrency(item.price, settings)}
                </td>
                <td className="py-2 text-right text-gray-800">
                  {Number(item.taxPercent || 0)}%
                </td>
                <td className="py-2 text-right text-gray-800">
                  {formatCurrency(itemTotal(item.quantity, item.price), settings)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {details.notes ? (
        <section className="invoice-notes mt-6 text-xs">
          <p className="font-semibold text-gray-700">Notes</p>
          <p className="mt-1 whitespace-pre-line text-gray-700">
            {details.notes}
          </p>
        </section>
      ) : null}
      {details.terms ? (
        <section className="mt-4 text-xs">
          <p className="font-semibold text-gray-700">Terms & Conditions</p>
          <p className="mt-1 whitespace-pre-line text-gray-700">
            {details.terms}
          </p>
        </section>
      ) : null}

      <section className="invoice-footer text-xs">
        <div className="ml-auto w-52 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900 tabular-nums">
              {formatCurrency(totals.subtotal, settings)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium text-gray-900 tabular-nums">
              {formatCurrency(totals.taxAmount, settings)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-3">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-lg font-semibold text-gray-900 tabular-nums">
              {formatCurrency(totals.total, settings)}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-gray-600 self-start">
          {settings.footerText || "Thank you for your business."}
        </div>
      </section>
    </div>
  )
}

SimpleInvoice.propTypes = {
  invoice: PropTypes.shape({
    seller: PropTypes.shape({
      name: PropTypes.string,
      address: PropTypes.string,
      phone: PropTypes.string,
      email: PropTypes.string
    }).isRequired,
    customer: PropTypes.shape({
      name: PropTypes.string,
      address: PropTypes.string,
      phone: PropTypes.string,
      email: PropTypes.string
    }).isRequired,
    details: PropTypes.shape({
      number: PropTypes.string,
      invoiceDate: PropTypes.string,
      dueDate: PropTypes.string,
      notes: PropTypes.string,
      terms: PropTypes.string
    }).isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string,
        quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      })
    ).isRequired,
    totals: PropTypes.shape({
      subtotal: PropTypes.number,
      taxPercent: PropTypes.number,
      taxAmount: PropTypes.number,
      total: PropTypes.number
    }).isRequired,
    settings: PropTypes.shape({
      currency: PropTypes.string,
      locale: PropTypes.string,
      footerText: PropTypes.string
    }).isRequired
  }).isRequired
}
