import React from "react"
import PropTypes from "prop-types"

export default function InvoiceDetailsForm({ details, onChange }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Invoice Details</h2>
      <input
        type="text"
        value={details.number}
        onChange={(e) => onChange({ number: e.target.value })}
        placeholder="Invoice Number"
        className="w-full rounded-md border border-gray-300 px-3 py-2"
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600">Invoice Date</label>
          <input
            type="date"
            value={details.invoiceDate}
            onChange={(e) => onChange({ invoiceDate: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Due Date</label>
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
      <div>
        <label className="block text-sm text-gray-600">Tax (%)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={details.taxPercent}
          onChange={(e) => onChange({ taxPercent: e.target.value })}
          placeholder="Tax percentage"
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>
    </div>
  )
}

InvoiceDetailsForm.propTypes = {
  details: PropTypes.shape({
    number: PropTypes.string,
    invoiceDate: PropTypes.string,
    dueDate: PropTypes.string,
    notes: PropTypes.string,
    taxPercent: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  onChange: PropTypes.func.isRequired
}
