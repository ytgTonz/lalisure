import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  // const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/">
              <img 
                src="/lalisure-footer.svg" 
                alt="Lalisure" 
                className="h-12 w-auto filter invert brightness-0 contrast-100 mb-2" 
              />
            </Link>
            <p className="text-gray-400 text-sm">
              Modern, accessible home insurance for every South African.  
              Protecting your home and securing your future.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/customer/claims" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Claims
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/support/help-center" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/support/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/support/terms-of-service" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/support/security-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Security Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-stone-400" />
                <span className="text-gray-400 text-sm">+27 78 840 4160</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-stone-400" />
                <span className="text-gray-400 text-sm">info@lalisure.co.za</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-stone-400 mt-1" />
                <span className="text-gray-400 text-sm">
                  804 Main Road<br />
                  Gonubie, East London 5125<br />
                  South Africa
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Mindspyr. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/support/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
              Privacy
            </Link>
            <Link href="/support/terms-of-service" className="text-gray-400 hover:text-white transition-colors text-sm">
              Terms
            </Link>
            <Link href="/support/security-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;