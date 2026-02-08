import React from "react"
import PropTypes from "prop-types"
import ContactsManager from "../components/forms/ContactsManager.jsx"
import { getTranslation } from "../data/translations.js"

export default function Contacts({ settings, user }) {
  const t = (key) => getTranslation(settings?.language, key);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('contactsManagement')}</h1>
      </div>
      
      <div className="rounded-lg border bg-white p-4">
        <ContactsManager settings={settings} user={user} />
      </div>
    </div>
  )
}

Contacts.propTypes = {
  settings: PropTypes.object,
  user: PropTypes.object
}
