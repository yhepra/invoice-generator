import React from "react"
import PropTypes from "prop-types"

export default function SettingsForm({ settings, onChange }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Settings</h2>
      <div>
        <label className="block text-sm text-gray-600">Currency</label>
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
        <label className="block text-sm text-gray-600">Language</label>
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
        <label className="block text-sm text-gray-600">Footer Text</label>
        <textarea
          value={settings.footerText || ""}
          onChange={(e) => onChange({ footerText: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          rows={2}
          placeholder="Teks footer pada invoice"
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
