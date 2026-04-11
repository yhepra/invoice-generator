import React, { useState } from "react"
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
  onSendEmail,
  user,
  isSaving
}) {
  const t = (key) => getTranslation(invoice.settings.language, key);
  const [isEmailOpen, setIsEmailOpen] = useState(false)
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)

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

  const openEmail = () => {
    setEmailError("")
    setEmailTo(String(invoice.customer?.email || "").trim())
    setEmailSubject(`${t("invoice")} ${invoice.details?.number || ""}`.trim())
    setEmailMessage("")
    setIsEmailOpen(true)
  }

  const handleSendEmail = async () => {
    if (!onSendEmail) return

    const to = String(emailTo || "").trim()
    if (!to) {
      setEmailError(t("emailTo"))
      return
    }

    setEmailError("")
    setIsSendingEmail(true)
    try {
      const ok = await onSendEmail({
        to,
        subject: String(emailSubject || "").trim(),
        message: String(emailMessage || "").trim()
      })
      if (ok) setIsEmailOpen(false)
    } catch (e) {
      setEmailError(e?.message || "Failed to send email")
    } finally {
      setIsSendingEmail(false)
    }
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
              <Button 
                onClick={onSave} 
                variant="secondary" 
                className="w-full"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('saving') || 'Saving...'}
                  </>
                ) : (
                  t('save')
                )}
              </Button>
              <Button
                onClick={openEmail}
                variant="outline"
                className="w-full"
                disabled={!onSendEmail}
              >
                {t("sendInvoiceEmail")}
              </Button>
              <Button onClick={handleDownload} className="w-full">{t('download')}</Button>
            </div>
          </div>
        </div>
        <div className="md:overflow-y-auto md:pl-4 md:pb-8">
          <InvoicePreview invoice={invoice} totals={totals} previewRef={previewRef} user={user} />
        </div>
      </div>

      {isEmailOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-gray-200">
            <div className="p-6">
              <div className="text-lg font-semibold text-gray-900">{t("sendInvoiceEmail")}</div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("emailTo")}</label>
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder={t("email")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("emailSubject")}</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("emailMessageOptional")}</label>
                  <textarea
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                  />
                </div>
              </div>

              {emailError ? (
                <div className="mt-3 text-sm text-red-600">{emailError}</div>
              ) : null}

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsEmailOpen(false)}
                  disabled={isSendingEmail}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleSendEmail}
                  loading={isSendingEmail}
                  disabled={isSendingEmail}
                >
                  {isSendingEmail ? t("sendingEmail") : t("sendInvoiceEmail")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
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
  onSave: PropTypes.func,
  onSendEmail: PropTypes.func
}
