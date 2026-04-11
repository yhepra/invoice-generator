import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { storage } from "../services/storage";
import Button from "../components/common/Button";
import InvoicePreview from "../components/preview/InvoicePreview";
import useInvoice from "../hooks/useInvoice";
import defaultInvoice from "../data/defaultInvoice";
import formatCurrency from "../utils/formatCurrency";
import { getTranslation } from "../data/translations.js";

export default function Receipts({ settings, user }) {
  const navigate = useNavigate();
  const t = (key) => getTranslation(settings?.language, key);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const receiptApi = useInvoice(defaultInvoice);

  useEffect(() => {
    receiptApi.updateSettings(settings || {});
  }, [settings]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await storage.getInvoices();
        const sorted = data.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        setInvoices(sorted);
      } catch (e) {
        setError(e?.message || "Failed to load invoices.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) => {
      const number = String(inv.details?.number || "").toLowerCase();
      const customer = String(inv.customer?.name || "").toLowerCase();
      return number.includes(q) || customer.includes(q);
    });
  }, [invoices, searchQuery]);

  const buildReceiptInvoice = (source) => {
    const today = new Date().toISOString().slice(0, 10);
    const baseNumber = String(source.details?.number || source.number || "").trim();
    const prefix = settings?.language === "en" ? "RCT" : "KWT";
    const receiptNumber = /^(KWT-|RCT-)/i.test(baseNumber)
      ? baseNumber
      : `${prefix}-${baseNumber || Date.now()}`;

    const autoNotes =
      settings?.language === "en"
        ? `Payment for invoice ${baseNumber}`.trim()
        : `Pembayaran faktur ${baseNumber}`.trim();

    const notes =
      String(source.details?.notes || "").trim() ? source.details.notes : autoNotes;

    return {
      ...defaultInvoice,
      settings: { ...defaultInvoice.settings, ...settings },
      seller: { ...defaultInvoice.seller, ...source.seller },
      customer: { ...defaultInvoice.customer, ...source.customer },
      items: Array.isArray(source.items) ? source.items : [],
      details: {
        ...defaultInvoice.details,
        headerTitle: "receipt",
        number: receiptNumber,
        invoiceDate: today,
        dueDate: today,
        notes,
        terms: source.details?.terms || ""
      }
    };
  };

  const handleSelect = (inv) => {
    setSelectedInvoice(inv);
    receiptApi.setInvoice(buildReceiptInvoice(inv));
  };

  const handleGenerate = async (inv) => {
    setIsGenerating(true);
    try {
      handleSelect(inv);
      await new Promise((r) => requestAnimationFrame(() => r()));
      await new Promise((r) => requestAnimationFrame(() => r()));
      await receiptApi.downloadPDF();
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <h1 className="text-2xl font-bold">{t("receiptsTitle")}</h1>
        <p className="mt-2 text-sm text-gray-600">{t("pleaseLoginReceipts")}</p>
        <div className="mt-4">
          <Button onClick={() => navigate("/login")}>{t("loginRegister")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">{t("receiptsTitle")}</h1>
            <Button variant="secondary" onClick={() => navigate("/history")}>
              {t("history")}
            </Button>
          </div>

          <div className="mt-4">
            <input
              type="text"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="text-sm text-gray-600">{t("loading")}</div>
            ) : error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-sm text-gray-600">{t("noInvoicesFound")}</div>
            ) : (
              filteredInvoices.map((inv) => {
                const isSelected = selectedInvoice?.historyId === inv.historyId;
                const total = inv.totals?.total || 0;
                return (
                  <div
                    key={inv.historyId || inv.id}
                    className={`rounded-lg border bg-white p-4 shadow-sm ${
                      isSelected ? "border-brand-300 ring-2 ring-brand-100" : "border-gray-200"
                    }`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <div className="font-semibold text-gray-900">
                            {inv.details?.number}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {inv.customer?.name || "-"}
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          {formatCurrency(total, settings)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleSelect(inv)}
                        >
                          {t("selectFromHistory")}
                        </Button>
                        <Button
                          onClick={() => handleGenerate(inv)}
                          disabled={isGenerating}
                        >
                          {t("generateReceipt")}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="w-full md:w-[420px] md:sticky md:top-24">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-700">{t("receipt")}</div>
            {selectedInvoice ? (
              <Button
                onClick={() => handleGenerate(selectedInvoice)}
                disabled={isGenerating}
              >
                {t("download")}
              </Button>
            ) : null}
          </div>
          {selectedInvoice ? (
            <InvoicePreview
              invoice={receiptApi.invoice}
              totals={receiptApi.totals}
              previewRef={receiptApi.previewRef}
              user={user}
            />
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
              {t("selectInvoiceToPreviewReceipt")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Receipts.propTypes = {
  settings: PropTypes.object,
  user: PropTypes.object
};
