import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { storage } from "../services/storage"
import formatCurrency from "../utils/formatCurrency"
import Button from "../components/common/Button"

export default function Landing({ user, onCreateInvoice, onLoadInvoice, onLogin, onRegister }) {
  const [recentInvoices, setRecentInvoices] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true)
        try {
          const invoices = await storage.getInvoices()
          // Get top 3 most recent
          setRecentInvoices(invoices.slice(0, 3))
        } catch (error) {
          console.error("Failed to load recent invoices", error)
        } finally {
          setLoading(false)
        }
      }
      loadData()
    }
  }, [user])

  if (user) {
    return (
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-gradient-to-r from-brand-600 to-blue-600 p-8 text-white shadow-lg md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Welcome back, {user.name}!</h1>
            <p className="text-blue-100">Ready to create your next professional invoice?</p>
          </div>
          <Button 
            onClick={onCreateInvoice} 
            variant="secondary"
            className="border-none shadow-md px-6 py-3 text-lg"
          >
            Create New Invoice
          </Button>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Recent Invoices</h2>
          {recentInvoices.length > 0 && (
            <button 
              onClick={() => onLoadInvoice(null, 'history')} // Special handler to go to history
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View All History &rarr;
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading dashboard...</div>
        ) : recentInvoices.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 p-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">No invoices yet</h3>
            <p className="mb-6 text-gray-500">Create your first invoice to see it here.</p>
            <Button onClick={onCreateInvoice}>
              Create Invoice
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentInvoices.map((inv) => (
              <div key={inv.historyId} className="group relative flex flex-col justify-between rounded-xl border bg-white p-5 shadow-sm transition-all hover:border-brand-300 hover:shadow-md">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-md bg-gray-100 px-2.5 py-1 text-sm font-semibold text-gray-700">
                      #{inv.details.number}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(inv.savedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mb-4">
                    <p className="mb-1 truncate font-medium text-gray-900" title={inv.customer.name}>
                      {inv.customer.name || "Unknown Customer"}
                    </p>
                    <p className="text-sm text-gray-500">{inv.items.length} items</p>
                  </div>
                </div>
                
                <div className="mt-4 border-t pt-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <span className="text-lg font-bold text-brand-600">
                      {formatCurrency(inv.totals.total, inv.settings)}
                    </span>
                  </div>
                  <Button 
                    onClick={() => onLoadInvoice(inv)} 
                    variant="secondary"
                    className="w-full"
                  >
                    Edit / View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Guest Landing Page
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 px-4 py-20 text-center text-white md:px-8 md:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="relative mx-auto max-w-4xl">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Professional Invoices <span className="text-brand-400">Made Simple</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 sm:text-xl">
            Create, manage, and track invoices effortlessly. No complex software, just a clean interface to get you paid faster.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button 
              onClick={onCreateInvoice} 
              className="h-12 px-8 text-lg font-semibold shadow-lg shadow-brand-900/20"
            >
              Create Invoice Now
            </Button>
            <Button 
              onClick={onRegister} 
              variant="secondary"
              className="h-12 px-8 text-lg font-semibold text-slate-900 border-none hover:bg-gray-100"
            >
              Create Free Account
            </Button>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Already have an account? <button onClick={onLogin} className="text-brand-400 hover:text-brand-300 underline">Log in</button>
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 shadow-sm transition-transform hover:-translate-y-1">
              <div className="mb-4 inline-block rounded-lg bg-blue-100 p-3 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Lightning Fast</h3>
              <p className="text-gray-600">Generate PDF invoices in seconds. Auto-save ensures you never lose your work.</p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm transition-transform hover:-translate-y-1">
              <div className="mb-4 inline-block rounded-lg bg-green-100 p-3 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Secure & Organized</h3>
              <p className="text-gray-600">Keep all your invoices in one place. Login to access your history from anywhere.</p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm transition-transform hover:-translate-y-1">
              <div className="mb-4 inline-block rounded-lg bg-purple-100 p-3 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Professional Look</h3>
              <p className="text-gray-600">Clean, professional templates that make your business look good. Customizable currency and locale.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

Landing.propTypes = {
  user: PropTypes.object,
  onCreateInvoice: PropTypes.func.isRequired,
  onLoadInvoice: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired
}