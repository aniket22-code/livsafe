import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown } from 'lucide-react';

interface UserMenuProps {
  initials: string;
}

export function UserMenu({ initials }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={toggleMenu} 
        className="flex items-center space-x-2 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
          <span className="text-white font-medium">{initials}</span>
        </div>
        <ChevronDown className="text-primary-300 h-4 w-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-primary-700 rounded-xl shadow-lg py-1 z-50">
          <Link href="/preferences">
            <a className="block px-4 py-2 text-sm text-white hover:bg-primary-600">
              Preferences
            </a>
          </Link>
          <Link href="/update-password">
            <a className="block px-4 py-2 text-sm text-white hover:bg-primary-600">
              Update Password
            </a>
          </Link>
          <div className="border-t border-primary-600 my-1"></div>
          <button
            onClick={logout}
            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-primary-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
