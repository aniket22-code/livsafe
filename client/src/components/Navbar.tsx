import { Link } from 'wouter';
import { useState } from 'react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { ThemeButton } from './ThemeButton';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  showAuthButtons?: boolean;
  userType?: 'doctor' | 'organization' | null;
}

export function Navbar({ showAuthButtons = true, userType = null }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getLinks = () => {
    if (userType === 'doctor') {
      return [
        { href: '/doctor/dashboard', label: 'Dashboard' },
        { href: '/doctor/search', label: 'Search' },
        { href: '/about', label: 'About' },
        { href: '/help', label: 'Help' },
      ];
    } else if (userType === 'organization') {
      return [
        { href: '/organization/dashboard', label: 'Dashboard' },
        { href: '/about', label: 'About' },
        { href: '/help', label: 'Help' },
      ];
    } else {
      return [
        { href: '/', label: 'Dashboard' },
        { href: '/solutions', label: 'Solutions' },
        { href: '/about', label: 'About' },
        { href: '/help', label: 'Help' },
      ];
    }
  };

  const links = getLinks();

  return (
    <nav className="px-6 py-4 sm:px-12 flex items-center justify-between">
      <Logo />
      
      <div className="hidden md:flex items-center space-x-8">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <div className="text-white hover:text-black transition cursor-pointer">{link.label}</div>
          </Link>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeButton />
        {showAuthButtons && (
          <Link href="/signup">
            <Button variant="outline" className="bg-white text-black hover:bg-gray-100">
              Sign up
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1 h-4 w-4"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Button>
          </Link>
        )}
      </div>
      
      <button onClick={toggleMenu} className="md:hidden text-white">
        {isMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-primary-700 border-b border-primary-600 z-50">
          <div className="flex flex-col p-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className="px-4 py-2 text-white hover:text-primary-100 hover:bg-primary-800 rounded-md cursor-pointer">
                  {link.label}
                </div>
              </Link>
            ))}
            {showAuthButtons && (
              <div className="mt-4 pt-4 border-t border-primary-600">
                <Link href="/login">
                  <div className="block px-4 py-2 text-white hover:text-primary-100 hover:bg-primary-800 rounded-md cursor-pointer">
                    Login
                  </div>
                </Link>
                <Link href="/signup">
                  <div className="block px-4 py-2 mt-2 bg-accent text-white rounded-md hover:bg-accent/90 cursor-pointer">
                    Sign up
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
