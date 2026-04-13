import React from "react";
import PropTypes from "prop-types";
import formatCurrency from "../utils/formatCurrency.js";
import itemTotal from "../utils/itemTotal.js";
import { getTranslation } from "../data/translations.js";
import { sanitizeRichText } from "../utils/sanitizeRichText.js";

export default function Template2({ invoice, user }) {
  const { seller, customer, details, items, totals, settings } = invoice;
  const isFree = !user || user.plan === "free";
  const t = (key) => getTranslation(settings.language, key);
  const headerTitleNormalized = String(details.headerTitle || "").trim().toLowerCase();
  const isQuotation =
    headerTitleNormalized.startsWith("quotation") ||
    headerTitleNormalized.startsWith("penawaran") ||
    headerTitleNormalized === String(t("quotation")).trim().toLowerCase();
  
  const numberLabel = isQuotation ? t("quotationNumber") : t("number");
  const dateLabel = isQuotation ? t("quotationDate") : t("date");
  const dueDateLabel = isQuotation ? t("validUntil") : t("dueDate");

  const formatDate = (dateValue) => {
    const date = dateValue ? new Date(dateValue) : new Date();
    if (isNaN(date.getTime())) return dateValue || "";
    return date.toLocaleDateString(settings.locale || "id-ID", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  return (
    <div className="flex w-full flex-col bg-white text-xs text-gray-900 relative font-sans h-full min-h-[297mm]">
      {/* Top Graphic Header */}
      <div className="relative w-full min-h-[128px] flex items-start justify-between">
        {/* Background shapes */}
        <div className="absolute top-0 left-0 w-full h-full z-0">
          {/* Blue Top Bar */}
          <div className="absolute top-0 left-0 w-full h-8 bg-blue-600"></div>
          {/* Slate polygon using border triangle for html2canvas compatibility */}
          <div className="absolute top-8 left-0 h-24 bg-slate-800 md:w-[55%] w-[55%]"></div>
          <div className="absolute top-8 left-[55%] w-0 h-0 border-t-[96px] border-t-slate-800 border-r-[40px] border-r-transparent md:border-r-[60px]"></div>
        </div>

        {/* Content over shapes */}
        <div className="relative z-10 flex w-full px-8 pt-10">
          <div className="flex-1 flex flex-col justify-center h-20">
            {seller.logo ? (
              <img
                src={seller.logo}
                alt="Logo"
                className="max-h-20 w-auto max-w-[200px] object-contain"
              />
            ) : (
              <div>
                <h2 className="text-xl font-bold text-white tracking-wider">{seller.name || 'COMPANY NAME'}</h2>
              </div>
            )}
            
            {!seller.logo && isFree && (
              <a
                href="https://generateinvoice.id"
                target="_blank"
                rel="noreferrer"
                className="mt-1 block text-[10px] text-gray-400 hover:text-white"
                style={{ textDecoration: "none" }}
              >
                {t("generatedWith")}
              </a>
            )}
          </div>
          
          {/* Right Header Texts */}
          <div className="w-[45%] text-right pt-2 pr-4 flex flex-col items-end">
            <h1 className="text-4xl font-bold text-blue-600 tracking-wider uppercase mb-3 drop-shadow-sm">
              {details.headerTitle || t("invoice")}
            </h1>
            <div className="text-[11px] text-gray-800 space-y-1 w-full flex flex-col items-end">
              <div className="flex justify-end gap-2 w-full">
                <span className="font-bold">{numberLabel}:</span>
                <span className="text-gray-600 min-w-[100px] text-right">{details.number || invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-end gap-2 w-full">
                <span className="font-bold">{dateLabel}:</span>
                <span className="text-gray-600 min-w-[100px] text-right">{formatDate(details.invoiceDate || details.date)}</span>
              </div>
              <div className="flex justify-end gap-2 w-full">
                <span className="font-bold">{dueDateLabel}:</span>
                <span className="text-gray-600 min-w-[100px] text-right">{formatDate(details.dueDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 flex-1 mt-6">
        {/* Invoice To / Info */}
        <section className="flex justify-between w-full mb-8">
          <div className="w-1/2">
            <h3 className="text-blue-600 font-bold uppercase tracking-wider text-[11px] mb-2">{t("billTo")}</h3>
            <p className="font-bold text-[14px] text-gray-900 leading-tight">
              {customer.name || t("placeholderName")}
            </p>
            <table className="mt-2 text-[10px] w-full">
              <tbody>
                {customer.phone && (
                  <tr>
                    <td className="w-16 font-semibold text-gray-700 pb-1">Phone:</td>
                    <td className="text-gray-600 pb-1">{customer.phone}</td>
                  </tr>
                )}
                {customer.email && (
                  <tr>
                    <td className="w-16 font-semibold text-gray-700 pb-1">Email:</td>
                    <td className="text-gray-600 pb-1">{customer.email}</td>
                  </tr>
                )}
                {customer.address && (
                  <tr>
                    <td className="w-16 font-semibold text-gray-700 align-top">Address:</td>
                    <td className="text-gray-600 whitespace-pre-line">{customer.address}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Seller / Payment Info if needed */}
          <div className="w-[35%] pl-4 border-l border-gray-200">
            <h3 className="text-blue-600 font-bold uppercase tracking-wider text-[11px] mb-2">{t("from")}</h3>
            <table className="text-[10px] w-full">
              <tbody>
                <tr>
                  <td className="w-20 font-semibold text-gray-700 pb-1">Contact:</td>
                  <td className="text-gray-600 pb-1">{seller.phone || "-"}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-gray-700 pb-1">Email:</td>
                  <td className="text-gray-600 pb-1">{seller.email || "-"}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-gray-700 align-top">Address:</td>
                  <td className="text-gray-600">{seller.address || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Table */}
        <section className="mt-6 mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="uppercase text-[11px] tracking-wider font-semibold text-white">
                <th className="bg-slate-800 py-3 pl-4 pr-2 w-12 text-center rounded-tl-sm">NO.</th>
                <th className="bg-slate-800 py-3 px-2">{t("item")}</th>
                <th className="bg-blue-600 py-3 px-2 w-28 text-right">{t("price")}</th>
                <th className="bg-blue-600 py-3 px-2 w-16 text-right">{t("quantity")}</th>
                <th className="bg-blue-600 py-3 px-4 w-32 text-right rounded-tr-sm">{t("total")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-4 pl-4 pr-2 text-center text-gray-500">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="py-4 px-2 text-gray-800">
                    <div
                      className="wysiwyg-content font-medium"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeRichText(item.name || t("placeholderItemName")),
                      }}
                    />
                  </td>
                  <td className="py-4 px-2 text-right text-gray-600">
                    {formatCurrency(item.price, settings)}
                  </td>
                  <td className="py-4 px-2 text-right text-gray-600">
                    {item.quantity || 0}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-800 font-semibold">
                    {formatCurrency(itemTotal(item.quantity, item.price), settings)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Subtotal & Footer Info Grid */}
        <div className="flex justify-between items-start mt-8">
          
          {/* Terms & Notes (Left side) */}
          <div className="w-[55%] pr-4 space-y-5">
            {details.terms && (
              <div>
                <h4 className="text-blue-600 font-bold uppercase tracking-wider text-[10px] mb-2">{t("terms")}</h4>
                <div
                  className="wysiwyg-content text-[10px] text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(details.terms) }}
                />
              </div>
            )}
            
            {details.notes && (
              <div>
                <h4 className="text-blue-600 font-bold uppercase tracking-wider text-[10px] mb-2">{t("notes")}</h4>
                <div
                  className="wysiwyg-content text-[10px] text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(details.notes) }}
                />
              </div>
            )}
            
            <div className="pt-4 font-bold text-gray-800 text-[11px] uppercase">
              {settings.footerText || "THANK YOU FOR YOUR BUSINESS."}
            </div>
          </div>

          {/* Totals (Right Side) */}
          <div className="w-[40%]">
            <div className="flex justify-between py-2 px-4 border-b border-gray-200">
              <span className="text-gray-600 font-medium">{t("subtotal")}:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(totals.subtotal, settings)}</span>
            </div>
            {totals.taxAmount > 0 && (
              <div className="flex justify-between py-2 px-4 border-b border-gray-200">
                <span className="text-gray-600 font-medium">{t("tax")}:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(totals.taxAmount, settings)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 mt-1 bg-blue-600 px-4 rounded-sm text-white">
              <span className="font-bold text-[13px]">{t("total")}:</span>
              <span className="font-bold text-[13px]">{formatCurrency(totals.total, settings)}</span>
            </div>

            {/* Signature Area */}
            {seller.signature && (
              <div className="mt-12 flex flex-col items-end">
                <div className="relative h-24 mb-2 flex items-end justify-center w-48">
                  <img
                    src={seller.signature}
                    alt="Signature"
                    className="absolute bottom-0 max-h-24 max-w-full object-contain"
                  />
                </div>
                <div className="border-t border-gray-300 w-48 pt-2 text-center">
                  <p className="text-[10px] text-gray-800 font-semibold leading-tight">
                    {seller.signatoryName || seller.name}
                  </p>
                  {seller.signatoryJobTitle && (
                    <p className="text-[9px] text-gray-500">
                      {seller.signatoryJobTitle}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Footer Border Graphic */}
      <div className="w-full mt-auto mb-4 pb-6 px-8 flex justify-between items-center text-[9px] text-gray-500">
         {/* Could put icons here, using simple text for now */}
         <div className="border-t-[3px] border-blue-600 pt-3 w-full flex justify-between">
           {seller.phone && <span>📞 {seller.phone}</span>}
           {seller.email && <span>✉️ {seller.email}</span>}
           {seller.address && <span>📍 {seller.address.substring(0, 40)}{seller.address.length > 40 ? '...' : ''}</span>}
         </div>
      </div>
    </div>
  );
}

Template2.propTypes = {
  invoice: PropTypes.object.isRequired,
  user: PropTypes.object
};
