export default function formatCurrency(
  value,
  { locale = "id-ID", currency = "IDR" } = {}
) {
  const n = Number(value) || 0
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency
  }).format(n)
}
