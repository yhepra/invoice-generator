import React from "react"
import PropTypes from "prop-types"
import SimpleInvoice from "../../templates/SimpleInvoice.jsx"
import CompactInvoice from "../../templates/CompactInvoice.jsx"
import YellowInvoice from "../../templates/YellowInvoice.jsx"

export default function InvoicePreview({ invoice, totals, previewRef, user }) {
  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div ref={previewRef} id="invoice-preview" className="invoice-a4">
        {invoice.settings?.template === "yellow" ? (
          <YellowInvoice invoice={{ ...invoice, totals }} user={user} />
        ) : invoice.settings?.template === "compact" ? (
          <CompactInvoice invoice={{ ...invoice, totals }} user={user} />
        ) : (
          <SimpleInvoice invoice={{ ...invoice, totals }} user={user} />
        )}
      </div>
    </div>
  )
}

InvoicePreview.propTypes = {
  invoice: PropTypes.shape({
    seller: PropTypes.object,
    customer: PropTypes.object,
    details: PropTypes.object,
    items: PropTypes.array,
    settings: PropTypes.object
  }).isRequired,
  totals: PropTypes.shape({
    subtotal: PropTypes.number,
    taxPercent: PropTypes.number,
    taxAmount: PropTypes.number,
    total: PropTypes.number
  }).isRequired,
  previewRef: PropTypes.object.isRequired,
  user: PropTypes.object
}
