import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center font-display font-bold text-white text-xs">
            S
          </div>
          <span className="font-display text-base font-semibold hidden sm:inline">Stackline</span>
        </Link>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 hover:bg-surfaceRaised transition-colors"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <span
                className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                style={{ backgroundColor: user?.avatarColor || '#6c63ff' }}
              >
                {initials(user?.name) || 'U'}
              </span>
              <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-surfaceRaised shadow-raised py-1">
                <div className="px-3.5 py-2 border-b border-border">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-inkMuted truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-2 text-sm text-danger hover:bg-bg transition-colors"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
