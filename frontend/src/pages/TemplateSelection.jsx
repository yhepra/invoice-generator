import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTranslation } from '../data/translations';

const SimpleThumb = () => (
  <svg viewBox="0 0 200 280" className="w-full h-full bg-white shadow-sm transition-transform group-hover:scale-[1.02]">
    <rect x="20" y="20" width="40" height="40" rx="4" fill="#f3f4f6" />
    <rect x="120" y="25" width="60" height="15" rx="2" fill="#d1d5db" />
    <rect x="20" y="80" width="80" height="6" rx="2" fill="#e5e7eb" />
    <rect x="20" y="95" width="60" height="6" rx="2" fill="#e5e7eb" />
    
    <rect x="20" y="130" width="160" height="15" fill="#f3f4f6" />
    <rect x="20" y="150" width="160" height="2" fill="#f3f4f6" />
    <rect x="20" y="160" width="160" height="2" fill="#f3f4f6" />
    <rect x="20" y="170" width="160" height="2" fill="#f3f4f6" />
    <rect x="20" y="180" width="160" height="2" fill="#f3f4f6" />
    
    <rect x="130" y="200" width="50" height="20" rx="2" fill="#d1d5db" />
  </svg>
);

const Template1Thumb = () => (
  <svg viewBox="0 0 200 280" className="w-full h-full bg-white shadow-sm transition-transform group-hover:scale-[1.02]">
    {/* Orange bar */}
    <rect x="0" y="0" width="200" height="15" fill="#f97316" />
    {/* Black polygon */}
    <polygon points="0,15 130,15 110,60 0,60" fill="#111827" />
    <rect x="20" y="30" width="40" height="15" rx="2" fill="#4b5563" />
    
    <rect x="140" y="25" width="50" height="12" rx="2" fill="#f97316" />
    <rect x="140" y="45" width="50" height="4" rx="2" fill="#d1d5db" />
    <rect x="140" y="55" width="40" height="4" rx="2" fill="#d1d5db" />
    
    {/* Content */}
    <rect x="20" y="80" width="60" height="5" rx="2" fill="#f97316" />
    <rect x="20" y="92" width="70" height="4" rx="2" fill="#d1d5db" />
    <rect x="20" y="100" width="50" height="4" rx="2" fill="#d1d5db" />
    
    {/* Table */}
    <rect x="20" y="125" width="30" height="15" fill="#111827" />
    <rect x="50" y="125" width="130" height="15" fill="#f97316" />
    
    <rect x="20" y="145" width="160" height="2" fill="#f3f4f6" />
    <rect x="20" y="155" width="160" height="2" fill="#f3f4f6" />
    <rect x="20" y="165" width="160" height="2" fill="#f3f4f6" />
    
    {/* Total */}
    <rect x="130" y="190" width="50" height="15" rx="2" fill="#f97316" />
  </svg>
);

const Template2Thumb = () => (
  <svg viewBox="0 0 200 280" className="w-full h-full bg-white shadow-sm transition-transform group-hover:scale-[1.02]">
    {/* Blue bar */}
    <rect x="0" y="0" width="200" height="15" fill="#2563eb" />
    {/* Slate polygon */}
    <polygon points="0,15 130,15 110,60 0,60" fill="#1e293b" />
    <rect x="20" y="30" width="40" height="15" rx="2" fill="#475569" />
    
    <rect x="140" y="25" width="50" height="12" rx="2" fill="#2563eb" />
    <rect x="140" y="45" width="50" height="4" rx="2" fill="#d1d5db" />
    <rect x="140" y="55" width="40" height="4" rx="2" fill="#d1d5db" />
    
    {/* Content */}
    <rect x="20" y="80" width="60" height="5" rx="2" fill="#2563eb" />
    <rect x="20" y="92" width="70" height="4" rx="2" fill="#d1d5db" />
    <rect x="20" y="100" width="50" height="4" rx="2" fill="#d1d5db" />
    
    {/* Table */}
    <rect x="20" y="125" width="30" height="15" fill="#1e293b" />
    <rect x="50" y="125" width="130" height="15" fill="#2563eb" />
    
    <rect x="20" y="145" width="160" height="2" fill="#e2e8f0" />
    <rect x="20" y="155" width="160" height="2" fill="#e2e8f0" />
    <rect x="20" y="165" width="160" height="2" fill="#e2e8f0" />
    
    {/* Total */}
    <rect x="130" y="190" width="50" height="15" rx="2" fill="#2563eb" />
  </svg>
);

export default function TemplateSelection({ settings, user }) {
  const navigate = useNavigate();
  const t = (key) => getTranslation(settings?.language, key);

  const isPremium = user?.plan === "premium" || user?.plan === "lifetime";

  const templates = [
    { id: 'simple', name: 'Simple Clean', thumb: <SimpleThumb />, premium: false },
    { id: 'template1', name: 'Modern Orange', thumb: <Template1Thumb />, premium: true },
    { id: 'template2', name: 'Corporate Blue', thumb: <Template2Thumb />, premium: true }
  ];

  const handleSelect = (tpl) => {
    if (tpl.premium && !isPremium) {
      navigate('/upgrade');
      return;
    }
    navigate('/create', { state: { initialTemplate: tpl.id } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t("selectTemplate") || "Select Template"}</h1>
          <p className="text-xl text-gray-600">Choose a design for your new invoice. You can always change it later.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {templates.map((tpl) => (
            <div 
              key={tpl.id}
              onClick={() => handleSelect(tpl)}
              className="group cursor-pointer flex flex-col items-center relative"
            >
              {tpl.premium && !isPremium && (
                <div className="absolute -top-3 -right-3 z-10 bg-gray-900 border-2 border-white text-white p-2 text-xs font-bold rounded-full shadow-lg flex items-center gap-1 group-hover:scale-110 transition-transform">
                  <span>🔒</span> Premium
                </div>
              )}
              <div className={`w-full aspect-[1/1.4] rounded-lg overflow-hidden border-2 transition-all duration-200 ${tpl.premium && !isPremium ? 'border-gray-200 opacity-80 group-hover:border-gray-400 group-hover:opacity-100' : 'border-transparent hover:border-blue-500 hover:shadow-xl'}`}>
                {tpl.thumb}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <h3 className={`text-lg font-bold group-hover:text-blue-600 ${tpl.premium && !isPremium ? 'text-gray-500' : 'text-gray-800'}`}>{tpl.name}</h3>
              </div>
              <button className={`mt-3 px-6 py-2 border font-medium rounded-md transition-colors ${tpl.premium && !isPremium ? 'bg-gray-100 text-gray-500 border-gray-300 group-hover:bg-gray-200 group-hover:text-gray-700' : 'bg-white border-gray-300 text-gray-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600'}`}>
                {tpl.premium && !isPremium ? 'Buka Kunci Premium' : 'Gunakan Template'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
