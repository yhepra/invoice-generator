import React from "react"
import PropTypes from "prop-types"
import SellerForm from "../components/forms/SellerForm.jsx"
import CustomerForm from "../components/forms/CustomerForm.jsx"
import InvoiceDetailsForm from "../components/forms/InvoiceDetailsForm.jsx"
import InvoiceItemsForm from "../components/forms/InvoiceItemsForm.jsx"
import InvoicePreview from "../components/preview/InvoicePreview.jsx"
import Button from "../components/common/Button.jsx"
import formatCurrency from "../utils/formatCurrency.js"

export default function Home({
  invoice,
  totals,
  previewRef,
  updateSeller,
  updateCustomer,
  updateDetails,
  addItem,
  updateItem,
  removeItem,
  clearItems,
  moveItemUp,
  moveItemDown,
  downloadPDF
}) {

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-8">
          <SellerForm seller={invoice.seller} onChange={updateSeller} />
          <CustomerForm customer={invoice.customer} onChange={updateCustomer} />
          <InvoiceDetailsForm details={invoice.details} onChange={updateDetails} />
          <InvoiceItemsForm
            items={invoice.items}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
            onClearItems={clearItems}
            onMoveUp={moveItemUp}
            onMoveDown={moveItemDown}
          />
          <div className="space-y-2 rounded-lg border bg-white p-4">
            <h2 className="text-lg font-semibold">Summary</h2>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                {formatCurrency(totals.subtotal, invoice.settings)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({totals.taxPercent || 0}%)</span>
              <span className="font-medium">
                {formatCurrency(totals.taxAmount, invoice.settings)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 text-sm">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">
                {formatCurrency(totals.total, invoice.settings)}
              </span>
            </div>
            <div className="pt-2">
              <Button onClick={downloadPDF}>Download PDF</Button>
            </div>
          </div>
        </div>
        <div>
          <InvoicePreview invoice={invoice} totals={totals} previewRef={previewRef} />
        </div>
      </div>
    </div>
  )
}

Home.propTypes = {
  invoice: PropTypes.shape({
    settings: PropTypes.object,
    seller: PropTypes.object,
    customer: PropTypes.object,
    details: PropTypes.object,
    items: PropTypes.array
  }).isRequired,
  totals: PropTypes.shape({
    subtotal: PropTypes.number,
    taxPercent: PropTypes.number,
    taxAmount: PropTypes.number,
    total: PropTypes.number
  }).isRequired,
  previewRef: PropTypes.object.isRequired,
  updateSeller: PropTypes.func.isRequired,
  updateCustomer: PropTypes.func.isRequired,
  updateDetails: PropTypes.func.isRequired,
  addItem: PropTypes.func.isRequired,
  updateItem: PropTypes.func.isRequired,
  removeItem: PropTypes.func.isRequired,
  clearItems: PropTypes.func.isRequired,
  moveItemUp: PropTypes.func.isRequired,
  moveItemDown: PropTypes.func.isRequired,
  downloadPDF: PropTypes.func.isRequired
}
