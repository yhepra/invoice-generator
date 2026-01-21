import React from "react"
import PropTypes from "prop-types"
import LibPhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"

export default function PhoneInput({ value, onChange, placeholder }) {
  const internalValue = (value || "").replace(/^\+/, "")

  const handleChange = (val /* digits only */, country) => {
    const digits = String(val || "").replace(/\D/g, "")
    const e164 = digits ? `+${digits}` : ""
    onChange?.(e164, country)
  }

  return (
    <div className="w-full">
      <LibPhoneInput
        country={"id"}
        value={internalValue}
        onChange={handleChange}
        enableSearch
        placeholder={placeholder || "Phone number"}
        inputProps={{ name: "phone", required: true, autoComplete: "tel" }}
        containerClass="w-full"
        inputClass="w-full rounded-md border border-gray-300 pl-14 pr-3 py-2 text-sm focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
        buttonClass="!border-gray-300 !bg-white"
        dropdownClass="shadow-lg rounded-md"
      />
    </div>
  )
}

PhoneInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string
}
