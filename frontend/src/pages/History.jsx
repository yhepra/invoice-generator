import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { storage } from "../services/storage"
import formatCurrency from "../utils/formatCurrency"
import Button from "../components/common/Button"
import ConfirmModal from "../components/common/ConfirmModal"

export default function History({ onLoadInvoice }) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPeriod, setFilterPeriod] = useState("all") // 'all', '30days', 'thisMonth', 'lastMonth'
  const [filterStatus, setFilterStatus] = useState("all") // 'all', 'Draft', 'Unpaid', 'Paid', 'Overdue'

  // Pagination & View Mode State
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = viewMode === 'grid' ? 9 : 10

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const data = await storage.getInvoices()
        // Sort by savedAt descending (newest first)
        const sortedData = data.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
        setInvoices(sortedData)
      } catch (err) {
        console.error("Failed to load history:", err)
        setError("Failed to load invoices. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Reset page when view mode or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [viewMode, searchQuery, filterPeriod, filterStatus])

  const confirmDelete = (invoice) => {
    setInvoiceToDelete(invoice)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (invoiceToDelete) {
      await storage.deleteInvoice(invoiceToDelete.historyId)
      const data = await storage.getInvoices()
      const sortedData = data.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      setInvoices(sortedData)
      setInvoiceToDelete(null)
    }
  }

  const handleStatusChange = async (invoice, newStatus) => {
    // Optimistic update
    const originalInvoices = [...invoices];
    const updatedInvoices = invoices.map(inv => 
        inv.historyId === invoice.historyId ? { ...inv, status: newStatus } : inv
    );
    setInvoices(updatedInvoices);

    try {
        await storage.saveInvoice({ ...invoice, status: newStatus });
    } catch (err) {
        console.error("Failed to update status", err);
        setError("Failed to update status");
        setInvoices(originalInvoices); // Revert
    }
  }

  // Filter Logic
  const filteredInvoices = invoices.filter(inv => {
    // 1. Search Filter
    const query = searchQuery.toLowerCase()
    const number = inv.details?.number?.toLowerCase() || ""
    const customer = inv.customer?.name?.toLowerCase() || ""
    // Format date for search matching
    const dateObj = inv.savedAt ? new Date(inv.savedAt) : null
    const dateStr = dateObj ? dateObj.toLocaleDateString().toLowerCase() : ""
    
    const matchesSearch = number.includes(query) || customer.includes(query) || dateStr.includes(query)

    if (!matchesSearch) return false

    // 2. Time Period Filter
    if (filterPeriod !== 'all') {
        if (!dateObj) return false // Should not happen if savedAt exists

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const invDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())

        if (filterPeriod === '30days') {
            const thirtyDaysAgo = new Date(today)
            thirtyDaysAgo.setDate(today.getDate() - 30)
            if (invDate < thirtyDaysAgo) return false
        } else if (filterPeriod === 'thisMonth') {
            if (invDate.getMonth() !== today.getMonth() || invDate.getFullYear() !== today.getFullYear()) return false
        } else if (filterPeriod === 'lastMonth') {
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
            const endLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
            if (invDate < lastMonth || invDate > endLastMonth) return false
        }
    }

    // 3. Status Filter
    if (filterStatus !== 'all') {
        // Since backend might not store status yet, we use the derived status logic
        // or check if 'status' property exists (if we added it to storage.js)
        const status = inv.status || 'Unpaid'; // Default if undefined
        if (status !== filterStatus) return false;
    }

    return true
  })

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
        <div className="mt-8 flex justify-center gap-2">
            <Button 
                variant="secondary" 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm disabled:opacity-50"
            >
                Prev
            </Button>
            
            <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => {
                    const page = i + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                        return (
                            <button
                                key={page}
                                onClick={() => paginate(page)}
                                className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                                    currentPage === page
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                }`}
                            >
                                {page}
                            </button>
                        );
                    } else if (
                        page === currentPage - 2 || 
                        page === currentPage + 2
                    ) {
                        return <span key={page} className="px-1 text-gray-400">...</span>;
                    }
                    return null;
                })}
            </div>

            <Button 
                variant="secondary" 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm disabled:opacity-50"
            >
                Next
            </Button>
        </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
        case 'Paid': return 'bg-green-100 text-green-800 border-green-200';
        case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
        case 'Draft': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-blue-100 text-blue-800 border-blue-200'; // Unpaid
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="text-2xl font-bold">Invoice History</h1>
            
            {/* View Toggles */}
            <div className="flex items-center rounded-lg border bg-white p-1 shadow-sm">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                        viewMode === 'grid' 
                        ? 'bg-brand-50 text-brand-600 shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    title="Grid View"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                        viewMode === 'list' 
                        ? 'bg-brand-50 text-brand-600 shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    title="List View"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="hidden sm:inline">List</span>
                </button>
            </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm"
                    placeholder="Search by number, customer, or date..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <select
                className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:w-auto sm:text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="all">All Status</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Draft">Draft</option>
            </select>
            <select
                className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:w-auto sm:text-sm"
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
            >
                <option value="all">All Time</option>
                <option value="30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
            </select>
        </div>
      </div>
      
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
        <>
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {currentItems.map((inv) => (
                    <div key={inv.historyId} className="flex flex-col justify-between rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-brand-200">
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                        <span className="font-semibold text-gray-900">#{inv.details?.number || "N/A"}</span>
                        <select
                            value={inv.status || 'Unpaid'}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStatusChange(inv, e.target.value)}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${getStatusColor(inv.status)}`}
                        >
                            <option value="Draft" className="bg-white text-gray-800">Draft</option>
                            <option value="Unpaid" className="bg-white text-gray-800">Unpaid</option>
                            <option value="Paid" className="bg-white text-gray-800">Paid</option>
                            <option value="Overdue" className="bg-white text-gray-800">Overdue</option>
                        </select>
                        </div>
                        <div className="mb-4 text-sm">
                        <p className="text-gray-500 mb-1">
                            {inv.savedAt ? new Date(inv.savedAt).toLocaleDateString() : "Unknown Date"}
                        </p>
                        <p className="font-medium text-gray-700 truncate" title={inv.customer?.name}>{inv.customer?.name || "Unknown Customer"}</p>
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
                            variant="secondary"
                        >
                            Open
                        </Button>
                        <Button
                            onClick={() => confirmDelete(inv)}
                            variant="outline"
                            className="px-3 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            title="Delete Invoice"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </Button>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentItems.map(inv => (
                                    <tr key={inv.historyId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{inv.details?.number || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {inv.savedAt ? new Date(inv.savedAt).toLocaleDateString() : "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={inv.status || 'Unpaid'}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => handleStatusChange(inv, e.target.value)}
                                                className={`rounded-full px-2 py-1 text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${getStatusColor(inv.status)}`}
                                            >
                                                <option value="Draft" className="bg-white text-gray-800">Draft</option>
                                                <option value="Unpaid" className="bg-white text-gray-800">Unpaid</option>
                                                <option value="Paid" className="bg-white text-gray-800">Paid</option>
                                                <option value="Overdue" className="bg-white text-gray-800">Overdue</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {inv.customer?.name || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-600">
                                            {formatCurrency(inv.totals?.total || 0, inv.settings)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => onLoadInvoice(inv)}
                                                    className="text-brand-600 hover:text-brand-900"
                                                    title="Open Invoice"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button 
                                                    onClick={() => confirmDelete(inv)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete Invoice"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {renderPagination()}
        </>
      )}
    </div>
  )
}

History.propTypes = {
  onLoadInvoice: PropTypes.func.isRequired
}
