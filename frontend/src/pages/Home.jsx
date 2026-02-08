import React from "react"
import PropTypes from "prop-types"
import SellerForm from "../components/forms/SellerForm.jsx"
import CustomerForm from "../components/forms/CustomerForm.jsx"
import InvoiceDetailsForm from "../components/forms/InvoiceDetailsForm.jsx"
import InvoiceItemsForm from "../components/forms/InvoiceItemsForm.jsx"
import InvoicePreview from "../components/preview/InvoicePreview.jsx"
import Button from "../components/common/Button.jsx"
import formatCurrency from "../utils/formatCurrency.js"
import { storage } from "../services/storage"
import { getTranslation } from "../data/translations.js"

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
  downloadPDF,
  onSave,
  onDownload,
  user
}) {
  const t = (key) => getTranslation(invoice.settings.language, key);

  const handleDownload = async () => {
    // If external onDownload is provided (from App.jsx which handles auth), use it
    if (onDownload) {
      onDownload();
      return;
    }

    // Fallback legacy behavior (direct download without auth check)
    // Save invoice first
    if (onSave) {
        await onSave();
    }

    // Auto-save contacts if they don't exist
    try {
      const contacts = await storage.getContacts()
      
      // Check and save Seller
      if (invoice.seller.name) {
        const sellerExists = contacts.some(
          c => c.type === 'seller' && c.name.toLowerCase() === invoice.seller.name.toLowerCase()
        )
        if (!sellerExists) {
          await storage.saveContact({
            ...invoice.seller,
            type: 'seller'
          })
        }
      }

      // Check and save Customer
      if (invoice.customer.name) {
        const customerExists = contacts.some(
          c => c.type === 'customer' && c.name.toLowerCase() === invoice.customer.name.toLowerCase()
        )
        if (!customerExists) {
          await storage.saveContact({
            ...invoice.customer,
            type: 'customer'
          })
        }
      }
    } catch (error) {
      console.error("Error auto-saving contacts:", error)
    }

    // Proceed with download
    downloadPDF()
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8 md:h-[calc(100vh-64px)] md:overflow-hidden">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:h-full">
        <div className="space-y-8 md:overflow-y-auto md:pr-4 md:pb-8">
          <SellerForm seller={invoice.seller} onChange={updateSeller} user={user} settings={invoice.settings} />
          <CustomerForm customer={invoice.customer} onChange={updateCustomer} user={user} settings={invoice.settings} />
          <InvoiceDetailsForm details={invoice.details} onChange={updateDetails} user={user} settings={invoice.settings} />
          <InvoiceItemsForm
            items={invoice.items}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
            onClearItems={clearItems}
            onMoveUp={moveItemUp}
            onMoveDown={moveItemDown}
            settings={invoice.settings}
          />
          <div className="space-y-2 rounded-lg border bg-white p-4">
            <h2 className="text-lg font-semibold">{t('summary')}</h2>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('subtotal')}</span>
              <span className="font-medium">
                {formatCurrency(totals.subtotal, invoice.settings)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('tax')}</span>
              <span className="font-medium">
                {formatCurrency(totals.taxAmount, invoice.settings)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 text-sm">
              <span className="font-semibold">{t('total')}</span>
              <span className="font-semibold">
                {formatCurrency(totals.total, invoice.settings)}
              </span>
            </div>
            <div className="pt-2 flex gap-2">
              <Button onClick={onSave} variant="secondary" className="w-full">{t('save')}</Button>
              <Button onClick={handleDownload} className="w-full">{t('download')}</Button>
            </div>
          </div>
        </div>
        <div className="md:overflow-y-auto md:pl-4 md:pb-8">
          <InvoicePreview invoice={invoice} totals={totals} previewRef={previewRef} user={user} />
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
  downloadPDF: PropTypes.func.isRequired,
  onSave: PropTypes.func
}
