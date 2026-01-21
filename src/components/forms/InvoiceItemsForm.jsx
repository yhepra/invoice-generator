import React from "react"
import PropTypes from "prop-types"

export default function InvoiceItemsForm({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onClearItems,
  onMoveUp,
  onMoveDown
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Items</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAddItem}
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            + Add item
          </button>
          <button
            type="button"
            onClick={onClearItems}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Remove all
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto] items-center gap-2"
          >
            <input
              type="text"
              value={item.name}
              onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
              placeholder="Item name"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <input
              type="number"
              min="0"
              value={item.quantity}
              onChange={(e) => onUpdateItem(item.id, { quantity: e.target.value })}
              placeholder="Qty"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-right"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.price}
              onChange={(e) => onUpdateItem(item.id, { price: e.target.value })}
              placeholder="Price"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-right"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.taxPercent ?? ""}
              onChange={(e) =>
                onUpdateItem(item.id, { taxPercent: e.target.value })
              }
              placeholder="Tax %"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-right"
            />
            <button
              type="button"
              onClick={() => onMoveUp(item.id)}
              className="rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
              title="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => onMoveDown(item.id)}
              className="rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
              title="Move down"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => onRemoveItem(item.id)}
              className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
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
