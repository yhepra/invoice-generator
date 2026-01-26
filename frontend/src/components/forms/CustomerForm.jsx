import React, { useState, useEffect, useRef } from "react"
import PropTypes from "prop-types"
import PhoneInput from "../common/PhoneInput.jsx"
import { storage } from "../../services/storage"
import { getTranslation } from "../../data/translations.js"

export default function CustomerForm({ customer, onChange, settings }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const wrapperRef = useRef(null)
  
  const t = (key) => getTranslation(settings?.language, key);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const contacts = await storage.getContacts()
        setSuggestions(contacts.filter((c) => c.type === "customer"))
      } catch (error) {
        console.error("Failed to load contacts", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchContacts()

    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleNameChange = (e) => {
    onChange({ name: e.target.value })
    setShowSuggestions(true)
  }

  const handleSelectSuggestion = (contact) => {
    onChange({
      name: contact.name,
      address: contact.address,
      phone: contact.phone,
      email: contact.email
    })
    setShowSuggestions(false)
  }

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.name.toLowerCase().includes((customer.name || "").toLowerCase()) &&
      s.name !== customer.name
  )

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{t('customer')}</h2>
      <div className="relative" ref={wrapperRef}>
        <label className="block text-sm text-gray-600 mb-1">{t('name')} <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={customer.name}
          onChange={handleNameChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={t('placeholderName')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          autoComplete="off"
        />
        {showSuggestions && (
          <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg">
            {isLoading ? (
               <li className="px-3 py-2 text-sm text-gray-500">{t('loading')}</li>
            ) : filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((s) => (
                <li
                  key={s.id}
                  onClick={() => handleSelectSuggestion(s)}
                  className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
                >
                  <div className="font-medium text-gray-900">{s.name}</div>
                  <div className="truncate text-xs text-gray-500">
                    {s.email} {s.phone && `• ${s.phone}`}
                  </div>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-500">
                {suggestions.length === 0 ? t('noSavedCustomers') : t('noMatchesFound')}
              </li>
            )}
          </ul>
        )}
      </div>
      <textarea
        value={customer.address}
        onChange={(e) => onChange({ address: e.target.value })}
        placeholder={t('placeholderAddress')}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        rows={3}
      />
      <div className="grid grid-cols-2 gap-3">
        <PhoneInput
            value={customer.phone}
            onChange={(val) => onChange({ phone: val })}
            placeholder={t('placeholderPhone')}
        />
        <input
          type="email"
          value={customer.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder={t('placeholderEmail')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
    </div>
  )
}

CustomerForm.propTypes = {
  customer: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired
}
