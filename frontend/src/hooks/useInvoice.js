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

  const prepareElementForPdf = async (sourceEl) => {
    if (!sourceEl) return null

    const cloned = sourceEl.cloneNode(true)
    const container = document.createElement("div")
    container.style.position = "fixed"
    container.style.left = "-10000px"
    container.style.top = "0"
    container.style.zIndex = "-1"
    container.style.background = "white"
    container.style.width = `${sourceEl.offsetWidth || 800}px`

    container.appendChild(cloned)
    document.body.appendChild(container)

    await new Promise((r) => requestAnimationFrame(() => r()))
    await new Promise((r) => requestAnimationFrame(() => r()))

    const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api"
    const apiOrigin = (() => {
      try {
        return new URL(apiUrl, window.location.href).origin
      } catch {
        return window.location.origin
      }
    })()

    const toDataUrl = async (url, timeoutMs = 6000) => {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), timeoutMs)
      try {
        let credentials = "omit"
        try {
          const origin = new URL(url, window.location.href).origin
          if (origin === window.location.origin) credentials = "include"
        } catch {
          void 0
        }
        const bypassUrl = new URL(url, window.location.href)
        bypassUrl.searchParams.set("_nocache", Date.now().toString())
        const res = await fetch(bypassUrl.href, {
          mode: "cors",
          cache: "no-store",
          credentials,
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
        const blob = await res.blob()
        return await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result || ""))
          reader.onerror = () => reject(new Error("Failed to read image blob"))
          reader.readAsDataURL(blob)
        })
      } finally {
        clearTimeout(t)
      }
    }

    const getUrlCandidates = (rawUrl) => {
      let resolved
      try {
        resolved = new URL(rawUrl, window.location.href)
      } catch {
        resolved = null
      }

      const href = resolved?.href || rawUrl
      const pathname = resolved?.pathname || rawUrl
      const idx = pathname.indexOf("/storage/")
      const storageFallbackUrl =
        idx >= 0
          ? `${apiOrigin}/api/public-files/${pathname.slice(idx + "/storage/".length)}`
          : null

      return storageFallbackUrl ? [href, storageFallbackUrl] : [href]
    }

    const imgs = Array.from(cloned.querySelectorAll("img"))
    const waitImg = async (img) => {
      if (!img) return
      const hasSize = () =>
        Number(img.naturalWidth || 0) > 0 && Number(img.naturalHeight || 0) > 0

      const start = Date.now()
      let triedDecode = false

      while (!hasSize() && Date.now() - start < 2000) {
        if (!triedDecode && typeof img.decode === "function") {
          triedDecode = true
          try {
            await img.decode()
          } catch {
            void 0
          }
          if (hasSize()) return
        }

        if (!img.complete) {
          await new Promise((resolve) => {
            const done = () => resolve()
            img.addEventListener("load", done, { once: true })
            img.addEventListener("error", done, { once: true })
          })
        } else {
          await new Promise((r) => setTimeout(r, 50))
        }
      }
    }

    const rasterizeToPngDataUrl = async (img) => {
      if (!img) return null
      await waitImg(img)

      const rect = img.getBoundingClientRect?.()
      const w =
        img.naturalWidth ||
        Math.round(rect?.width || 0) ||
        Number(img.getAttribute("width") || 0) ||
        0
      const h =
        img.naturalHeight ||
        Math.round(rect?.height || 0) ||
        Number(img.getAttribute("height") || 0) ||
        0

      const width = w > 0 ? w : 300
      const height = h > 0 ? h : 150

      const maxDim = 1200
      const scale = Math.min(1, maxDim / Math.max(width, height))
      const outW = Math.max(1, Math.round(width * scale))
      const outH = Math.max(1, Math.round(height * scale))

      const canvas = document.createElement("canvas")
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext("2d")
      if (!ctx) return null
      ctx.drawImage(img, 0, 0, outW, outH)
      return canvas.toDataURL("image/png")
    }

    const tasks = imgs
      .map((img) => {
        const src = img.getAttribute("src") || ""
        if (!src) return null
        if (src.startsWith("data:")) {
          return async () => {
            await waitImg(img)
          }
        }

        const candidates = getUrlCandidates(src)

        return async () => {
          for (const candidate of candidates) {
            try {
              const dataUrl = await toDataUrl(candidate)
              if (dataUrl) {
                img.setAttribute("src", dataUrl)
                await waitImg(img)
                return
              }
            } catch {
              // Ignore and try the next candidate
            }
          }

          try {
            const origin = new URL(src, window.location.href).origin
            if (origin !== window.location.origin) {
              img.setAttribute("src", "")
            }
          } catch {
            img.setAttribute("src", "")
          }
        }
      })
      .filter(Boolean)

    for (let i = 0; i < tasks.length; i += 4) {
      const batch = tasks.slice(i, i + 4)
      await Promise.all(batch.map((fn) => fn()))
    }

    await Promise.all(imgs.map((img) => waitImg(img)))

    const rasterTasks = imgs
      .map((img) => {
        const src = img.getAttribute("src") || ""
        if (!src || !src.startsWith("data:")) return null
        return async () => {
          try {
            const png = await rasterizeToPngDataUrl(img)
            if (png) {
              img.setAttribute("src", png)
              await waitImg(img)
            }
          } catch {
            void 0
          }
        }
      })
      .filter(Boolean)

    for (let i = 0; i < rasterTasks.length; i += 2) {
      const batch = rasterTasks.slice(i, i + 2)
      await Promise.all(batch.map((fn) => fn()))
    }

    const styleNodes = Array.from(cloned.querySelectorAll("[style]")).filter((n) =>
      String(n.getAttribute("style") || "").includes("url("),
    )

    const cssUrlRegex = /url\(\s*(['"]?)(.*?)\1\s*\)/gi
    const styleTasks = styleNodes
      .map((node) => {
        const styleAttr = String(node.getAttribute("style") || "")
        if (!styleAttr) return null

        const matches = Array.from(styleAttr.matchAll(cssUrlRegex))
        if (matches.length === 0) return null

        return async () => {
          let nextStyle = styleAttr
          for (const match of matches) {
            const rawUrl = match?.[2] || ""
            if (!rawUrl || rawUrl.startsWith("data:")) continue

            const candidates = getUrlCandidates(rawUrl)
            let dataUrl = null
            for (const candidate of candidates) {
              try {
                dataUrl = await toDataUrl(candidate)
                if (dataUrl) break
              } catch {
                void 0
              }
            }
            if (!dataUrl) continue

            const quoted = rawUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            const perUrlRegex = new RegExp(
              `url\\(\\s*(['"]?)${quoted}\\1\\s*\\)`,
              "g",
            )
            nextStyle = nextStyle.replace(perUrlRegex, `url("${dataUrl}")`)
          }

          if (nextStyle !== styleAttr) {
            try {
              node.setAttribute("style", nextStyle)
            } catch {
              void 0
            }
          }
        }
      })
      .filter(Boolean)

    for (let i = 0; i < styleTasks.length; i += 2) {
      const batch = styleTasks.slice(i, i + 2)
      await Promise.all(batch.map((fn) => fn()))
    }

    const cleanup = () => {
      try {
        document.body.removeChild(container)
      } catch {
        void 0
      }
    }
    return { el: cloned, cleanup }
  }

  const drawDataImgOnPdfCanvas = async (worker, selector) => {
    const [canvas, container] = await Promise.all([
      worker.get("canvas"),
      worker.get("container"),
    ])
    if (!canvas || !container) return

    const targetImg =
      container.querySelector(selector) || container.querySelector("img")
    if (!targetImg) return

    const src = targetImg.getAttribute("src") || ""
    if (!src.startsWith("data:")) return

    const containerRect = container.getBoundingClientRect()
    const imgRect = targetImg.getBoundingClientRect()
    const relX = imgRect.left - containerRect.left
    const relY = imgRect.top - containerRect.top
    const relW = imgRect.width
    const relH = imgRect.height

    const scaleX = canvas.width / Math.max(1, containerRect.width)
    const scaleY = canvas.height / Math.max(1, containerRect.height)

    const img = new Image()
    img.decoding = "sync"
    img.src = src
    await new Promise((resolve) => {
      const done = () => resolve()
      img.onload = done
      img.onerror = done
    })

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    try {
      ctx.drawImage(
        img,
        Math.round(relX * scaleX),
        Math.round(relY * scaleY),
        Math.round(relW * scaleX),
        Math.round(relH * scaleY),
      )
    } catch {
      void 0
    }
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
      html2canvas: { scale: 2, useCORS: true, allowTaint: false, backgroundColor: "#ffffff", imageTimeout: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }
    }
    const prepared = await prepareElementForPdf(element)
    try {
      const target = prepared?.el || element
      const worker = html2pdf().set(opt).from(target)
      await worker.toCanvas()
      await drawDataImgOnPdfCanvas(worker, 'img[alt="Logo"]')
      await drawDataImgOnPdfCanvas(worker, 'img[alt="Signature"]')

      await worker.toPdf().save()
    } finally {
      if (typeof prepared?.cleanup === "function") prepared.cleanup()
    }
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
      html2canvas: { scale: 2, useCORS: true, allowTaint: false, backgroundColor: "#ffffff", imageTimeout: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }
    }

    const prepared = await prepareElementForPdf(element)
    try {
      const target = prepared?.el || element
      const worker = html2pdf().set(opt).from(target)
      await worker.toCanvas()
      await drawDataImgOnPdfCanvas(worker, 'img[alt="Logo"]')
      await drawDataImgOnPdfCanvas(worker, 'img[alt="Signature"]')

      const dataUri = await worker.toPdf().outputPdf("datauristring")

      const base64 = String(dataUri || "").split(",")[1] || null
      if (!base64) return null

      return { pdfBase64: base64, filename }
    } finally {
      if (typeof prepared?.cleanup === "function") prepared.cleanup()
    }
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
