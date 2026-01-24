import React, { useState, useRef, useEffect } from "react"
import PropTypes from "prop-types"
import Button from "./Button.jsx"

export default function Header({ title, onGoHome, onGoEditor, onGoSettings, onGoHistory, onGoUpgrade, user, onLogin, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const getInitials = (name) => {
    if (!name) return "U"
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center gap-2">
          {/* Logo Icon (Optional, keeping it simple text as requested or enhancing) */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">{title}</span>
          {user && (
            user.plan === 'premium' ? (
              <span className="ml-2 rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600 border border-orange-200">
                Premium
              </span>
            ) : (
              <button 
                onClick={onGoUpgrade}
                className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 border border-blue-200 hover:bg-blue-200 cursor-pointer transition-colors"
                title="Upgrade to Premium"
              >
                Free
              </button>
            )
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={onGoHome}
                className="mr-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-600"
                title="Home"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">Home</span>
              </button>
              
              <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-gray-200 p-1 pr-3 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {getInitials(user.name)}
                </div>
                <div className="hidden flex-col items-start sm:flex">
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  {/* Mobile User Info Section (Visible only on small screens) */}
                  <div className="border-b px-4 py-3 sm:hidden">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onGoEditor()
                        setIsMenuOpen(false)
                      }}
                      className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400 group-hover:text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Invoice
                    </button>

                    <button
                      onClick={() => {
                        onGoHistory()
                        setIsMenuOpen(false)
                      }}
                      className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400 group-hover:text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      History
                    </button>

                    <button
                      onClick={() => {
                        onGoSettings()
                        setIsMenuOpen(false)
                      }}
                      className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400 group-hover:text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </button>
                  </div>

                  <div className="my-1 h-px bg-gray-100" />

                  {user.plan !== 'premium' && (
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onGoUpgrade()
                          setIsMenuOpen(false)
                        }}
                        className="group flex w-full items-center px-4 py-2 text-sm text-brand-600 hover:bg-brand-50 font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-brand-500 group-hover:text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Upgrade to Premium
                      </button>
                    </div>
                  )}

                  <div className="my-1 h-px bg-gray-100" />

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onLogout()
                        setIsMenuOpen(false)
                      }}
                      className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
          ) : (
            <Button onClick={onLogin}>
              Login / Register
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

Header.propTypes = {
  title: PropTypes.string.isRequired,
  onGoHome: PropTypes.func.isRequired,
  onGoEditor: PropTypes.func,
  onGoSettings: PropTypes.func.isRequired,
  onGoHistory: PropTypes.func,
  onGoUpgrade: PropTypes.func,
  user: PropTypes.object,
  onLogin: PropTypes.func,
  onLogout: PropTypes.func
}