'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF, FaWhatsapp, FaInstagram, FaLinkedinIn, FaYoutube, FaTiktok, FaArrowUp } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="w-full py-6 px-4 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/assets/site-logo.webp"
                alt="Kochchibazaar Logo"
                width={100}
                height={26}
                className="object-contain"
              />
            </Link>
            <p className="text-xs text-gray-900 font-bold">
              Welcome to a groundbreaking culinary journey with our innovative Sri Lankan restaurant website. Pioneering a novel dining experience, we present a unique platform where patrons can effortlessly locate nearby establishments via a user-friendly mobile app—a pioneering initiative in Sri Lanka.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-base text-gray-900 ">Quick Links</h3>
            <div className="flex flex-col gap-1">
              <Link href="/" className="text-xs text-gray-600 hover:text-gray-900 font-bold">
                Home
              </Link>
              <Link href="/about" className="text-xs text-gray-700 hover:text-gray-900 font-bold">
                About Us
              </Link>
              <Link href="/contact" className="text-xs text-gray-700 hover:text-gray-900 font-bold">
                Contact Us
              </Link>
              <Link href="/privacy" className="text-xs text-gray-700 hover:text-gray-900 font-bold">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-gray-700 hover:text-gray-900 font-bold">
                Terms and Conditions
              </Link>
              <Link href="/profile" className="text-xs text-gray-700 hover:text-gray-900 font-bold">
                profile
              </Link>
              <Link href="/admin/login" className="text-xs text-gray-600 hover:text-gray-900 font-bold">
                admin
              </Link>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-base text-gray-900">We Accept</h3>
            <div className="flex flex-wrap gap-3">
              <Image src="/assets/american-express.webp" alt="American Express" width={35} height={22} />
              <Image src="/assets/visa.webp" alt="Visa" width={35} height={22} />
              <Image src="/assets/master.webp" alt="Master Card" width={35} height={22} />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <h3 className="font-semibold text-base text-gray-900">Download Our App</h3>
              <div className="flex gap-3">
                <Link href="#" className="hover:opacity-80">
                  <Image src="/assets/app-store.png" alt="App Store" width={55} height={24} className="object-contain" />
                </Link>
                <Link href="#" className="hover:opacity-80">
                  <Image src="/assets/play-store.png" alt="Play Store" width={60} height={24} className="object-contain" />
                </Link>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-base text-gray-900">Connect With Us</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="https://www.facebook.com/kochchibazaarofficial" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#1877F3] shadow-sm flex items-center justify-center hover:opacity-80 transition-colors">
                <FaFacebookF className="text-white text-sm" />
              </Link>
              <Link href="https://wa.me/+94713223344" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#25D366] shadow-sm flex items-center justify-center hover:opacity-80 transition-colors">
                <FaWhatsapp className="text-white text-sm" />
              </Link>
              <Link href="https://www.instagram.com/kochchibazaarofficial/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#E4405F] shadow-sm flex items-center justify-center hover:opacity-80 transition-colors">
                <FaInstagram className="text-white text-sm" />
              </Link>
              <Link href="https://www.linkedin.com/company/kochchibazaarofficial" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#0077B5] shadow-sm flex items-center justify-center hover:opacity-80 transition-colors">
                <FaLinkedinIn className="text-white text-sm" />
              </Link>
              <Link href="https://www.tiktok.com/@kochchibazaarofficial" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#000000] shadow-sm flex items-center justify-center hover:opacity-80 transition-colors">
                <FaTiktok className="text-white text-sm" />
              </Link>
              <Link href="https://www.youtube.com/@kochchibazaarofficial" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#FF0000] shadow-sm flex items-center justify-center hover:opacity-80 transition-colors">
                <FaYoutube className="text-white text-sm" />
              </Link>
            </div>
            {/* Back to Top Button */}
            <div className='mt-10 flex items-center gap-2'>
              <h3 className="font-semibold text-base text-gray-900">Back to Top</h3>
              <motion.button
                onClick={scrollToTop}
                className="w-8 h-8 rounded-full bg-gray-900 text-white shadow-sm flex items-center justify-center hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaArrowUp className="text-sm" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-center text-xs text-gray-600">
            © {new Date().getFullYear()} Kochchibazaar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 