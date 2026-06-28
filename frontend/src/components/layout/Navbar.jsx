import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import { Calendar, Sun, Moon } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user } = useAuthStore();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="topbar animate-fade-in">
      <div>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="topbar-actions">
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme} 
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
          <Calendar size={16} />
          <span>{today}</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
