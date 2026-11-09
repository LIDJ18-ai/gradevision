import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';
import type { Page } from '@/types';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLink = (page: Page, label: string) => (
    <button
      onClick={() => {
        onNavigate(page);
        setMobileOpen(false);
      }}
      className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
        currentPage === page
          ? 'text-gold-300'
          : 'text-ink-200 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-ink-700/60 bg-ink-950/80 backdrop-blur-md">
      <div className="section-padding max-w-7xl mx-auto flex items-center justify-between h-16">
        <Logo onClick={() => onNavigate('home')} size="md" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLink('home', 'Home')}
          {navLink('upload', 'New Grading')}
          {user && navLink('dashboard', 'Dashboard')}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs text-ink-400 max-w-[160px] truncate">
                {user.email}
              </span>
              <button onClick={signOut} className="btn-ghost text-sm px-4 py-2">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onNavigate('login')} className="btn-ghost text-sm px-4 py-2">
                Sign In
              </button>
              <button onClick={() => onNavigate('signup')} className="btn-gold text-sm px-4 py-2">
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-ink-200 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ink-700/60 bg-ink-900/95 backdrop-blur-md">
          <div className="px-6 py-4 flex flex-col gap-4">
            {navLink('home', 'Home')}
            {navLink('upload', 'New Grading')}
            {user && navLink('dashboard', 'Dashboard')}
            <div className="pt-2 border-t border-ink-700/40 flex flex-col gap-3">
              {user ? (
                <>
                  <span className="text-xs text-ink-400 truncate">{user.email}</span>
                  <button onClick={signOut} className="btn-ghost w-full">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { onNavigate('login'); setMobileOpen(false); }} className="btn-ghost w-full">
                    Sign In
                  </button>
                  <button onClick={() => { onNavigate('signup'); setMobileOpen(false); }} className="btn-gold w-full">
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
