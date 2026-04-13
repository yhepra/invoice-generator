import React from "react"
import PropTypes from "prop-types"
import SimpleInvoice from "../../templates/SimpleInvoice.jsx"
import Template1 from "../../templates/Template1.jsx"
import Template2 from "../../templates/Template2.jsx"

const InvoicePreview = React.memo(function InvoicePreview({
  invoice,
  totals,
  previewRef,
  user,
}) {
  const templateKey = invoice.settings?.template || "simple";
  
  let TemplateComponent = SimpleInvoice;
  if (templateKey === "template1") TemplateComponent = Template1;
  else if (templateKey === "template2") TemplateComponent = Template2;

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div ref={previewRef} id="invoice-preview" className="invoice-a4">
        <TemplateComponent invoice={{ ...invoice, totals }} user={user} />
      </div>
    </div>
  )
})

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

export default InvoicePreview
