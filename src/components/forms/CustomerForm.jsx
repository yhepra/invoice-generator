import React from "react"
import PropTypes from "prop-types"

export default function CustomerForm({ customer, onChange }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Customer</h2>
      <input
        type="text"
        value={customer.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Name"
        className="w-full rounded-md border border-gray-300 px-3 py-2"
      />
      <textarea
        value={customer.address}
        onChange={(e) => onChange({ address: e.target.value })}
        placeholder="Address"
        className="w-full rounded-md border border-gray-300 px-3 py-2"
        rows={3}
      />
      <input
        type="tel"
        value={customer.phone || ""}
        onChange={(e) => onChange({ phone: e.target.value })}
        placeholder="Phone"
        className="w-full rounded-md border border-gray-300 px-3 py-2"
      />
      <input
        type="email"
        value={customer.email}
        onChange={(e) => onChange({ email: e.target.value })}
        placeholder="Email"
        className="w-full rounded-md border border-gray-300 px-3 py-2"
      />
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
