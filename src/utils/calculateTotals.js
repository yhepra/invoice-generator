export default function calculateTotals(invoice) {
  const items = invoice.items || []
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0
    const price = Number(item.price) || 0
    return sum + qty * price
  }, 0)
  const fallbackTax = Number(invoice.details?.taxPercent) || 0
  const taxAmount = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0
    const price = Number(item.price) || 0
    const line = qty * price
    const lineTaxPct =
      item.taxPercent !== undefined && item.taxPercent !== null
        ? Number(item.taxPercent) || 0
        : fallbackTax
    return sum + line * (lineTaxPct / 100)
  }, 0)
  const taxPercent = subtotal > 0 ? (taxAmount / subtotal) * 100 : 0
  const total = subtotal + taxAmount
  return { subtotal, taxPercent, taxAmount, total }
}
