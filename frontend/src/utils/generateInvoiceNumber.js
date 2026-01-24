export default function generateInvoiceNumber(prefix = "INV") {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
  return `${prefix}-${y}${m}${day}-${rand}`
}
