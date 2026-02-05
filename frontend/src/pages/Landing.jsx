import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { storage } from "../services/storage";
import formatCurrency from "../utils/formatCurrency";
import Button from "../components/common/Button";
import { getTranslation } from "../data/translations";

export default function Landing({
  user,
  onCreateInvoice,
  onLoadInvoice,
  onGoUpgrade,
  onGoHistory,
  onLogin,
  onRegister,
  settings,
}) {
  const t = (key) => getTranslation(settings?.language, key);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        try {
          const invoices = await storage.getInvoices();
          // Get top 3 most recent
          setRecentInvoices(invoices.slice(0, 3));
        } catch (error) {
          console.error("Failed to load recent invoices", error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [user]);

  if (user) {
    return (
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-gradient-to-r from-brand-600 to-blue-600 p-8 text-white shadow-lg md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold flex items-center gap-3">
              {t("welcomeBack").replace("{name}", user.name)}
            </h1>
            <p className="text-blue-100">{t("readyToCreate")}</p>
          </div>
          <Button
            onClick={onCreateInvoice}
            variant="secondary"
            className="border-none shadow-md px-6 py-3 text-lg"
          >
            {t("createNewInvoice")}
          </Button>
        </div>

        {user.plan !== "premium" && (
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-orange-100 to-amber-100 p-6 shadow-sm border border-orange-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-lg font-bold text-gray-900">
                  {t("unlockPremium")}
                </h3>
                <p className="text-gray-600">{t("premiumBenefits")}</p>
              </div>
            </div>
            <Button
              onClick={onGoUpgrade}
              className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white border-none shadow-md whitespace-nowrap"
            >
              {t("upgradeNow")}
            </Button>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {t("recentInvoices")}
          </h2>
          {recentInvoices.length > 0 && (
            <button
              onClick={onGoHistory}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              {t("viewAllHistory")} &rarr;
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">
            {t("loadingDashboard")}
          </div>
        ) : recentInvoices.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 p-4 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {t("noInvoicesYet")}
            </h3>
            <p className="mb-6 text-gray-500">{t("createFirstInvoice")}</p>
            <Button onClick={onCreateInvoice}>{t("createInvoice")}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentInvoices.map((inv) => (
              <div
                key={inv.historyId}
                className="group relative flex flex-col justify-between rounded-xl border bg-white p-5 shadow-sm transition-all hover:border-brand-300 hover:shadow-md"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-md bg-gray-100 px-2.5 py-1 text-sm font-semibold text-gray-700">
                      #{inv.details.number}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(inv.savedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p
                      className="mb-1 truncate font-medium text-gray-900"
                      title={inv.customer.name}
                    >
                      {inv.customer.name || t("unknownCustomer")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {inv.items.length} {t("itemsCount")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t("totalAmount")}
                    </span>
                    <span className="text-lg font-bold text-brand-600">
                      {formatCurrency(inv.totals.total, inv.settings)}
                    </span>
                  </div>
                  <Button
                    onClick={() => onLoadInvoice(inv)}
                    variant="secondary"
                    className="w-full"
                  >
                    {t("editView")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Guest Landing Page
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 px-4 py-20 text-center text-white md:px-8 md:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="relative mx-auto max-w-5xl">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-tight">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-lg text-slate-300 sm:text-xl">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={onCreateInvoice}
              className="h-14 px-8 text-lg font-bold shadow-xl shadow-brand-900/20 transform transition hover:scale-105"
            >
              {t("heroCreateInvoice")}
            </Button>
            <Button
              onClick={onRegister}
              variant="secondary"
              className="h-14 px-8 text-lg font-bold text-slate-900 border-none hover:bg-gray-100 transform transition hover:scale-105"
            >
              {t("heroStartFree")}
            </Button>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            {t("alreadyHaveAccount")}{" "}
            <button
              onClick={onLogin}
              className="text-brand-400 hover:text-brand-300 underline font-medium"
            >
              {t("loginRegister")}
            </button>
          </p>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("painPointsTitle")}
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              {t("painPointsSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: t("ppTrackingTitle"), desc: t("ppTrackingDesc") },
              {
                title: t("ppProfessionalTitle"),
                desc: t("ppProfessionalDesc"),
              },
              { title: t("ppLostDataTitle"), desc: t("ppLostDataDesc") },
              { title: t("ppCalcErrorsTitle"), desc: t("ppCalcErrorsDesc") },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-red-50 rounded-xl p-6 border border-red-100"
              >
                <div className="text-red-500 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("featuresTitle")}
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              {t("featuresSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: t("featFastTitle"),
                desc: t("featFastDesc"),
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                color: "blue",
              },
              {
                title: t("featSecureTitle"),
                desc: t("featSecureDesc"),
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                color: "green",
              },
              {
                title: t("featLookTitle"),
                desc: t("featLookDesc"),
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                color: "purple",
              },
              {
                title: t("featClientTitle"),
                desc: t("featClientDesc"),
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                color: "indigo",
              },
              {
                title: t("featHistoryTitle"),
                desc: t("featHistoryDesc"),
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                color: "yellow",
              },
              {
                title: t("featMobileTitle"),
                desc: t("featMobileDesc"),
                icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
                color: "pink",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white p-8 shadow-sm transition-transform hover:-translate-y-1 border border-gray-100"
              >
                <div
                  className={`mb-4 inline-block rounded-lg bg-${feature.color}-100 p-3 text-${feature.color}-600`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={feature.icon}
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("howItWorksTitle")}
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              {t("howItWorksSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              {
                step: "01",
                title: t("step1Title"),
                desc: t("step1Desc"),
                icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
              },
              {
                step: "02",
                title: t("step2Title"),
                desc: t("step2Desc"),
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
              },
              {
                step: "03",
                title: t("step3Title"),
                desc: t("step3Desc"),
                icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative p-6 flex flex-col items-center"
              >
                <div className="text-6xl font-black text-gray-100 absolute top-0 left-1/2 transform -translate-x-1/2 -z-10">
                  {item.step}
                </div>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600 shadow-sm mt-4 z-10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("plansTitle")}
            </h2>
            <p className="mt-4 text-xl text-gray-600">{t("plansSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t("planFree")}
              </h3>
              <p className="text-gray-500 mb-6">{t("planFreeDesc")}</p>
              <div className="text-4xl font-extrabold text-gray-900 mb-6">
                {t("planFreePrice")}{" "}
                <span className="text-base font-normal text-gray-500">
                  {t("planFreePeriod")}
                </span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  t("featLimitContacts"),
                  t("featLimitInvoices"),
                  t("featWatermark"),
                  t("featFixedHeader"),
                  t("featAutoNumber"),
                ].map((feat, i) => (
                  <li key={i} className="flex items-center text-gray-600">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <Button onClick={onRegister} variant="outline" className="w-full">
                {t("startForFree")}
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-brand-500 relative transform md:-translate-y-4">
              <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                {t("recommended")}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t("planPremium")}
              </h3>
              <p className="text-gray-500 mb-6">{t("planPremiumDesc")}</p>
              <div className="text-4xl font-extrabold text-gray-900 mb-6">
                {t("planPremiumPrice")}{" "}
                <span className="text-base font-normal text-gray-500">
                  {t("planPremiumPeriod")}
                </span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  t("featUnlimitedContacts"),
                  t("featUnlimitedInvoices"),
                  t("featNoWatermark"),
                  t("featCustomHeader"),
                  t("featCustomNumber"),
                  t("featPrioritySupport"),
                ].map((feat, i) => (
                  <li key={i} className="flex items-center text-gray-600">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <Button onClick={onRegister} className="w-full">
                {t("getPremium")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("faqTitle")}
            </h2>
          </div>
          <div className="space-y-6">
            {[
              { q: t("faq1Q"), a: t("faq1A") },
              { q: t("faq2Q"), a: t("faq2A") },
              { q: t("faq3Q"), a: t("faq3A") },
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {faq.q}
                </h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-brand-600 py-16 px-4 text-center text-white">
        <h2 className="mb-4 text-3xl font-bold">{t("ctaTitle")}</h2>
        <p className="mb-8 text-blue-100 text-lg">{t("ctaSubtitle")}</p>
        <Button
          onClick={onRegister}
          variant="secondary"
          className="h-12 px-8 text-lg font-semibold border-none shadow-lg"
        >
          {t("ctaButton")}
        </Button>
      </section>
    </div>
  );
}

Landing.propTypes = {
  user: PropTypes.object,
  onCreateInvoice: PropTypes.func.isRequired,
  onLoadInvoice: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func,
  onGoUpgrade: PropTypes.func,
  settings: PropTypes.object,
};
