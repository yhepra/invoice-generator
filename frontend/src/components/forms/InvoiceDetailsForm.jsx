import React from "react"
import PropTypes from "prop-types"
import { getTranslation } from "../../data/translations.js"

export default function InvoiceDetailsForm({ details, onChange, user, settings }) {
  const isPremium = user && user.plan === 'premium';
  const t = (key) => getTranslation(settings?.language, key);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{t('details')}</h2>
      <div>
        <label className="block text-sm text-gray-600 mb-1">{t('headerTitle')}</label>
        <input
          type="text"
          value={details.headerTitle || t('invoice')}
          onChange={(e) => {
            if (e.target.value.length <= 30) {
              onChange({ headerTitle: e.target.value });
            }
          }}
          maxLength={30}
          placeholder={t('placeholderHeader')}
          readOnly={!isPremium}
          className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${!isPremium ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        {!isPremium && <p className="text-xs text-gray-500 mt-1">{t('upgradeToPremiumHeader')}</p>}
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">{t('number')} <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={details.number}
          onChange={(e) => onChange({ number: e.target.value })}
          placeholder={t('invoiceNumber')}
          readOnly={!isPremium}
          className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${!isPremium ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        {!isPremium && <p className="text-xs text-gray-500 mt-1">{t('upgradeToPremiumNumber')}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('date')} <span className="text-red-500">*</span></label>
          <input
            type="date"
            value={details.invoiceDate}
            onChange={(e) => onChange({ invoiceDate: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('dueDate')} <span className="text-red-500">*</span></label>
          <input
            type="date"
            value={details.dueDate}
            onChange={(e) => onChange({ dueDate: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>
      <textarea
        value={details.notes}
        onChange={(e) => onChange({ notes: e.target.value })}
        placeholder={t('notes')}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        rows={3}
      />
      <textarea
        value={details.terms}
        onChange={(e) => onChange({ terms: e.target.value })}
        placeholder={t('terms')}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        rows={3}
      />
    </div>
  )
}

InvoiceDetailsForm.propTypes = {
  details: PropTypes.shape({
    number: PropTypes.string,
    invoiceDate: PropTypes.string,
    dueDate: PropTypes.string,
    notes: PropTypes.string,
    terms: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired
}
