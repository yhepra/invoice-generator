import React from "react"
import PropTypes from "prop-types"
import Button from "./Button.jsx"

export default function Header({ title, onDownload, onGoHome, onGoSettings }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Home
          </button>
          <button
            type="button"
            onClick={onGoSettings}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Settings
          </button>
          <Button onClick={onDownload}>Download PDF</Button>
        </div>
      </div>
    </header>
  )
}

Header.propTypes = {
  title: PropTypes.string.isRequired,
  onDownload: PropTypes.func.isRequired,
  onGoHome: PropTypes.func.isRequired,
  onGoSettings: PropTypes.func.isRequired
}
