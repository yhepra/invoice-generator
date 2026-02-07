import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import InvoiceEditorPage from "./pages/InvoiceEditorPage.jsx";
import Landing from "./pages/Landing.jsx";
import Settings from "./pages/Settings.jsx";
import History from "./pages/History.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";
import Header from "./components/common/Header.jsx";
import Upgrade from "./pages/Upgrade.jsx";
import Profile from "./pages/Profile.jsx";
import Toast from "./components/common/Toast.jsx";
import useInvoice from "./hooks/useInvoice.js";
import { storage } from "./services/storage";
import { auth } from "./services/auth";
import defaultInvoice from "./data/defaultInvoice";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [toasts, setToasts] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [pendingAction, setPendingAction] = useState(null); // 'save' | 'download' | null
  const isRemoteUpdate = useRef(false);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => {
      const newToasts = [...prev, { id, message, type }];
      if (newToasts.length > 3) {
        return newToasts.slice(newToasts.length - 3);
      }
      return newToasts;
    });
  };

  const hideToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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
    if (path.includes("/upgrade/success")) {
      const invoiceId = localStorage.getItem("pending_upgrade_invoice_id");
      if (invoiceId) {
        // Verify payment status with backend
        auth
          .verifyPayment(invoiceId)
          .then((res) => {
            if (res.status === "success") {
              showToast("Upgrade successful! Welcome to Premium.", "success");
              setUser(res.user); // Update user immediately
            } else {
              showToast("Payment processing. Please check back later.", "info");
              // Attempt to fetch latest user state anyway
              checkUser();
            }
          })
          .catch((err) => {
            console.error(err);
            showToast(
              "Failed to verify payment. Please contact support.",
              "error",
            );
            checkUser();
          })
          .finally(() => {
            setLoadingUser(false);
            localStorage.removeItem("pending_upgrade_invoice_id");
            navigate("/");
          });
      } else {
        // Fallback to simple user check if no ID found (legacy behavior)
        checkUser().then((u) => {
          showToast("Upgrade process completed.", "info");
          navigate("/");
        });
      }
    } else if (path.includes("/upgrade/failure")) {
      showToast("Payment failed or cancelled.", "error");
      navigate("/upgrade");
      checkUser();
    } else {
      checkUser();
    }

    // Check for reset password URL
    if (window.location.hash.includes("reset-password")) {
      // Navigate is handled by Router now, but hash routing might need manual check if we use standard Routes
      // Assuming /reset-password route exists
    }
  }, []);

  const invoiceApi = useInvoice(defaultInvoice);
  const { invoice, updateSettings, setInvoice, downloadPDF } = invoiceApi;

  // Load settings when user changes or app starts
  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await storage.getSettings();
      if (savedSettings) {
        isRemoteUpdate.current = true;
        updateSettings(savedSettings);
      }
    };
    if (!loadingUser) {
      loadSettings();
    }
  }, [user, loadingUser]);

  const [isSaving, setIsSaving] = useState(false);

  // Save settings when they change
  useEffect(() => {
    if (invoice.settings) {
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }

      const save = async () => {
        setIsSaving(true);
        await storage.saveSettings(invoice.settings);
        setTimeout(() => setIsSaving(false), 1000); // Show saving state for at least 1s
      };

      const timeoutId = setTimeout(save, 500); // Debounce 500ms
      return () => clearTimeout(timeoutId);
    }
  }, [invoice.settings]);

  const handleLoadInvoiceById = useCallback(
    async (id) => {
      const invoices = await storage.getInvoices();
      // Try to find by historyId (backend id) or id (frontend generated id)
      const found = invoices.find(
        (inv) =>
          String(inv.historyId) === String(id) || String(inv.id) === String(id),
      );

      if (found) {
        const merged = {
          ...defaultInvoice,
          ...found,
          settings: { ...defaultInvoice.settings, ...found.settings },
          seller: { ...defaultInvoice.seller, ...found.seller },
          customer: { ...defaultInvoice.customer, ...found.customer },
          details: { ...defaultInvoice.details, ...found.details },
          items: found.items || [],
        };
        setInvoice(merged);
      } else {
        throw new Error("Invoice not found");
      }
    },
    [setInvoice],
  );

  const handleResetInvoice = useCallback(() => {
    // Keep current settings but reset content
    setInvoice((prev) => ({
      ...JSON.parse(JSON.stringify(defaultInvoice)),
      settings: prev.settings,
    }));
  }, [setInvoice]);

  const handleCreateInvoiceWrapper = useCallback(() => {
    // Check for location state (if loaded from Landing)
    if (location.state?.initialData) {
      const { savedAt, ...data } = location.state.initialData;
      setInvoice(data);
      // Clear state so refresh resets? Or replace history?
      window.history.replaceState({}, document.title);
    } else {
      handleResetInvoice();
    }
  }, [location.state, handleResetInvoice, setInvoice]);

  // Wrapper for Landing page to handle load
  const handleLoadInvoiceFromLanding = (loadedInvoice) => {
    // If it has historyId, navigate to edit
    if (loadedInvoice.historyId) {
      navigate(`/edit/${loadedInvoice.historyId}`);
    } else {
      // Fallback for unsaved/local invoices?
      // Just load it and go to create (which is actually just editor)
      // But /create usually resets.
      // So we might need a way to pass initial state to /create or use a temp ID.
      // For now, let's just set it and navigate to /create (but /create resets!)

      // Workaround: Set state then navigate to a special route or /create with query param?
      // Or just /create and preventing reset if state is already set?
      // But /create route calls handleResetInvoice.

      // Let's assume all historical invoices have historyId if saved.
      // If not, we might need to save it first or handle this edge case.

      // For now, we will just set it and stay on /create but we need to prevent reset.
      // The InvoiceEditorPage calls onResetInvoice if no ID.

      // FIX: If we load from Landing, we should probably just go to /create
      // AND update InvoiceEditorPage to ONLY reset if it's NOT already loaded?
      // No, that's flaky.

      // Better: Save it as a draft and get an ID?
      // Or just load it into state and navigate to /create, but modify InvoiceEditorPage
      // to take a prop `resetOnMount` which defaults to true, but we can pass false?
      // But we can't pass props via navigate easily without location state.

      // Let's use location state.
      navigate("/create", { state: { initialData: loadedInvoice } });
    }
  };

  const validateInvoice = () => {
    if (!invoice.seller.name.trim()) {
      showToast("Seller name is required", "error");
      return false;
    }
    if (!invoice.customer.name.trim()) {
      showToast("Customer name is required", "error");
      return false;
    }
    if (invoice.items.length === 0) {
      showToast("Please add at least one item", "error");
      return false;
    }
    for (const item of invoice.items) {
      if (!item.name.trim()) {
        showToast("All items must have a name", "error");
        return false;
      }
      if (item.quantity <= 0) {
        showToast(
          `Item "${item.name}" quantity must be greater than 0`,
          "error",
        );
        return false;
      }
    }
    return true;
  };

  const handleSaveInvoice = async (showSuccessToast = true) => {
    if (!user) {
      setPendingAction("save");
      navigate("/login");
      showToast("Please login to save invoices", "error");
      return false;
    }

    if (!validateInvoice()) {
      return false;
    }

    try {
      const savedInvoice = await storage.saveInvoice(invoice);
      setInvoice((prev) => ({ ...prev, historyId: savedInvoice.historyId }));
      if (showSuccessToast) showToast("Invoice saved to history!", "success");

      // Update URL to /edit/:id if not already
      navigate(`/edit/${savedInvoice.historyId}`, { replace: true });

      return true;
    } catch (error) {
      showToast(error.message || "Failed to save invoice.", "error");
      return false;
    }
  };

  const handleDownloadPDF = async () => {
    if (!user) {
      setPendingAction("download");
      navigate("/login");
      showToast("Please login to download invoices", "error");
      return;
    }

    const saved = await handleSaveInvoice(false);
    if (!saved) return;

    try {
      const contacts = await storage.getContacts();
      if (invoice.seller.name) {
        const sellerExists = contacts.some(
          (c) =>
            c.type === "seller" &&
            c.name.toLowerCase() === invoice.seller.name.toLowerCase(),
        );

        // Check for free plan limit
        const isFree = !user || user.plan === "free";
        const sellerCount = contacts.filter((c) => c.type === "seller").length;

        if (!sellerExists) {
          if (isFree && sellerCount >= 1) {
            showToast(
              "Free plan limit reached: Seller contact was not saved.",
              "info",
            );
          } else {
            await storage.saveContact({
              ...invoice.seller,
              type: "seller",
            });
          }
        }
      }
      if (invoice.customer.name) {
        const customerExists = contacts.some(
          (c) =>
            c.type === "customer" &&
            c.name.toLowerCase() === invoice.customer.name.toLowerCase(),
        );
        if (!customerExists) {
          await storage.saveContact({
            ...invoice.customer,
            type: "customer",
          });
        }
      }
    } catch (error) {
      console.error("Error auto-saving contacts:", error);
    }

    downloadPDF();
  };

  const handleLogin = (user) => {
    setUser(user);
    showToast(`Welcome back, ${user.name}!`, "success");

    if (pendingAction) {
      navigate("/create"); // Or back to where they were
      // Handle pending action logic if needed
      setPendingAction(null);
    } else {
      navigate("/");
    }
  };

  const handleRegister = (user, message) => {
    setUser(user);
    showToast(message || `Welcome, ${user.name}! Account created.`, "success");

    if (pendingAction) {
      navigate("/create");
      setPendingAction(null);
    } else {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    await auth.logout();
    setUser(null);
    navigate("/");
    showToast("Logged out successfully", "success");
  };

  if (loadingUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
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
        title="GenerateInvoice"
        onGoHome={() => navigate("/")}
        onGoEditor={() => navigate("/create")}
        onGoSettings={() => navigate("/settings")}
        onGoHistory={() => navigate("/history")}
        onGoUpgrade={() => navigate("/upgrade")}
        onGoProfile={() => navigate("/profile")}
        user={user}
        onLogin={() => navigate("/login")}
        onLogout={handleLogout}
        settings={invoice.settings}
        onUpdateSettings={updateSettings}
      />
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Landing
                user={user}
                onCreateInvoice={() => navigate("/create")}
                onLoadInvoice={handleLoadInvoiceFromLanding}
                onGoUpgrade={() => navigate("/upgrade")}
                onGoHistory={() => navigate("/history")}
                onLogin={() => navigate("/login")}
                onRegister={() => navigate("/register")}
                settings={invoice.settings}
              />
            }
          />
          <Route
            path="/create"
            element={
              <InvoiceEditorPage
                invoiceApi={invoiceApi}
                onLoadInvoice={handleLoadInvoiceById}
                onResetInvoice={handleCreateInvoiceWrapper}
                onSave={handleSaveInvoice}
                onDownload={handleDownloadPDF}
                user={user}
              />
            }
          />
          <Route
            path="/edit/:id"
            element={
              <InvoiceEditorPage
                invoiceApi={invoiceApi}
                onLoadInvoice={handleLoadInvoiceById}
                onResetInvoice={handleResetInvoice}
                onSave={handleSaveInvoice}
                onDownload={handleDownloadPDF}
                user={user}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <Settings
                settings={invoice.settings}
                onChange={updateSettings}
                isSaving={isSaving}
                user={user}
              />
            }
          />
          <Route
            path="/history"
            element={
              <History
                onLoadInvoice={(inv) => handleLoadInvoiceFromLanding(inv)}
                settings={invoice.settings}
              />
            }
          />
          <Route
            path="/auth/callback"
            element={
              <AuthCallback
                onLogin={(user) => {
                  setUser(user);
                  showToast(`Welcome back, ${user.name}!`);
                }}
              />
            }
          />
          <Route
            path="/login"
            element={
              <Login
                onLogin={handleLogin}
                onRegisterClick={() => navigate("/register")}
                onForgotPasswordClick={() => navigate("/forgot-password")}
                onCancel={() => navigate("/")}
                settings={invoice.settings}
              />
            }
          />
          <Route
            path="/register"
            element={
              <Register
                onRegister={handleRegister}
                onLoginClick={() => navigate("/login")}
                onCancel={() => navigate("/")}
                settings={invoice.settings}
              />
            }
          />
          <Route
            path="/forgot-password"
            element={<ForgotPassword onCancel={() => navigate("/login")} />}
          />
          <Route
            path="/reset-password"
            element={
              <ResetPassword
                onLogin={() => navigate("/login")}
                onCancel={() => navigate("/")}
              />
            }
          />
          <Route
            path="/upgrade"
            element={
              <Upgrade
                user={user}
                settings={invoice.settings}
                onUpgradeSuccess={(updatedUser) => {
                  setUser(updatedUser);
                  showToast("Successfully upgraded to Premium!");
                  navigate("/");
                }}
                onCancel={() => navigate("/")}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <Profile
                user={user}
                settings={invoice.settings}
                onUpdateUser={(updatedUser) => {
                  setUser(updatedUser);
                  showToast("Profile updated successfully", "success");
                }}
              />
            }
          />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
