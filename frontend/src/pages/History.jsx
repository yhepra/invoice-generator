import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { storage } from "../services/storage"
import formatCurrency from "../utils/formatCurrency"
import Button from "../components/common/Button"

export default function History({ onLoadInvoice }) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const data = await storage.getInvoices()
        setInvoices(data)
      } catch (err) {
        console.error("Failed to load history:", err)
        setError("Failed to load invoices. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleDelete = async (historyId) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      await storage.deleteInvoice(historyId)
      setInvoices(await storage.getInvoices())
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Invoice History</h1>
      
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-500">Loading history...</div>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-gray-500">
          <p>No saved invoices found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {invoices.map((inv) => (
            <div key={inv.historyId} className="flex flex-col justify-between rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">#{inv.details?.number || "N/A"}</span>
                  <span className="text-xs text-gray-500">
                    {inv.savedAt ? new Date(inv.savedAt).toLocaleDateString() : "Unknown Date"}
                  </span>
                </div>
                <div className="mb-4 text-sm">
                  <p className="font-medium text-gray-700">{inv.customer?.name || "Unknown Customer"}</p>
                  <p className="text-gray-500">{inv.items?.length || 0} items</p>
                </div>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-bold text-brand-600">
                    {formatCurrency(inv.totals?.total || 0, inv.settings)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onLoadInvoice(inv)}
                    className="flex-1"
                  >
                    Load
                  </Button>
                  <Button
                    onClick={() => handleDelete(inv.historyId)}
                    variant="outline"
                    className="hover:text-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

History.propTypes = {
  onLoadInvoice: PropTypes.func.isRequired
}
