import React from "react";
import PropTypes from "prop-types";
import formatCurrency from "../utils/formatCurrency.js";
import itemTotal from "../utils/itemTotal.js";
import { getTranslation } from "../data/translations.js";
import { sanitizeRichText } from "../utils/sanitizeRichText.js";

export default function SimpleInvoice({ invoice, user }) {
  const { seller, customer, details, items, totals, settings } = invoice;
  const isFree = !user || user.plan === "free";
  const t = (key) => getTranslation(settings.language, key);
  const headerTitleNormalized = String(details.headerTitle || "").trim().toLowerCase();
  const isQuotation =
    headerTitleNormalized.startsWith("quotation") ||
    headerTitleNormalized.startsWith("penawaran") ||
    headerTitleNormalized === String(t("quotation")).trim().toLowerCase();
  const isReceipt =
    headerTitleNormalized.startsWith("receipt") ||
    headerTitleNormalized.startsWith("kwitansi") ||
    headerTitleNormalized === String(t("receipt")).trim().toLowerCase();
  const numberLabel = isQuotation ? t("quotationNumber") : t("number");
  const dateLabel = isQuotation ? t("quotationDate") : t("date");
  const dueDateLabel = isQuotation ? t("validUntil") : t("dueDate");

  const formatDate = (dateValue) => {
    // If empty, use current date as requested
    const date = dateValue ? new Date(dateValue) : new Date();

    // Check if valid date
    if (isNaN(date.getTime())) {
      return dateValue || "";
    }

    // Format using locale settings
    return date.toLocaleDateString(settings.locale || "id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const toWordsEn = (n) => {
    const num = Math.floor(Number(n) || 0);
    if (num === 0) return "zero";
    const a = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    const chunk = (x) => {
      let s = "";
      if (x >= 100) {
        s += `${a[Math.floor(x / 100)]} hundred`;
        x %= 100;
        if (x) s += " ";
      }
      if (x >= 20) {
        s += b[Math.floor(x / 10)];
        x %= 10;
        if (x) s += `-${a[x]}`;
      } else if (x > 0) {
        s += a[x];
      }
      return s;
    };
    const units = [
      { value: 1_000_000_000_000, label: "trillion" },
      { value: 1_000_000_000, label: "billion" },
      { value: 1_000_000, label: "million" },
      { value: 1_000, label: "thousand" },
    ];
    let x = num;
    let out = "";
    for (const u of units) {
      if (x >= u.value) {
        const q = Math.floor(x / u.value);
        x %= u.value;
        out += `${chunk(q)} ${u.label}`;
        if (x) out += " ";
      }
    }
    if (x) out += chunk(x);
    return out.trim();
  };

  const toWordsId = (n) => {
    const num = Math.floor(Number(n) || 0);
    if (num === 0) return "nol";
    const s = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
    const f = (x) => {
      const v = Math.floor(x);
      if (v < 12) return s[v];
      if (v < 20) return `${s[v - 10]} belas`;
      if (v < 100) {
        const tens = Math.floor(v / 10);
        const rest = v % 10;
        return `${s[tens]} puluh${rest ? ` ${f(rest)}` : ""}`;
      }
      if (v < 200) return `seratus${v % 100 ? ` ${f(v - 100)}` : ""}`;
      if (v < 1000) {
        const hundreds = Math.floor(v / 100);
        const rest = v % 100;
        return `${s[hundreds]} ratus${rest ? ` ${f(rest)}` : ""}`;
      }
      if (v < 2000) return `seribu${v % 1000 ? ` ${f(v - 1000)}` : ""}`;
      if (v < 1_000_000) {
        const thousands = Math.floor(v / 1000);
        const rest = v % 1000;
        return `${f(thousands)} ribu${rest ? ` ${f(rest)}` : ""}`;
      }
      if (v < 1_000_000_000) {
        const millions = Math.floor(v / 1_000_000);
        const rest = v % 1_000_000;
        return `${f(millions)} juta${rest ? ` ${f(rest)}` : ""}`;
      }
      if (v < 1_000_000_000_000) {
        const billions = Math.floor(v / 1_000_000_000);
        const rest = v % 1_000_000_000;
        return `${f(billions)} miliar${rest ? ` ${f(rest)}` : ""}`;
      }
      const trillions = Math.floor(v / 1_000_000_000_000);
      const rest = v % 1_000_000_000_000;
      return `${f(trillions)} triliun${rest ? ` ${f(rest)}` : ""}`;
    };
    return f(num).trim();
  };

  if (isReceipt) {
    const amount = Number(totals?.total || 0);
    const whole = Math.floor(amount);
    const words =
      settings.language === "en"
        ? `${toWordsEn(whole)} ${settings.currency === "USD" ? "dollars" : "rupiah"}`
        : `${toWordsId(whole)} rupiah`;

    return (
      <div className="invoice-content flex w-full flex-col bg-white text-sm text-gray-900 relative">
        <header className="flex items-start justify-between border-b border-gray-200 pb-6 relative z-10">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("receipt")}
            </h1>
            {!seller.logo && isFree && (
              <a
                href="https://generateinvoice.id"
                target="_blank"
                rel="noreferrer"
                className="mt-2 block text-xs text-gray-500 hover:text-gray-700 hover:underline"
                style={{ textDecoration: "none" }}
              >
                {t("generatedWith")}
              </a>
            )}
          </div>
          <div className="text-right text-xs">
            {seller.logo ? (
              <>
                <img
                  src={seller.logo}
                  alt="Logo"
                  className="h-24 w-auto max-w-[150px] object-contain ml-auto"
                />
                {isFree && (
                  <a
                    href="https://generateinvoice.id"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-xs text-gray-500 hover:text-gray-700 hover:underline"
                    style={{ textDecoration: "none" }}
                  >
                    {t("generatedWith")}
                  </a>
                )}
              </>
            ) : null}
            <p className="mt-2 font-semibold">{t("receiptNumber")}</p>
            <p className="text-gray-700">{details.number}</p>
            <p className="mt-2 font-semibold">{t("receiptDate")}</p>
            <p className="text-gray-700">{formatDate(details.invoiceDate)}</p>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-2 gap-8 text-xs">
          <div>
            <p className="font-semibold uppercase tracking-wide text-gray-600">
              {t("receivedBy")}
            </p>
            <p className="mt-2 font-semibold text-gray-900">
              {seller.name || t("placeholderName")}
            </p>
            <p className="whitespace-pre-line text-gray-700">
              {seller.address || ""}
            </p>
            <p className="mt-1 text-gray-700">{seller.phone}</p>
            <p className="mt-1 text-gray-700">{seller.email}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-gray-600">
              {t("receivedFrom")}
            </p>
            <p className="mt-2 font-semibold text-gray-900">
              {customer.name || t("placeholderName")}
            </p>
            <p className="whitespace-pre-line text-gray-700">
              {customer.address || ""}
            </p>
            <p className="mt-1 text-gray-700">{customer.phone}</p>
            <p className="mt-1 text-gray-700">{customer.email}</p>
          </div>
        </section>

        {Array.isArray(items) && items.length > 0 ? (
          <section className="mt-8">
            <table className="min-w-full table-fixed border-collapse text-xs">
              <thead>
                <tr className="border-b border-t border-gray-200 bg-gray-50">
                  <th className="py-2 text-left font-semibold text-gray-700">
                    {t("item")}
                  </th>
                  <th className="w-24 py-2 text-right font-semibold text-gray-700">
                    {t("quantity")}
                  </th>
                  <th className="w-32 py-2 text-right font-semibold text-gray-700">
                    {t("price")}
                  </th>
                  <th className="w-24 py-2 text-right font-semibold text-gray-700">
                    {t("tax")} (%)
                  </th>
                  <th className="w-32 py-2 text-right font-semibold text-gray-700">
                    {t("total")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2 pr-2 text-left text-gray-800">
                      <div
                        className="wysiwyg-content"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeRichText(item.name || t("placeholderItemName")),
                        }}
                      />
                    </td>
                    <td className="py-2 text-right text-gray-800">
                      {item.quantity || 0}
                    </td>
                    <td className="py-2 text-right text-gray-800">
                      {formatCurrency(item.price, settings)}
                    </td>
                    <td className="py-2 text-right text-gray-800">
                      {Number(item.taxPercent || 0)}%
                    </td>
                    <td className="py-2 text-right text-gray-800">
                      {formatCurrency(itemTotal(item.quantity, item.price), settings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        <section className="mt-8 space-y-4 text-sm">
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-gray-700">{t("amountReceived")}</span>
              <span className="text-lg font-semibold text-gray-900 tabular-nums">
                {formatCurrency(amount, settings)}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-semibold text-gray-700">{t("inWords")}</div>
              <div className="mt-1 text-sm text-gray-800">
                {words}
              </div>
            </div>
            <div className="mt-4 space-y-1 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-600">{t("subtotal")}</span>
                <span className="font-medium text-gray-900 tabular-nums">
                  {formatCurrency(totals?.subtotal || 0, settings)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-600">{t("tax")}</span>
                <span className="font-medium text-gray-900 tabular-nums">
                  {formatCurrency(totals?.taxAmount || 0, settings)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2">
                <span className="font-semibold text-gray-900">{t("total")}</span>
                <span className="font-semibold text-gray-900 tabular-nums">
                  {formatCurrency(totals?.total || 0, settings)}
                </span>
              </div>
            </div>
          </div>

          {details.notes ? (
            <div className="text-xs">
              <div className="font-semibold text-gray-700">{t("forPaymentOf")}</div>
              <div
                className="wysiwyg-content mt-1 text-gray-700"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(details.notes) }}
              />
            </div>
          ) : null}

          {details.terms ? (
            <div className="text-xs">
              <div className="font-semibold text-gray-700">{t("terms")}</div>
              <div
                className="wysiwyg-content mt-1 text-gray-700"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(details.terms) }}
              />
            </div>
          ) : null}
        </section>

        {seller.signature && (
          <div className="mt-10 ml-auto w-48 text-center break-inside-avoid">
            <div className="relative h-24 mb-2 flex items-end justify-center">
              <img
                src={seller.signature}
                alt="Signature"
                className="absolute bottom-0 max-h-24 max-w-full object-contain"
              />
            </div>
            <div className="border-t border-gray-400 pt-1">
              <p className="text-xs text-gray-700 font-medium">
                {seller.signatoryName || seller.name}
              </p>
              {seller.signatoryJobTitle && (
                <p className="text-[10px] text-gray-500">
                  {seller.signatoryJobTitle}
                </p>
              )}
            </div>
          </div>
        )}

        <section className="invoice-footer text-xs mt-6">
          <div className="text-[10px] text-gray-600 self-start">
            {settings.footerText || "Thank you for your business."}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="invoice-content flex w-full flex-col bg-white text-sm text-gray-900 relative">
      <header className="flex items-start justify-between border-b border-gray-200 pb-6 relative z-10">
        {/* Left column: Title always, details when logo exists */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {details.headerTitle || t("invoice")}
          </h1>
          {seller.logo ? (
            <div className="mt-2 text-xs">
              <p className="font-semibold">{numberLabel}</p>
              <p className="text-gray-700">{details.number}</p>
              <p className="mt-2 font-semibold">{dateLabel}</p>
              <p className="text-gray-700">{formatDate(details.invoiceDate)}</p>
              <p className="mt-2 font-semibold">{dueDateLabel}</p>
              <p className="text-gray-700">{formatDate(details.dueDate)}</p>
            </div>
          ) : null}
          {!seller.logo && isFree && (
            <a
              href="https://generateinvoice.id"
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-xs text-gray-500 hover:text-gray-700 hover:underline"
              style={{ textDecoration: "none" }}
            >
              {t("generatedWith")}
            </a>
          )}
        </div>
        {/* Right column: Logo when exists, details when no logo */}
        <div className="text-right text-xs">
          {seller.logo ? (
            <>
              <img
                src={seller.logo}
                alt="Logo"
                className="h-24 w-auto max-w-[150px] object-contain ml-auto"
              />
              {isFree && (
                <a
                  href="https://generateinvoice.id"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block text-xs text-gray-500 hover:text-gray-700 hover:underline"
                  style={{ textDecoration: "none" }}
                >
                  {t("generatedWith")}
                </a>
              )}
            </>
          ) : (
            <>
              <p className="font-semibold">{numberLabel}</p>
              <p className="text-gray-700">{details.number}</p>
              <p className="mt-2 font-semibold">{dateLabel}</p>
              <p className="text-gray-700">{formatDate(details.invoiceDate)}</p>
              <p className="mt-2 font-semibold">{dueDateLabel}</p>
              <p className="text-gray-700">{formatDate(details.dueDate)}</p>
            </>
          )}
        </div>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-8 text-xs">
        <div>
          <p className="font-semibold uppercase tracking-wide text-gray-600">
            {t("from")}
          </p>
          <p className="mt-2 font-semibold text-gray-900">
            {seller.name || t("placeholderName")}
          </p>
          <p className="whitespace-pre-line text-gray-700">
            {seller.address || ""}
          </p>
          <p className="mt-1 text-gray-700">{seller.phone}</p>
          <p className="mt-1 text-gray-700">{seller.email}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wide text-gray-600">
            {t("billTo")}
          </p>
          <p className="mt-2 font-semibold text-gray-900">
            {customer.name || t("placeholderName")}
          </p>
          <p className="whitespace-pre-line text-gray-700">
            {customer.address || ""}
          </p>
          <p className="mt-1 text-gray-700">{customer.phone}</p>
          <p className="mt-1 text-gray-700">{customer.email}</p>
        </div>
      </section>

      <section className="mt-8">
        <table className="min-w-full table-fixed border-collapse text-xs">
          <thead>
            <tr className="border-b border-t border-gray-200 bg-gray-50">
              <th className="py-2 text-left font-semibold text-gray-700">
                {t("item")}
              </th>
              <th className="w-24 py-2 text-right font-semibold text-gray-700">
                {t("quantity")}
              </th>
              <th className="w-32 py-2 text-right font-semibold text-gray-700">
                {t("price")}
              </th>
              <th className="w-24 py-2 text-right font-semibold text-gray-700">
                {t("tax")} (%)
              </th>
              <th className="w-32 py-2 text-right font-semibold text-gray-700">
                {t("total")}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-2 pr-2 text-left text-gray-800">
                  <div
                    className="wysiwyg-content"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeRichText(item.name || t("placeholderItemName")),
                    }}
                  />
                </td>
                <td className="py-2 text-right text-gray-800">
                  {item.quantity || 0}
                </td>
                <td className="py-2 text-right text-gray-800">
                  {formatCurrency(item.price, settings)}
                </td>
                <td className="py-2 text-right text-gray-800">
                  {Number(item.taxPercent || 0)}%
                </td>
                <td className="py-2 text-right text-gray-800">
                  {formatCurrency(
                    itemTotal(item.quantity, item.price),
                    settings,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="mt-6 mb-8 ml-auto w-52 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-600">{t("subtotal")}</span>
          <span className="font-medium text-gray-900 tabular-nums">
            {formatCurrency(totals.subtotal, settings)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-600">{t("tax")}</span>
          <span className="font-medium text-gray-900 tabular-nums">
            {formatCurrency(totals.taxAmount, settings)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-3">
          <span className="font-semibold text-gray-900">{t("total")}</span>
          <span className="text-lg font-semibold text-gray-900 tabular-nums">
            {formatCurrency(totals.total, settings)}
          </span>
        </div>
      </div>

      {details.notes ? (
        <section className="invoice-notes mt-6 text-xs">
          <p className="font-semibold text-gray-700">{t("notes")}</p>
          <div
            className="wysiwyg-content mt-1 text-gray-700"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(details.notes) }}
          />
        </section>
      ) : null}
      {details.terms ? (
        <section className="invoice-terms mt-1 text-xs">
          <p className="font-semibold text-gray-700">{t("terms")}</p>
          <div
            className="wysiwyg-content mt-1 text-gray-700"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(details.terms) }}
          />
        </section>
      ) : null}

      {seller.signature && (
        <div className="mt-10 ml-auto w-48 text-center break-inside-avoid">
          <div className="relative h-24 mb-2 flex items-end justify-center">
            <img
              src={seller.signature}
              alt="Signature"
              className="absolute bottom-0 max-h-24 max-w-full object-contain"
            />
          </div>
          <div className="border-t border-gray-400 pt-1">
            <p className="text-xs text-gray-700 font-medium">
              {seller.signatoryName || seller.name}
            </p>
            {seller.signatoryJobTitle && (
              <p className="text-[10px] text-gray-500">
                {seller.signatoryJobTitle}
              </p>
            )}
          </div>
        </div>
      )}

      <section className="invoice-footer text-xs mt-6">
        <div className="text-[10px] text-gray-600 self-start">
          {settings.footerText || "Thank you for your business."}
        </div>
      </section>
    </div>
  );
}

SimpleInvoice.propTypes = {
  invoice: PropTypes.shape({
    seller: PropTypes.shape({
      name: PropTypes.string,
      address: PropTypes.string,
      phone: PropTypes.string,
      email: PropTypes.string,
    }).isRequired,
    customer: PropTypes.shape({
      name: PropTypes.string,
      address: PropTypes.string,
      phone: PropTypes.string,
      email: PropTypes.string,
    }).isRequired,
    details: PropTypes.shape({
      number: PropTypes.string,
      invoiceDate: PropTypes.string,
      dueDate: PropTypes.string,
      notes: PropTypes.string,
      terms: PropTypes.string,
    }).isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        name: PropTypes.string,
        quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }),
    ).isRequired,
    totals: PropTypes.shape({
      subtotal: PropTypes.number,
      taxPercent: PropTypes.number,
      taxAmount: PropTypes.number,
      total: PropTypes.number,
    }).isRequired,
    settings: PropTypes.shape({
      currency: PropTypes.string,
      locale: PropTypes.string,
      footerText: PropTypes.string,
    }).isRequired,
  }).isRequired,
};
