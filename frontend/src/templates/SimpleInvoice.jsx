import React from "react";
import PropTypes from "prop-types";
import formatCurrency from "../utils/formatCurrency.js";
import itemTotal from "../utils/itemTotal.js";
import { getTranslation } from "../data/translations.js";

export default function SimpleInvoice({ invoice, user }) {
  const { seller, customer, details, items, totals, settings } = invoice;
  const isFree = !user || user.plan === "free";
  const t = (key) => getTranslation(settings.language, key);

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

  return (
    <div className="invoice-content flex w-full flex-col bg-white text-sm text-gray-900 relative">
      <header className="flex items-start justify-between border-b border-gray-200 pb-6 relative z-10">
        <div className="flex items-start gap-6">
          {seller.logo && (
            <img
              src={seller.logo}
              alt="Logo"
              className="h-24 w-24 object-contain"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {details.headerTitle || t("invoice")}
            </h1>
            {isFree && (
              <a
                href="https://generateinvoice.id"
                target="_blank"
                rel="noreferrer"
                className="mt-1 block text-xs text-gray-500 hover:text-gray-700 hover:underline"
                style={{ textDecoration: "none" }}
              >
                {t("generatedWith")}
              </a>
            )}
          </div>
        </div>
        <div className="text-right text-xs">
          <p className="font-semibold">{t("number")}</p>
          <p className="text-gray-700">{details.number}</p>
          <p className="mt-2 font-semibold">{t("date")}</p>
          <p className="text-gray-700">{formatDate(details.invoiceDate)}</p>
          <p className="mt-2 font-semibold">{t("dueDate")}</p>
          <p className="text-gray-700">{formatDate(details.dueDate)}</p>
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
                  {item.name || t("placeholderItemName")}
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
          <p className="mt-1 whitespace-pre-line text-gray-700">
            {details.notes}
          </p>
        </section>
      ) : null}
      {details.terms ? (
        <section className="invoice-terms mt-1 text-xs">
          <p className="font-semibold text-gray-700">{t("terms")}</p>
          <p className="mt-1 whitespace-pre-line text-gray-700">
            {details.terms}
          </p>
        </section>
      ) : null}

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
