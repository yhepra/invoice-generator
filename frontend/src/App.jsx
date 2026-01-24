import React, { useState, useEffect } from "react"
import InvoiceEditor from "./pages/Home.jsx"
import Landing from "./pages/Landing.jsx"
import Settings from "./pages/Settings.jsx"
import History from "./pages/History.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import Header from "./components/common/Header.jsx"
import Toast from "./components/common/Toast.jsx"
import useInvoice from "./hooks/useInvoice.js"
import { storage } from "./services/storage"
import { auth } from "./services/auth"
import defaultInvoice from "./data/defaultInvoice"

export default function App() {
  const [page, setPage] = useState("landing")
  const [toast, setToast] = useState(null)
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const hideToast = () => {
    setToast(null)
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setLoadingUser(false);
      }
    };
    checkUser();
  }, []);

  const invoiceApi = useInvoice(defaultInvoice)
  const { invoice, updateSettings, setInvoice, downloadPDF } = invoiceApi

  // Load settings when user changes or app starts
  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await storage.getSettings()
      if (savedSettings) {
        updateSettings(savedSettings)
      }
    }
    if (!loadingUser) {
        loadSettings()
    }
  }, [user, loadingUser])

  const [isSaving, setIsSaving] = useState(false)

  // Save settings when they change
  useEffect(() => {
    if (invoice.settings) {
      const save = async () => {
        setIsSaving(true)
        await storage.saveSettings(invoice.settings)
        setTimeout(() => setIsSaving(false), 1000) // Show saving state for at least 1s
      }
      
      const timeoutId = setTimeout(save, 500) // Debounce 500ms
      return () => clearTimeout(timeoutId)
    }
  }, [invoice.settings])

  const handleLoadInvoice = (loadedInvoice, targetPage = "editor") => {
    if (targetPage === 'history') {
      setPage("history")
      return
    }
    // Remove history specific fields before loading
    const { historyId, savedAt, ...data } = loadedInvoice
    setInvoice(data)
    setPage("editor")
  }

  const handleSaveInvoice = async () => {
    if (!user) {
      setPage("login");
      showToast("Please login to save invoices", "error");
      return;
    }
    try {
      await storage.saveInvoice(invoice)
      showToast("Invoice saved to history!", "success")
    } catch (error) {
      showToast(error.message || "Failed to save invoice.", "error")
    }
  }

  const handleDownloadPDF = async () => {
    if (!user) {
      setPage("login");
      showToast("Please login to download invoices", "error");
      return;
    }
    downloadPDF();
  }

  const handleLogin = (user) => {
    setUser(user);
    setPage("landing");
    showToast(`Welcome back, ${user.name}!`, "success");
  }

  const handleRegister = (user) => {
    setUser(user);
    setPage("landing");
    showToast(`Welcome, ${user.name}! Account created.`, "success");
  }

  const handleLogout = async () => {
    await auth.logout();
    setUser(null);
    setPage("landing");
    showToast("Logged out successfully", "success");
  }

  if (loadingUser) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}
      <Header
        title="Invoice Generator"
        onGoHome={() => setPage("landing")}
        onGoEditor={() => setPage("editor")}
        onGoSettings={() => setPage("settings")}
        onGoHistory={() => setPage("history")}
        user={user}
        onLogin={() => setPage("login")}
        onLogout={handleLogout}
      />
      {page === "landing" && (
        <Landing 
          user={user}
          onCreateInvoice={() => setPage("editor")}
          onLoadInvoice={handleLoadInvoice}
          onLogin={() => setPage("login")}
          onRegister={() => setPage("register")}
        />
      )}
      {page === "editor" && (
        <InvoiceEditor 
          {...invoiceApi} 
        />
      )}
      {page === "settings" && (
        <Settings 
          settings={invoice.settings} 
          onChange={updateSettings} 
          isSaving={isSaving}
        />
      )}
      {page === "history" && (
        <History onLoadInvoice={handleLoadInvoice} />
      )}
      {page === "login" && (
        <Login 
          onLogin={handleLogin} 
          onRegisterClick={() => setPage("register")}
          onCancel={() => setPage("landing")}
        />
      )}
      {page === "register" && (
        <Register 
          onRegister={handleRegister} 
          onLoginClick={() => setPage("login")}
          onCancel={() => setPage("landing")}
        />
      )}
    </div>
  )
}
