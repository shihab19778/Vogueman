import React from 'react';
import { ShoppingBag, User, Menu, X, LogIn } from 'lucide-react';
import { useCartStore } from '../store';
import { cn } from '../utils';
import { AuthModal } from './AuthModal';

interface NavbarProps {
  onCartClick: () => void;
  setView: (view: 'home' | 'shop' | 'checkout' | 'admin') => void;
  currentView: string;
  user: any;
}

export function Navbar({ onCartClick, setView, currentView, user }: NavbarProps) {
  const totalItems = useCartStore(state => state.totalItems());
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Shop', id: 'shop' },
    { name: 'Admin', id: 'admin' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setView('home')}
            className="text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity"
          >
            VOGUEMEN
          </button>
          
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => setView(link.id as any)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-zinc-900",
                  currentView === link.id ? "text-zinc-900" : "text-zinc-400"
                )}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="p-2 hover:bg-zinc-50 rounded-full transition-colors group relative"
          >
            {user ? (
              user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  className="w-5 h-5 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-5 h-5" />
              )
            ) : (
              <LogIn className="w-5 h-5" />
            )}
          </button>

          <button 
            onClick={onCartClick}
            className="relative p-2 hover:bg-zinc-50 rounded-full transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </button>
          
          <button 
            className="md:hidden p-2 hover:bg-zinc-50 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-100 py-4 px-4 flex flex-col gap-4">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => {
                setView(link.id as any);
                setIsMenuOpen(false);
              }}
              className={cn(
                "text-left text-lg font-medium py-2",
                currentView === link.id ? "text-zinc-900" : "text-zinc-400"
              )}
            >
              {link.name}
            </button>
          ))}
        </div>
      )}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        user={user} 
      />
    </nav>
  );
}
