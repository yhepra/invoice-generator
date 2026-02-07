import React, { useState, useRef, useEffect } from "react"
import PropTypes from "prop-types"
import Button from "./Button"
import Logo from "./Logo"
import { getTranslation } from "../../data/translations.js"

export default function Header({ title, onGoHome, onGoEditor, onGoSettings, onGoHistory, onGoUpgrade, onGoProfile, user, onLogin, onLogout, settings, onUpdateSettings }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false) // Desktop Dropdown
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // Mobile Burger Menu
  const menuRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const t = (key) => getTranslation(settings?.language, key);

  const toggleLanguage = () => {
    const newLang = settings?.language === 'id' ? 'en' : 'id';
    if (onUpdateSettings) {
      onUpdateSettings({ ...settings, language: newLang });
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.burger-button')) {
        setIsMobileMenuOpen(false)
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
          {/* Logo Icon */}
          <Logo className="h-8 w-8" classNameText="text-brand-600" />
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
                title={t('upgradeToPremium')}
              >
                Free
              </button>
            )
          )}
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          {user && (
            <button
              onClick={onGoHome}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-600"
              title={t('home')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{t('home')}</span>
            </button>
          )}

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-brand-600"
            title={t('switchLanguage')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{settings?.language === 'id' ? 'ID' : 'EN'}</span>
          </button>
          {user ? (
            <>
              
              <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-gray-200 p-1 pr-3 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
              >
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="flex flex-col items-start">
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

              {/* Desktop Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
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
                      {t('createInvoice')}
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
                      {t('history')}
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
                      {t('settings')}
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
                        {t('upgradeToPremium')}
                      </button>
                    </div>
                  )}

                  <div className="my-1 h-px bg-gray-100" />

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onGoProfile()
                        setIsMenuOpen(false)
                      }}
                      className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400 group-hover:text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t('profile')}
                    </button>
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
                      {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
          ) : (
            <Button onClick={onLogin}>
              {t('loginRegister')}
            </Button>
          )}
        </div>

        {/* Mobile Burger Button */}
        <div className="flex md:hidden items-center">
           <button
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             className="burger-button inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
             aria-expanded={isMobileMenuOpen}
           >
             <span className="sr-only">Open main menu</span>
             {isMobileMenuOpen ? (
               <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
               </svg>
             ) : (
               <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
               </svg>
             )}
           </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white" ref={mobileMenuRef}>
          <div className="space-y-1 px-2 pb-3 pt-2 shadow-lg">
            {user ? (
              <>
                <div className="flex items-center px-3 py-3 border-b border-gray-100 mb-2">
                   {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    </div>
                </div>

                <button
                  onClick={() => {
                    onGoHome()
                    setIsMobileMenuOpen(false)
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-700"
                >
                   {t('home')}
                </button>
                
                <button
                  onClick={() => {
                    onGoEditor()
                    setIsMobileMenuOpen(false)
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-700"
                >
                   {t('createInvoice')}
                </button>

                <button
                  onClick={() => {
                    onGoHistory()
                    setIsMobileMenuOpen(false)
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-700"
                >
                   {t('history')}
                </button>

                <button
                  onClick={() => {
                    onGoSettings()
                    setIsMobileMenuOpen(false)
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-700"
                >
                   {t('settings')}
                </button>

                 <button
                  onClick={() => {
                    onGoProfile()
                    setIsMobileMenuOpen(false)
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-700"
                >
                   {t('profile')}
                </button>

                {user.plan !== 'premium' && (
                  <button
                    onClick={() => {
                      onGoUpgrade()
                      setIsMobileMenuOpen(false)
                    }}
                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-brand-600 hover:bg-brand-50"
                  >
                     {t('upgradeToPremium')}
                  </button>
                )}
                
                <div className="border-t border-gray-200 my-2"></div>

                <button
                  onClick={() => {
                    toggleLanguage()
                    setIsMobileMenuOpen(false)
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-700"
                >
                   {t('switchLanguage')} ({settings?.language === 'id' ? 'ID' : 'EN'})
                </button>

                <button
                  onClick={() => {
                    onLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                >
                   {t('logout')}
                </button>
              </>
            ) : (
              <div className="px-3 py-2">
                 <Button onClick={() => {
                   onLogin()
                   setIsMobileMenuOpen(false)
                 }} className="w-full justify-center">
                    {t('loginRegister')}
                  </Button>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                     <button
                        onClick={() => {
                          toggleLanguage()
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex items-center gap-2 text-gray-600 font-medium"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{t('switchLanguage')} ({settings?.language === 'id' ? 'ID' : 'EN'})</span>
                      </button>
                  </div>
              </div>
            )}
          </div>
        </div>
      )}
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
  onGoProfile: PropTypes.func,
  user: PropTypes.object,
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func
}