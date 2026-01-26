import React from "react"
import PropTypes from "prop-types"
import { getTranslation } from "../../data/translations.js"

export default function InvoiceItemsForm({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onClearItems,
  onMoveUp,
  onMoveDown,
  settings
}) {
  const t = (key) => getTranslation(settings?.language, key);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('items')}</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAddItem}
            className="rounded-md p-2 text-brand-600 hover:bg-brand-50 hover:text-brand-700"
            title={t('addItem')}
            aria-label={t('addItem')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onClearItems}
            className="rounded-md p-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            title={t('removeAll')}
            aria-label={t('removeAll')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2m-9 4v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V10" />
            </svg>
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('itemName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                placeholder={t('placeholderItemName')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-end gap-3">
              <div className="w-24">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('quantity')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "" || parseFloat(val) >= 0) {
                        onUpdateItem(item.id, { quantity: val })
                    }
                  }}
                  placeholder="0"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-right text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('price')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "" || parseFloat(val) >= 0) {
                        onUpdateItem(item.id, { price: val })
                    }
                  }}
                  placeholder="0.00"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-right text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="w-24">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('taxPercent')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.taxPercent ?? ""}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "" || parseFloat(val) >= 0) {
                        onUpdateItem(item.id, { taxPercent: val })
                    }
                  }}
                  placeholder="0"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-right text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex gap-1 pb-1">
                <button
                  type="button"
                  onClick={() => onMoveUp(item.id)}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  title={t('moveUp')}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onMoveDown(item.id)}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  title={t('moveDown')}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="rounded-md p-2 text-red-500 hover:bg-red-50 hover:text-red-700"
                  title={t('removeItem')}
                  aria-label={t('removeItem')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4h8v2m-9 4v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V10" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

InvoiceItemsForm.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string,
      quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      taxPercent: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  ).isRequired,
  onAddItem: PropTypes.func.isRequired,
  onUpdateItem: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  onClearItems: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired
}
