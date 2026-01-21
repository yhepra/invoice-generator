import React from "react"
import PropTypes from "prop-types"
import SettingsForm from "../components/forms/SettingsForm.jsx"

export default function Settings({ settings, onChange }) {
  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <div className="space-y-8">
        <div className="rounded-lg border bg-white p-4">
          <SettingsForm settings={settings} onChange={onChange} />
        </div>
      </div>
    </div>
  )
}

Settings.propTypes = {
  settings: PropTypes.shape({
    currency: PropTypes.string,
    locale: PropTypes.string,
    language: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired
}
