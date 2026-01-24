import React from "react"
import PropTypes from "prop-types"

export default function Button({ children, className = "", variant = "primary", ...props }) {
  const baseStyles = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 active:bg-brand-800",
    secondary: "bg-white text-brand-600 border border-brand-200 hover:bg-brand-50 focus:ring-brand-500 active:bg-brand-100",
    outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 active:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 active:bg-gray-200"
  }

  const variantStyles = variants[variant] || variants.primary

  return (
    <button
      type={props.type || "button"}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger', 'success', 'ghost'])
}
