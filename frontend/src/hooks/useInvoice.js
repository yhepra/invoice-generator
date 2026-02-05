import { useMemo, useRef, useState } from "react"
import html2pdf from "html2pdf.js"
import defaultInvoice from "../data/defaultInvoice.js"
import calculateTotals from "../utils/calculateTotals.js"

export default function useInvoice(initialData = null) {
  const [invoice, setInvoice] = useState(initialData || defaultInvoice)
  const previewRef = useRef(null)

  const totals = useMemo(() => calculateTotals(invoice), [invoice])

  const updateSeller = (patch) =>
    setInvoice((prev) => ({ ...prev, seller: { ...prev.seller, ...patch } }))

  const updateCustomer = (patch) =>
    setInvoice((prev) => ({ ...prev, customer: { ...prev.customer, ...patch } }))

  const updateDetails = (patch) =>
    setInvoice((prev) => ({ ...prev, details: { ...prev.details, ...patch } }))

  const updateSettings = (patch) =>
    setInvoice((prev) => {
      const next = { ...prev, settings: { ...prev.settings, ...patch } }
      if (patch.currency) {
        next.settings.locale =
          patch.currency === "USD"
            ? "en-US"
            : "id-ID"
      }
      if (patch.language) {
        next.settings.locale =
          patch.language === "en"
            ? "en-US"
            : "id-ID"
      }
      return next
    })

  const addItem = () =>
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          name: "",
          quantity: 1,
          price: 0,
          taxPercent: 0
        }
      ]
    }))

  const updateItem = (id, patch) =>
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      )
    }))

  const removeItem = (id) =>
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id)
    }))

  const clearItems = () =>
    setInvoice((prev) => ({
      ...prev,
      items: []
    }))

  const moveItemUp = (id) =>
    setInvoice((prev) => {
      const idx = prev.items.findIndex((i) => i.id === id)
      if (idx <= 0) return prev
      const nextItems = [...prev.items]
      const tmp = nextItems[idx - 1]
      nextItems[idx - 1] = nextItems[idx]
      nextItems[idx] = tmp
      return { ...prev, items: nextItems }
    })

  const moveItemDown = (id) =>
    setInvoice((prev) => {
      const idx = prev.items.findIndex((i) => i.id === id)
      if (idx < 0 || idx >= prev.items.length - 1) return prev
      const nextItems = [...prev.items]
      const tmp = nextItems[idx + 1]
      nextItems[idx + 1] = nextItems[idx]
      nextItems[idx] = tmp
      return { ...prev, items: nextItems }
    })

  const downloadPDF = async () => {
    const element = previewRef.current
    if (!element) return
    const filename = `${invoice.details.number}.pdf`
    const opt = {
      margin: 10,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }
    }
    await html2pdf().set(opt).from(element).save()
  }

  return {
    invoice,
    totals,
    previewRef,
    updateSeller,
    updateCustomer,
    updateDetails,
    updateSettings,
    addItem,
    updateItem,
    removeItem,
    clearItems,
    moveItemUp,
    moveItemDown,
    downloadPDF,
    setInvoice
  }
}
