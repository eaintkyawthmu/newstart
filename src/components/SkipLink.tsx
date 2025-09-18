import React from 'react';

const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="skip-link"
      onFocus={(e) => e.currentTarget.focus()}
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;