import React from "react"
import PropTypes from "prop-types"

export default function InvoiceDetailsForm({ details, onChange }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Invoice Details</h2>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Invoice Number <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={details.number}
          onChange={(e) => onChange({ number: e.target.value })}
          placeholder="Invoice Number"
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
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
