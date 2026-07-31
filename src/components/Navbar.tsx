import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <header className="navbar">
      {/* Brand & Logo Only */}
      <div className="brand-container">
        <img
          src="/printo-logo.png"
          alt="Printo Cards & Technologies"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
          style={{
            height: '40px',
            width: 'auto',
            objectFit: 'contain',
            display: 'block'
          }}
        />
        <div style={{ display: 'none', alignItems: 'center', gap: '0.85rem' }}>
          <div className="brand-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <span className="brand-title">Printo Store</span>
        </div>
      </div>
    </header>
  );
};
