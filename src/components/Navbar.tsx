'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useAuth, UserButton, SignInButton, useUser } from '@clerk/nextjs';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  const userRole = user?.publicMetadata?.role as string;
  const isAdmin = userRole === 'ADMIN';
  const isAgent = userRole === 'AGENT';
  const isUnderwriter = userRole === 'UNDERWRITER';

  const publicNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];

  const customerNavLinks = [
    { href: '/customer/dashboard', label: 'Dashboard' },
    { href: '/customer/claims', label: 'Claims' },
    { href: '/customer/policies', label: 'Policies' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];

  const adminNavLinks = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];

  const agentNavLinks = [
    { href: '/agent/dashboard', label: 'Dashboard' },
    { href: '/agent/policies', label: 'Policies' },
    { href: '/agent/claims', label: 'Claims' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];

  const underwriterNavLinks = [
    { href: '/underwriter/dashboard', label: 'Dashboard' },
    { href: '/underwriter/risk-assessment', label: 'Risk Assessment' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];

  // Determine which nav links to show based on role
  let navLinks = publicNavLinks;
  if (isSignedIn) {
    if (isAdmin) {
      navLinks = adminNavLinks;
    } else if (isAgent) {
      navLinks = agentNavLinks;
    } else if (isUnderwriter) {
      navLinks = underwriterNavLinks;
    } else {
      navLinks = customerNavLinks; // Default for customers
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
          <img src="/lalisure1.svg" alt="Lalisure" className="h-50 w-auto" /> 
            {/* <span className="text-2xl font-bold text-stone-700">Lalisure</span> */}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-stone-700 font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isSignedIn ? (
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-gray-600 hover:text-stone-700 font-medium transition-colors duration-200">
                    Sign In
                  </button>
                </SignInButton>
                <Link
                  href="/sign-up"
                  className="bg-stone-700 hover:bg-stone-800 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Get Quote
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-stone-700 font-medium transition-colors duration-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 flex flex-col space-y-3">
                {isSignedIn ? (
                  <div className="flex justify-center py-2">
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "h-8 w-8"
                        }
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <SignInButton mode="modal">
                      <button 
                        className="text-gray-600 hover:text-stone-700 font-medium transition-colors duration-200 py-2 text-left"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign In
                      </button>
                    </SignInButton>
                    <Link
                      href="/sign-up"
                      className="bg-stone-700 hover:bg-stone-800 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Quote
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;