import React from "react"
import PropTypes from "prop-types"
import SettingsForm from "../components/forms/SettingsForm.jsx"
import ContactsManager from "../components/forms/ContactsManager.jsx"
import { getTranslation } from "../data/translations.js"

export default function Settings({ settings, onChange, isSaving, user }) {
  const t = (key) => getTranslation(settings?.language, key);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('settings')}</h1>
        {isSaving && (
          <span className="text-sm text-gray-500 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('saving')}
          </span>
        )}
      </div>
      
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('generalSettings')}</h2>
          <div className="rounded-lg border bg-white p-4">
            <SettingsForm settings={settings} onChange={onChange} />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('contactsManagement')}</h2>
          <div className="rounded-lg border bg-white p-4">
            <ContactsManager settings={settings} user={user} />
          </div>
        </section>
      </div>
    </div>
  )
}

Settings.propTypes = {
  settings: PropTypes.shape({
    currency: PropTypes.string,
    locale: PropTypes.string,
    language: PropTypes.string,
    footerText: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  isSaving: PropTypes.bool,
  user: PropTypes.object
}
