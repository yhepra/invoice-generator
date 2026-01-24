import React from "react"
import PropTypes from "prop-types"
import SimpleInvoice from "../../templates/SimpleInvoice.jsx"

export default function InvoicePreview({ invoice, totals, previewRef, user }) {
  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div ref={previewRef} id="invoice-preview" className="invoice-a4">
        <SimpleInvoice invoice={{ ...invoice, totals }} user={user} />
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
  previewRef: PropTypes.object.isRequired
}
