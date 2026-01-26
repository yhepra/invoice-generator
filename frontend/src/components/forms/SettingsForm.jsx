import React from "react"
import PropTypes from "prop-types"
import { getTranslation } from "../../data/translations.js"

export default function SettingsForm({ settings, onChange }) {
  const t = (key) => getTranslation(settings?.language, key);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{t('settings')}</h2>
      <div>
        <label className="block text-sm text-gray-600">{t('currency')}</label>
        <select
          value={settings.currency}
          onChange={(e) => onChange({ currency: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="IDR">Rupiah (IDR)</option>
          <option value="USD">US Dollar (USD)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600">{t('language')}</label>
        <select
          value={settings.language || "id"}
          onChange={(e) => onChange({ language: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="id">Bahasa Indonesia</option>
          <option value="en">English</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600">{t('footerText')}</label>
        <textarea
          value={settings.footerText || ""}
          onChange={(e) => onChange({ footerText: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          rows={2}
          placeholder={t('placeholderFooter')}
        />
      </div>
    </div>
  )
}

SettingsForm.propTypes = {
  settings: PropTypes.shape({
    currency: PropTypes.string,
    locale: PropTypes.string,
    language: PropTypes.string,
    footerText: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired
}
