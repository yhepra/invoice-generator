import React from "react"
import PropTypes from "prop-types"

export default function SellerForm({ seller, onChange }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Seller</h2>
      <input
        type="text"
        value={seller.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Name"
        className="w-full rounded-md border border-gray-300 px-3 py-2"
      />
      <textarea
        value={seller.address}
        onChange={(e) => onChange({ address: e.target.value })}
        placeholder="Address"
        className="w-full rounded-md border border-gray-300 px-3 py-2"
        rows={3}
      />
      <input
        type="tel"
        value={seller.phone || ""}
        onChange={(e) => onChange({ phone: e.target.value })}
        placeholder="Phone"
        className="w-full rounded-md border border-gray-300 px-3 py-2"
      />
      <input
        type="email"
        value={seller.email}
        onChange={(e) => onChange({ email: e.target.value })}
        placeholder="Email"
        className="w-full rounded-md border border-gray-300 px-3 py-2"
      />
    </div>
  )
}

SellerForm.propTypes = {
  seller: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired
}
