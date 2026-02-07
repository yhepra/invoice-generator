import React, { useState } from 'react'
import Button from '../components/common/Button'
import { auth } from '../services/auth'
import { getTranslation } from '../data/translations'

export default function Upgrade({ user, onUpgradeSuccess, onCancel, settings }) {
  const [isLoading, setIsLoading] = useState(false)
  const t = (key) => getTranslation(settings?.language, key);

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const response = await auth.upgrade() 
      
      if (response.payment_url) {
        // Store invoice ID for verification on return
        if (response.invoice && response.invoice.id) {
            localStorage.setItem('pending_upgrade_invoice_id', response.invoice.id);
        }
        window.location.href = response.payment_url
        return
      }
      
      // Fallback for direct upgrade (if ever needed)
      if (response.user) {
         onUpgradeSuccess(response.user)
      }
    } catch (error) {
      console.error(error)
      alert(error.message || "Upgrade failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">{t("upgradeToPremium")}</h1>
        <p className="text-lg text-gray-600">{t("plansSubtitle")}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Free Plan (Current) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm opacity-70">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t("planFree")}</h2>
            {user?.plan !== 'premium' && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-600">
                CURRENT
              </span>
            )}
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">{t("planFreePrice")}</span>
            <span className="text-gray-500">{t("planFreePeriod")}</span>
          </div>
          <ul className="mb-8 space-y-4">
            {[
              t("featLimitContacts"),
              t("featLimitInvoices"),
              t("featWatermark"),
              t("featFixedHeader"),
              t("featAutoNumber")
            ].map((feat, i) => (
              <li key={i} className="flex items-center text-gray-600">
                <svg className="mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feat}
              </li>
            ))}
          </ul>
        </div>

        {/* Premium Plan */}
        <div className="relative rounded-2xl border-2 border-brand-500 bg-white p-8 shadow-xl">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1 text-sm font-bold text-white shadow-md">
            {t("recommended")}
          </div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t("planPremium")}</h2>
            {user?.plan === 'premium' && (
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
                CURRENT
              </span>
            )}
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">{t("planPremiumPrice")}</span>
            <span className="text-gray-500">{t("planPremiumPeriod")}</span>
          </div>
          <ul className="mb-8 space-y-4">
            {[
              t("featUnlimitedContacts"),
              t("featUnlimitedInvoices"),
              t("featNoWatermark"),
              t("featCustomHeader"),
              t("featCustomNumber"),
              t("featPrioritySupport")
            ].map((feat, i) => (
              <li key={i} className="flex items-center text-gray-600">
                <svg className="mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feat}
              </li>
            ))}
          </ul>
          
          {user?.plan !== 'premium' ? (
            <Button 
              onClick={handleUpgrade} 
              className="w-full justify-center py-3 text-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : t("upgradeNow")}
            </Button>
          ) : (
            <div className="rounded-lg bg-green-50 p-4 text-center text-green-800 font-medium">
              You are currently on Premium
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button 
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 font-medium"
        >
          {t("home")}
        </button>
      </div>
    </div>
  )
}
