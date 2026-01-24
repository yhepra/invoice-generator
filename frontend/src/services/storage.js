import calculateTotals from "../utils/calculateTotals";

const API_URL = "http://localhost:8000/api";

const STORAGE_KEYS = {
  SETTINGS: "invoice_gen_settings",
}

// Helper to determine status based on invoice data
const calculateStatus = (inv) => {
    // If it has a status field from backend, use it (future proofing)
    // But if it's 'draft', we recalculate to show 'Overdue'/'Outstanding' based on dates
    // unless the user explicitly wants 'Draft' (which we can't distinguish yet without another flag)
    if (inv.status && inv.status.toLowerCase() !== 'draft') {
        // Normalize to Title Case (e.g. 'PAID' -> 'Paid')
        const s = inv.status.toLowerCase();
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
    
    // Logic for derived status
    const dueDate = inv.due_date ? new Date(inv.due_date) : null;
    const now = new Date();
    
    // Simple logic: 
    // - If no due date -> Draft
    // - If due date passed -> Overdue
    // - Else -> Outstanding
    // Note: 'Paid' would typically require a specific flag or payment record
    
    if (!dueDate) return 'Draft';
    
    // Compare dates (ignore time)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    
    if (due < today) return 'Overdue';
    
    return 'Unpaid';
};

export const storage = {
  // Settings (Hybrid: API first, fallback to LocalStorage)
  getSettings: async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const headers = {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const response = await fetch(`${API_URL}/settings`, { headers });
        if (response.ok) {
            return await response.json();
        }
      }
      
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      return data ? JSON.parse(data) : null
    } catch (e) {
      console.error("Error reading settings", e)
      return null
    }
  },
  saveSettings: async (settings) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        await fetch(`${API_URL}/settings`, {
            method: 'POST',
            headers,
            body: JSON.stringify(settings)
        });
      }
      
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    } catch (e) {
      console.error("Error saving settings", e)
    }
  },

  // Invoices (Backend API)
  getInvoices: async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Accept': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/invoices`, { headers });
      if (!response.ok) throw new Error("Failed to fetch invoices");
      const data = await response.json();
      
      // Map Backend -> Frontend
      return data.map(inv => {
        const items = inv.items.map(i => ({
            ...i,
            taxPercent: i.tax_percent || 0
        }));
        const totals = calculateTotals({ items });
        
        return {
            ...inv,
            invoiceNumber: inv.number,
            dueDate: inv.due_date,
            seller: inv.seller_info,
            customer: inv.customer_info,
            items: items,
            totals: totals,
            details: {
                number: inv.number,
                date: inv.date,
                dueDate: inv.due_date,
            },
            // Default settings if missing, as backend doesn't store it yet
            settings: { currency: 'IDR', locale: 'id-ID' }, 
            historyId: inv.id,
            savedAt: inv.created_at,
            status: calculateStatus(inv) // Add derived status
        };
      });
    } catch (e) {
      console.error("Error fetching invoices", e);
      return [];
    }
  },

  saveInvoice: async (invoice) => {
    try {
      // Map Frontend -> Backend
      const payload = {
        number: invoice.invoiceNumber || invoice.details?.number, 
        date: invoice.date || invoice.details?.date || invoice.details?.invoiceDate,
        due_date: invoice.dueDate || invoice.details?.dueDate,
        seller_info: invoice.seller,
        customer_info: invoice.customer,
        items: (invoice.items || []).map(i => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            tax_percent: i.taxPercent || 0
        })),
        notes: invoice.notes,
        terms: invoice.terms,
        status: invoice.status || 'draft'
      };

      const token = localStorage.getItem("token");
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let url = `${API_URL}/invoices`;
      let method = 'POST';

      if (invoice.historyId) {
        url = `${API_URL}/invoices/${invoice.historyId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server Error Details:", errorData);
        
        let errorMessage = errorData.message || "Failed to save invoice";
        
        if (errorData.errors) {
            const firstError = Object.values(errorData.errors)[0];
            if (Array.isArray(firstError)) {
                errorMessage = firstError[0];
            } else if (typeof firstError === 'string') {
                errorMessage = firstError;
            }
        }
        
        throw new Error(errorMessage);
      }
      
      const saved = await response.json();
      return {
          ...saved,
          historyId: saved.id
      };
    } catch (e) {
      console.error("Error saving invoice", e);
      throw e;
    }
  },

  deleteInvoice: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE', headers });
    } catch (e) {
      console.error("Error deleting invoice", e);
    }
  },

  // Contacts (Backend API)
  getContacts: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];
      
      const headers = {
          'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/contacts`, { headers });
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return await response.json();
    } catch (e) {
      console.error("Error fetching contacts", e);
      return [];
    }
  },

  saveContact: async (contact) => {
    try {
      let url = `${API_URL}/contacts`;
      let method = 'POST';
      
      if (contact.id) {
          url = `${API_URL}/contacts/${contact.id}`;
          method = 'PUT';
      }

      const token = localStorage.getItem("token");
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(contact),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save contact");
      }
      return await response.json();
    } catch (e) {
      console.error("Error saving contact", e);
      throw e;
    }
  },

  deleteContact: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API_URL}/contacts/${id}`, { method: 'DELETE', headers });
    } catch (e) {
      console.error("Error deleting contact", e);
    }
  }
}
