import React, { useEffect, useMemo, useState } from "react"
import PropTypes from "prop-types"
import { getTranslation } from "../../data/translations.js"
import { storage } from "../../services/storage.js"

export default function SettingsForm({ settings, onChange }) {
  const t = (key) => getTranslation(settings?.language, key);
  const [emailSettings, setEmailSettings] = useState({
    fromAddress: "",
    fromName: "",
    smtpHost: "",
    smtpPort: "587",
    smtpEncryption: "tls",
    smtpUsername: "",
    smtpPassword: "",
  })
  const [lastSavedEmailSettings, setLastSavedEmailSettings] = useState(null)
  const [hasSmtpPassword, setHasSmtpPassword] = useState(false)
  const [savedBanner, setSavedBanner] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await storage.getEmailSettings()
        setEmailSettings(res.emailSettings)
        setLastSavedEmailSettings(res.emailSettings)
        setHasSmtpPassword(res.hasSmtpPassword)
      } catch {
        setLastSavedEmailSettings({
          fromAddress: "",
          fromName: "",
          smtpHost: "",
          smtpPort: "587",
          smtpEncryption: "tls",
          smtpUsername: "",
          smtpPassword: "",
        })
      }
    }
    load()
  }, [])

  const isEmailSettingsDirty = useMemo(() => {
    if (!lastSavedEmailSettings) return false
    return JSON.stringify(lastSavedEmailSettings) !== JSON.stringify(emailSettings)
  }, [emailSettings, lastSavedEmailSettings])

  const updateEmailSettings = (patch) => {
    setSavedBanner(false)
    setEmailSettings((prev) => ({ ...prev, ...patch }))
  }

  const saveEmailSettings = async () => {
    try {
      const res = await storage.saveEmailSettings(emailSettings)
      setEmailSettings(res.emailSettings)
      setLastSavedEmailSettings(res.emailSettings)
      setHasSmtpPassword(res.hasSmtpPassword)
      setSavedBanner(true)
    } catch {
      setSavedBanner(false)
    }
  }

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

      <div className="pt-2" data-tour="settings-email">
        <h3 className="text-sm font-semibold text-gray-900">{t("emailSettings")}</h3>
        <p className="mt-1 text-xs text-gray-500">{t("emailSettingsLocalOnly")}</p>
        <p className="mt-1 text-xs text-gray-500">{t("senderEmailHelp")}</p>
      </div>
      <div>
        <label className="block text-sm text-gray-600">{t("senderEmail")}</label>
        <input
          type="email"
          value={emailSettings.fromAddress}
          onChange={(e) => updateEmailSettings({ fromAddress: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder={t("email")}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">{t("senderName")}</label>
        <input
          type="text"
          value={emailSettings.fromName}
          onChange={(e) => updateEmailSettings({ fromName: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder={t("name")}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">{t("smtpHost")}</label>
        <input
          type="text"
          value={emailSettings.smtpHost}
          onChange={(e) => updateEmailSettings({ smtpHost: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="smtp.gmail.com"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">{t("smtpPort")}</label>
        <input
          type="number"
          value={emailSettings.smtpPort}
          onChange={(e) => updateEmailSettings({ smtpPort: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="587"
          min="1"
          max="65535"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">{t("smtpEncryption")}</label>
        <select
          value={emailSettings.smtpEncryption}
          onChange={(e) => updateEmailSettings({ smtpEncryption: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="none">{t("smtpEncryptionNone")}</option>
          <option value="tls">{t("smtpEncryptionTLS")}</option>
          <option value="ssl">{t("smtpEncryptionSSL")}</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600">{t("smtpUsername")}</label>
        <input
          type="text"
          value={emailSettings.smtpUsername}
          onChange={(e) => updateEmailSettings({ smtpUsername: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">{t("smtpPassword")}</label>
        <input
          type="password"
          value={emailSettings.smtpPassword}
          onChange={(e) => updateEmailSettings({ smtpPassword: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          autoComplete="new-password"
          placeholder={hasSmtpPassword ? "********" : ""}
        />
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        {savedBanner && (
          <span className="text-xs text-gray-500">{t("emailSettingsSaved")}</span>
        )}
        <button
          type="button"
          onClick={saveEmailSettings}
          disabled={!isEmailSettingsDirty}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {t("save")}
        </button>
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
