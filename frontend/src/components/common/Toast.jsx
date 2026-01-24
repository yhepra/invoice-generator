import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';

  return (
    <div className={`fixed top-5 right-5 z-50 ${bgColor} text-white px-6 py-4 rounded shadow-lg flex items-center gap-4 transition-opacity duration-300 animate-fade-in`}>
      <div className="flex-1">
        {message}
      </div>
      <button 
        onClick={onClose}
        className="text-white hover:text-gray-200 focus:outline-none font-bold text-xl"
      >
        &times;
      </button>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error']),
  onClose: PropTypes.func.isRequired,
};

Toast.defaultProps = {
  type: 'error',
};
