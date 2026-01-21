export default function calculateTotals(invoice) {
  const items = invoice.items || []
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0
    const price = Number(item.price) || 0
    return sum + qty * price
  }, 0)
  const taxPercent = Number(invoice.details?.taxPercent) || 0
  const taxAmount = subtotal * (taxPercent / 100)
  const total = subtotal + taxAmount
  return { subtotal, taxPercent, taxAmount, total }
}
