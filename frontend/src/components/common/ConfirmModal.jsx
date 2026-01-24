import React from 'react';
import Button from './Button';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "danger" // 'danger' | 'primary'
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-gray-200">
        <div className="p-6">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {title}
          </h3>
          <p className="text-sm text-gray-500">
            {message}
          </p>
          
          <div className="mt-6 flex justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-gray-700 hover:bg-gray-100"
            >
              {cancelText}
            </Button>
            <Button 
              variant={variant === 'danger' ? 'danger' : 'primary'} 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
