import React from "react"
import PropTypes from "prop-types"

export default function InvoiceDetailsForm({ details, onChange, user }) {
  const isPremium = user && user.plan === 'premium';

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Invoice Details</h2>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Header Title</label>
        <input
          type="text"
          value={details.headerTitle || "INVOICE"}
          onChange={(e) => onChange({ headerTitle: e.target.value })}
          placeholder="Header Title"
          readOnly={!isPremium}
          className={`w-full rounded-md border border-gray-300 px-3 py-2 ${!isPremium ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        {!isPremium && <p className="text-xs text-gray-500 mt-1">Upgrade to Premium to customize header</p>}
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Invoice Number <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={details.number}
          onChange={(e) => onChange({ number: e.target.value })}
          placeholder="Invoice Number"
          readOnly={!isPremium}
          className={`w-full rounded-md border border-gray-300 px-3 py-2 ${!isPremium ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        {!isPremium && <p className="text-xs text-gray-500 mt-1">Upgrade to Premium to customize invoice number</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Invoice Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            value={details.invoiceDate}
            onChange={(e) => onChange({ invoiceDate: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Due Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            value={details.dueDate}
            onChange={(e) => onChange({ dueDate: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>
      <textarea
        value={details.notes}
        onChange={(e) => onChange({ notes: e.target.value })}
        placeholder="Notes (optional)"
        className="w-full rounded-md border border-gray-300 px-3 py-2"
        rows={3}
      />
      <textarea
        value={details.terms}
        onChange={(e) => onChange({ terms: e.target.value })}
        placeholder="Terms & Conditions (optional)"
        className="w-full rounded-md border border-gray-300 px-3 py-2"
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
