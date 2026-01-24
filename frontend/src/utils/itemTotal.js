export default function itemTotal(quantity, price) {
  const q = Number(quantity) || 0
  const p = Number(price) || 0
  return q * p
}
