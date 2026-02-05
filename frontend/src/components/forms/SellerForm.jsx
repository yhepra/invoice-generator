import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import PhoneInput from "../common/PhoneInput.jsx";
import { storage } from "../../services/storage";
import { getTranslation } from "../../data/translations.js";

export default function SellerForm({ seller, onChange, settings }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [savedLogos, setSavedLogos] = useState([]);
  const [showLogoHistory, setShowLogoHistory] = useState(false);
  const wrapperRef = useRef(null);
  const fileInputRef = useRef(null);

  const t = (key) => getTranslation(settings?.language, key);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const contacts = await storage.getContacts();
        setSuggestions(contacts.filter((c) => c.type === "seller"));
      } catch (error) {
        console.error("Failed to load contacts", error);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchLogos = async () => {
      const logos = await storage.getLogos();
      setSavedLogos(logos);
    };
    fetchContacts();
    fetchLogos();

    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNameChange = (e) => {
    onChange({ name: e.target.value });
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (contact) => {
    onChange({
      name: contact.name,
      address: contact.address,
      phone: contact.phone,
      email: contact.email,
    });
    setShowSuggestions(false);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      onChange({ logo: result });
      // Save to history
      storage.saveLogo(result).then(() => {
        setSavedLogos((prev) => {
          if (!prev.includes(result)) {
            return [result, ...prev].slice(0, 10);
          }
          return prev;
        });
      });
    };
    reader.readAsDataURL(file);
  };

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.name.toLowerCase().includes((seller.name || "").toLowerCase()) &&
      s.name !== seller.name,
  );

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{t("seller")}</h2>
      <div className="relative" ref={wrapperRef}>
        <label className="block text-sm text-gray-600 mb-1">
          {t("name")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={seller.name}
          onChange={handleNameChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={t("placeholderName")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          autoComplete="off"
        />
        {showSuggestions && (
          <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg">
            {isLoading ? (
              <li className="px-3 py-2 text-sm text-gray-500">
                {t("loading")}
              </li>
            ) : filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((s) => (
                <li
                  key={s.id}
                  onClick={() => handleSelectSuggestion(s)}
                  className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
                >
                  <div className="font-medium text-gray-900">{s.name}</div>
                  <div className="truncate text-xs text-gray-500">
                    {s.email} {s.phone && `• ${s.phone}`}
                  </div>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-500">
                {suggestions.length === 0
                  ? t("noSavedSellers")
                  : t("noMatchesFound")}
              </li>
            )}
          </ul>
        )}
      </div>
      <textarea
        value={seller.address}
        onChange={(e) => onChange({ address: e.target.value })}
        placeholder={t("placeholderAddress")}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        rows={3}
      />
      <div className="grid grid-cols-2 gap-3">
        <PhoneInput
          value={seller.phone}
          onChange={(val) => onChange({ phone: val })}
          placeholder={t("placeholderPhone")}
        />
        <input
          type="email"
          value={seller.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder={t("placeholderEmail")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm text-gray-600">{t("logo")}</label>
          {savedLogos.length > 0 && (
            <button
              type="button"
              onClick={() => setShowLogoHistory(!showLogoHistory)}
              className="text-xs text-brand-600 hover:text-brand-700"
            >
              {showLogoHistory
                ? t("hideHistory") || "Hide History"
                : t("showHistory") || "Show History"}
            </button>
          )}
        </div>

        {showLogoHistory && savedLogos.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">
              {t("selectFromHistory") || "Select from history"}:
            </p>
            <div className="grid grid-cols-5 gap-2">
              {savedLogos.map((l, i) => (
                <div
                  key={i}
                  className="relative aspect-square cursor-pointer rounded-md border border-gray-200 p-1 hover:border-brand-500 bg-white flex items-center justify-center group"
                  onClick={() => onChange({ logo: l })}
                  title={t("useThisLogo") || "Use this logo"}
                >
                  <img
                    src={l}
                    alt={`History ${i}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <div
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
            isDragging
              ? "border-brand-500 bg-brand-50"
              : "border-gray-300 hover:border-gray-400 bg-white"
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: "pointer", minHeight: "120px" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {seller.logo ? (
            <div className="text-center group">
              <div className="relative inline-block">
                <img
                  src={seller.logo}
                  alt="Logo"
                  className="mx-auto h-20 w-auto object-contain mb-2"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-md"></div>
              </div>
              <p className="text-xs text-gray-500">{t("clickToChange")}</p>
            </div>
          ) : (
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-1 text-sm text-gray-600">
                {t("dragDropOrClick")}
              </p>
            </div>
          )}

          {seller.logo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange({ logo: "" });
              }}
              className="absolute top-2 right-2 rounded-full bg-white p-1 text-gray-400 hover:text-red-500 shadow-sm border border-gray-200"
              title={t("removeLogo")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

SellerForm.propTypes = {
  seller: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    logo: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
