import React from 'react';
import PropTypes from 'prop-types';

export default function Logo({ className = "h-8 w-8", classNameText = "text-brand-600" }) {
  return (
    <svg 
      className={`${className} ${classNameText}`}
      viewBox="0 0 726 727" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 147C0 65.8141 65.8141 0 147 0H726V580C726 661.186 660.186 727 579 727H147C65.8142 727 0 661.186 0 580V147Z" fill="currentColor"/>
      <rect x="161" y="165" width="403" height="396" rx="91" fill="white"/>
      <rect x="457" width="107" height="257" fill="white"/>
      <rect x="726" y="164" width="107" height="257" transform="rotate(90 726 164)" fill="white"/>
      <rect x="597" y="271" width="165" height="289" transform="rotate(90 597 271)" fill="currentColor"/>
    </svg>
  );
}

Logo.propTypes = {
  className: PropTypes.string,
  classNameText: PropTypes.string
};
