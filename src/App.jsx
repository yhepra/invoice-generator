import React, { useState } from "react"
import Home from "./pages/Home.jsx"
import Settings from "./pages/Settings.jsx"
import Header from "./components/common/Header.jsx"
import useInvoice from "./hooks/useInvoice.js"

export default function App() {
  const [page, setPage] = useState("home")
  const invoiceApi = useInvoice()
  const { downloadPDF } = invoiceApi

  return (
    <div>
      <Header
        title="Invoice Generator"
        onDownload={downloadPDF}
        onGoHome={() => setPage("home")}
        onGoSettings={() => setPage("settings")}
      />
      {page === "home" ? (
        <Home {...invoiceApi} />
      ) : (
        <Settings settings={invoiceApi.invoice.settings} onChange={invoiceApi.updateSettings} />
      )}
    </div>
  )
}
