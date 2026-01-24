import React, { useState, useEffect, useRef } from "react"
import InvoiceEditor from "./pages/Home.jsx"
import Landing from "./pages/Landing.jsx"
import Settings from "./pages/Settings.jsx"
import History from "./pages/History.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import ForgotPassword from "./pages/ForgotPassword.jsx"
import ResetPassword from "./pages/ResetPassword.jsx"
import Header from "./components/common/Header.jsx"
import Upgrade from "./pages/Upgrade.jsx"
import Toast from "./components/common/Toast.jsx"
import useInvoice from "./hooks/useInvoice.js"
import { storage } from "./services/storage"
import { auth } from "./services/auth"
import defaultInvoice from "./data/defaultInvoice"

export default function App() {
  const [page, setPage] = useState("landing")
  const [toasts, setToasts] = useState([])
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [pendingAction, setPendingAction] = useState(null) // 'save' | 'download' | null
  const isRemoteUpdate = useRef(false)

  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => {
        const newToasts = [...prev, { id, message, type }]
        if (newToasts.length > 3) {
            return newToasts.slice(newToasts.length - 3)
        }
        return newToasts
    })
  }

  const hideToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await auth.me();
        setUser(currentUser);
        return currentUser;
      } catch (error) {
        console.error("Auth check failed", error);
        return null;
      } finally {
        setLoadingUser(false);
      }
    };

    // Check URL for upgrade callbacks
    const path = window.location.pathname;
    if (path.includes('/upgrade/success')) {
        const invoiceId = localStorage.getItem('pending_upgrade_invoice_id');
        if (invoiceId) {
            // Verify payment status with backend
            auth.verifyPayment(invoiceId).then((res) => {
                if (res.status === 'success') {
                    showToast("Upgrade successful! Welcome to Premium.", "success");
                    setUser(res.user); // Update user immediately
                } else {
                    showToast("Payment processing. Please check back later.", "info");
                    // Attempt to fetch latest user state anyway
                    checkUser();
                }
            }).catch(err => {
                console.error(err);
                showToast("Failed to verify payment. Please contact support.", "error");
                checkUser();
            }).finally(() => {
                 setLoadingUser(false);
                 localStorage.removeItem('pending_upgrade_invoice_id');
                 setPage('editor');
                 window.history.pushState({}, '', '/');
            });
        } else {
            // Fallback to simple user check if no ID found (legacy behavior)
            checkUser().then((u) => {
                showToast("Upgrade process completed.", "info");
                setPage('editor');
                window.history.pushState({}, '', '/');
            });
        }
    } else if (path.includes('/upgrade/failure')) {
        showToast("Payment failed or cancelled.", "error");
        setPage('upgrade');
        window.history.pushState({}, '', '/');
        checkUser();
    } else {
        checkUser();
    }

    // Check for reset password URL
    if (window.location.hash.includes('reset-password')) {
      setPage('reset-password');
    }
  }, []);

  const invoiceApi = useInvoice(defaultInvoice)
  const { invoice, updateSettings, setInvoice, downloadPDF } = invoiceApi

  // Load settings when user changes or app starts
  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await storage.getSettings()
      if (savedSettings) {
        isRemoteUpdate.current = true
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
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false
        return
      }
      
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
    // Load invoice data including historyId for updates
    const { savedAt, ...data } = loadedInvoice
    setInvoice(data)
    setPage("editor")
  }

  const handleSaveInvoice = async (showSuccessToast = true) => {
    if (!user) {
      setPendingAction('save')
      setPage("login");
      showToast("Please login to save invoices", "error");
      return false;
    }
    try {
      const savedInvoice = await storage.saveInvoice(invoice)
      setInvoice(prev => ({ ...prev, historyId: savedInvoice.historyId }))
      if (showSuccessToast) showToast("Invoice saved to history!", "success")
      return true
    } catch (error) {
      showToast(error.message || "Failed to save invoice.", "error")
      return false
    }
  }

  const handleDownloadPDF = async () => {
    if (!user) {
      setPendingAction('download')
      setPage("login");
      showToast("Please login to download invoices", "error");
      return;
    }
    
    // Attempt to save invoice first to check limits
    // This ensures users can't download if they've reached their invoice limit
    const saved = await handleSaveInvoice(false)
    if (!saved) return

    // Auto-save contacts before download
    try {
        const contacts = await storage.getContacts()
        if (invoice.seller.name) {
            const sellerExists = contacts.some(
                c => c.type === 'seller' && c.name.toLowerCase() === invoice.seller.name.toLowerCase()
            )
            if (!sellerExists) {
                await storage.saveContact({
                    ...invoice.seller,
                    type: 'seller'
                })
            }
        }
        if (invoice.customer.name) {
            const customerExists = contacts.some(
                c => c.type === 'customer' && c.name.toLowerCase() === invoice.customer.name.toLowerCase()
            )
            if (!customerExists) {
                await storage.saveContact({
                    ...invoice.customer,
                    type: 'customer'
                })
            }
        }
    } catch (error) {
        console.error("Error auto-saving contacts:", error)
    }

    downloadPDF();
  }

  const handleLogin = (user) => {
    setUser(user);
    showToast(`Welcome back, ${user.name}!`, "success");
    
    if (pendingAction) {
        setPage("editor")
        // Optionally trigger the action automatically
        if (pendingAction === 'save') {
             // We can't easily call handleSaveInvoice here because state updates might not be flushed.
             // But user is now on editor page, they can click save again.
             // Or we can use useEffect to trigger it.
             // For now, just returning to editor is what user asked: "kembali ke halaman yang udah di isi dan bisa save dan download"
        }
        setPendingAction(null)
    } else {
        setPage("landing");
    }
  }

  const handleRegister = (user) => {
    setUser(user);
    showToast(`Welcome, ${user.name}! Account created.`, "success");

    if (pendingAction) {
        setPage("editor")
        setPendingAction(null)
    } else {
        setPage("landing");
    }
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
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={() => hideToast(toast.id)} 
            />
          </div>
        ))}
      </div>
      <Header 
        title={invoice.details?.headerTitle || "Invoice Generator"} 
        onGoHome={() => setPage("landing")}
        onGoEditor={() => setPage("editor")}
        onGoSettings={() => setPage("settings")}
        onGoHistory={() => setPage("history")}
        onGoUpgrade={() => setPage("upgrade")}
        user={user}
        onLogin={() => setPage("login")}
        onLogout={handleLogout}
      />
      <main className="flex-1">
        {page === "landing" && (
          <Landing 
            user={user} 
            onCreateInvoice={() => setPage("editor")}
            onLoadInvoice={handleLoadInvoice}
            onGoUpgrade={() => setPage("upgrade")}
            onLogin={() => setPage("login")}
            onRegister={() => setPage("register")}
          />
        )}
        {page === "upgrade" && (
          <Upgrade 
            user={user}
            onUpgradeSuccess={(updatedUser) => {
              setUser(updatedUser)
              showToast("Successfully upgraded to Premium!")
              setPage("landing")
            }}
            onCancel={() => setPage("landing")}
          />
        )}
        {page === "editor" && (
        <InvoiceEditor 
          {...invoiceApi} 
          onSave={handleSaveInvoice}
          onDownload={handleDownloadPDF}
          user={user}
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
          onForgotPasswordClick={() => setPage("forgot-password")}
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
      {page === "forgot-password" && (
        <ForgotPassword 
          onCancel={() => setPage("login")}
        />
      )}
      {page === "reset-password" && (
        <ResetPassword 
          onLogin={() => setPage("login")}
          onCancel={() => setPage("landing")}
        />
      )}
      </main>
    </div>
  )
}
