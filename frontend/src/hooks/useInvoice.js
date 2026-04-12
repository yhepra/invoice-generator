import { useCallback, useMemo, useRef, useState } from "react"
import defaultInvoice from "../data/defaultInvoice.js"
import calculateTotals from "../utils/calculateTotals.js"

export default function useInvoice(initialData = null) {
  const [invoice, setInvoice] = useState(initialData || defaultInvoice)
  const previewRef = useRef(null)

  const totals = useMemo(
    () => calculateTotals({ items: invoice.items }),
    [invoice.items],
  )

  const updateSeller = useCallback(
    (patch) =>
      setInvoice((prev) => ({ ...prev, seller: { ...prev.seller, ...patch } })),
    [],
  )

  const updateCustomer = useCallback(
    (patch) =>
      setInvoice((prev) => ({
        ...prev,
        customer: { ...prev.customer, ...patch },
      })),
    [],
  )

  const updateDetails = useCallback(
    (patch) =>
      setInvoice((prev) => ({ ...prev, details: { ...prev.details, ...patch } })),
    [],
  )

  const updateSettings = useCallback(
    (patch) =>
      setInvoice((prev) => {
        const next = { ...prev, settings: { ...prev.settings, ...patch } }
        if (patch.currency) {
          next.settings.locale = patch.currency === "USD" ? "en-US" : "id-ID"
        }
        if (patch.language) {
          next.settings.locale = patch.language === "en" ? "en-US" : "id-ID"
        }
        return next
      }),
    [],
  )

  const addItem = useCallback(
    () =>
      setInvoice((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            id: Date.now(),
            name: "",
            quantity: 1,
            price: 0,
            taxPercent: 0,
          },
        ],
      })),
    [],
  )

  const updateItem = useCallback(
    (id, patch) =>
      setInvoice((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      })),
    [],
  )

  const removeItem = useCallback(
    (id) =>
      setInvoice((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      })),
    [],
  )

  const clearItems = useCallback(
    () =>
      setInvoice((prev) => ({
        ...prev,
        items: [],
      })),
    [],
  )

  const moveItemUp = useCallback((id) => {
    setInvoice((prev) => {
      const idx = prev.items.findIndex((i) => i.id === id)
      if (idx <= 0) return prev
      const nextItems = [...prev.items]
      const tmp = nextItems[idx - 1]
      nextItems[idx - 1] = nextItems[idx]
      nextItems[idx] = tmp
      return { ...prev, items: nextItems }
    })
  }, [])

  const moveItemDown = useCallback((id) => {
    setInvoice((prev) => {
      const idx = prev.items.findIndex((i) => i.id === id)
      if (idx < 0 || idx >= prev.items.length - 1) return prev
      const nextItems = [...prev.items]
      const tmp = nextItems[idx + 1]
      nextItems[idx + 1] = nextItems[idx]
      nextItems[idx] = tmp
      return { ...prev, items: nextItems }
    })
  }, [])

  const getPdfFilename = () => {
    const headerTitleNormalized = String(invoice?.details?.headerTitle || "")
      .trim()
      .toLowerCase()
    const isReceipt =
      headerTitleNormalized.startsWith("receipt") ||
      headerTitleNormalized.startsWith("kwitansi")
    return isReceipt
      ? `Kwitansi-${invoice.details.number}.pdf`
      : `${invoice.details.number}.pdf`
  }

  const downloadPDF = async () => {
    const element = previewRef.current
    if (!element) return
    const { default: html2pdf } = await import("html2pdf.js")
    const filename = getPdfFilename()
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

  const generatePDFForEmail = async () => {
    const element = previewRef.current
    if (!element) return null

    const { default: html2pdf } = await import("html2pdf.js")
    const filename = getPdfFilename()
    const opt = {
      margin: 10,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }
    }

    const dataUri = await html2pdf()
      .set(opt)
      .from(element)
      .toPdf()
      .outputPdf("datauristring")

    const base64 = String(dataUri || "").split(",")[1] || null
    if (!base64) return null

    return { pdfBase64: base64, filename }
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
    generatePDFForEmail,
    setInvoice
  }
}
