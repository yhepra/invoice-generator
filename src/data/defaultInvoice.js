import generateInvoiceNumber from "../utils/generateInvoiceNumber.js"

const today = new Date().toISOString().slice(0, 10)

const defaultInvoice = {
  settings: {
    currency: "IDR",
    locale: "id-ID",
    language: "id",
    footerText: "Terima kasih atas kerjasama Anda."
  },
  seller: {
    name: "",
    address: "",
    email: ""
  },
  customer: {
    name: "",
    address: "",
    email: ""
  },
  details: {
    number: generateInvoiceNumber(),
    invoiceDate: today,
    dueDate: today,
    notes: "",
    taxPercent: 0
  },
  items: [
    { id: 1, name: "", quantity: 1, price: 0, taxPercent: 0 }
  ]
}

export default defaultInvoice
