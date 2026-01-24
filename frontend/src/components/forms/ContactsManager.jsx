import React, { useState, useEffect } from "react"
import { storage } from "../../services/storage"
import Button from "../common/Button"

export default function ContactsManager() {
  const [activeTab, setActiveTab] = useState("customer")
  const [contacts, setContacts] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: ""
  })

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    setContacts(await storage.getContacts())
  }

  const filteredContacts = contacts.filter((c) => c.type === activeTab)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await storage.saveContact({ ...formData, type: activeTab })
      setFormData({ name: "", address: "", phone: "", email: "" })
      setIsEditing(false)
      loadContacts()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleDelete = async (id) => {
    if (confirm("Delete this contact?")) {
      await storage.deleteContact(id)
      loadContacts()
    }
  }

  const handleEdit = (contact) => {
    setFormData(contact)
    setIsEditing(true)
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => { setActiveTab("customer"); setIsEditing(false); setFormData({ name: "", address: "", phone: "", email: "" }); }}
            className={`whitespace-nowrap border-b-2 pb-4 px-1 text-sm font-medium ${
              activeTab === "customer"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => { setActiveTab("seller"); setIsEditing(false); setFormData({ name: "", address: "", phone: "", email: "" }); }}
            className={`whitespace-nowrap border-b-2 pb-4 px-1 text-sm font-medium ${
              activeTab === "seller"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Sellers
          </button>
        </nav>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* List */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Saved Contacts</h3>
          {filteredContacts.length === 0 ? (
            <p className="text-sm text-gray-500">No contacts saved.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-start justify-between rounded-md border p-3 text-sm hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-gray-600">{contact.address}</p>
                    <p className="text-xs text-gray-500">{contact.phone} • {contact.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="text-brand-600 hover:text-brand-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        <div className="rounded-lg border bg-gray-50 p-4">
          <h3 className="mb-4 font-medium text-gray-900">
            {isEditing ? "Edit Contact" : "Add New Contact"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setIsEditing(false); setFormData({ name: "", address: "", phone: "", email: "" }); }}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
              >
                Save Contact
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
