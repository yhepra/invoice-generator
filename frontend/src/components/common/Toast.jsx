import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

export default function Toast({ message, type, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';

  return (
    <div className={`relative w-80 ${bgColor} text-white px-6 py-4 rounded shadow-lg flex items-center gap-4 transition-all duration-300 animate-fade-in overflow-hidden`}>
      <div className="flex-1">
        {message}
      </div>
      <button 
        onClick={onClose}
        className="text-white hover:text-gray-200 focus:outline-none font-bold text-xl"
      >
        &times;
      </button>
      <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
        <div 
            className="h-full bg-white/70 origin-left animate-countdown"
            style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error']),
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number
};

Toast.defaultProps = {
  type: 'error',
  duration: 3000
};
