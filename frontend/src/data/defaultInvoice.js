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
    email: "",
    phone: "",
    logo: null,
    signature: null
  },
  customer: {
    name: "",
    address: "",
    email: "",
    phone: ""
  },
  details: {
    headerTitle: "",
    number: generateInvoiceNumber(),
    invoiceDate: today,
    dueDate: today,
    notes: "",
    terms: ""
  },
  items: [
    { id: 1, name: "", quantity: 1, price: 0, taxPercent: 0 }
  ]
}

export default defaultInvoice
