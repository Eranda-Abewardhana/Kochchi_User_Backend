'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';
import { Poppins } from 'next/font/google';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const Header = ({ fixedBg = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [hasNotifications, setHasNotifications] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isLoggedIn, logout } = useAuth();

  useEffect(() => {
    if (fixedBg) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(timeString);
    };

    window.addEventListener('scroll', handleScroll);
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, [fixedBg]);

  // Handler for Add Post button
  const handleAddPostClick = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token') || localStorage.getItem('user_token') || localStorage.getItem('admin_token');
    if (!token) {
      setShowAuthModal(true);
    } else {
      router.push('/addpost');
    }
  };

  const menuItems = [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Competition', href: '/competition' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.5
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${poppins.className} ${
        fixedBg 
          ? 'bg-black-100 backdrop-blur-md shadow-sm' 
          : isScrolled 
          ? 'bg-gray-800/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm' 
          : 'bg-gray-900/95 dark:bg-black/95'
      }`}>
      <nav className="w-full h-16 md:h-20">
        <div className="flex items-center justify-between h-full px-3 md:px-4">
          <div className="pl-[10px] md:pl-[40px] flex items-center h-full">
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/site-logo.webp"
                alt="Logo"
                width={70}
                height={10}
                priority
                className="object-contain md:mt-2 drop-shadow-sm"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 pr-[40px] h-full">
            <button
              onClick={handleAddPostClick}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden cursor-pointer ${
                fixedBg || isScrolled 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <span className="relative z-10">Post an Ad</span>
              <motion.div
                className="absolute inset-0 bg-blue-400"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0, 0.5, 0],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </button>
            <Link href="/profile" className="flex items-center">
              <div className="relative transition-transform hover:scale-105 active:scale-95">
                <FaUserCircle 
                  className={`text-xl md:text-2xl ${
                    fixedBg || isScrolled 
                      ? 'text-gray-100' 
                      : 'text-white'
                  }`}
                />
              </div>
            </Link>
            <Link href="/notifications" className="flex items-center">
              <div className="relative transition-transform hover:scale-105 active:scale-95">
                <FaBell 
                  className={`text-xl ${
                    fixedBg || isScrolled 
                      ? 'text-gray-100' 
                      : 'text-white'
                  }`}
                />
                {hasNotifications && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Image
                src="/assets/slflag.png"
                alt="Sri Lanka Flag"
                width={50}
                height={24}
                className="rounded-sm"
              />
              <span className="text-sm font-medium text-white">{currentTime}</span>
            </div>
            <div className="h-6 w-px bg-gray-500"></div>
            {!isLoggedIn && (
              <>
                <Link href="/login" className="flex items-center h-full">
                  <button className="px-6 py-2 rounded-full text-sm font-medium text-white hover:bg-white/20 transition-all duration-300 cursor-pointer">
                    Log in
                  </button>
                </Link>
                <Link href="/signup" className="flex items-center h-full">
                  <button className="px-6 py-2 rounded-full text-sm font-medium bg-white text-gray-900 hover:bg-gray-200 transition-all duration-300 cursor-pointer">
                    Sign up
                  </button>
                </Link>
              </>
            )}
            {isLoggedIn && (
              <button
                onClick={logout}
                className="px-6 py-2 rounded-full text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
              >
                Logout
              </button>
            )}
            <button
              onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
              className="p-2 rounded-lg text-white"
            >
              {isDesktopMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3 pr-3">
            <button
              onClick={handleAddPostClick}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 relative overflow-hidden cursor-pointer"
            >
              <span className="relative z-10">Post Add</span>
              <motion.div
                className="absolute inset-0 bg-blue-400"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0, 0.5, 0],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </button>
            <Link href="/profile" className="flex items-center">
              <div className="relative transition-transform hover:scale-105 active:scale-95">
                <FaUserCircle 
                  className={`text-xl md:text-2xl ${
                    fixedBg || isScrolled 
                      ? 'text-gray-100' 
                      : 'text-white'
                  }`}
                />
              </div>
            </Link>
            <Link href="/notifications" className="flex items-center">
              <div className="relative transition-transform hover:scale-105 active:scale-95">
                <FaBell 
                  className={`text-lg md:text-xl ${
                    fixedBg || isScrolled 
                      ? 'text-gray-100' 
                      : 'text-white'
                  }`}
                />
                {hasNotifications && (
                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full animate-ping" />
                )}
              </div>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 md:p-2 rounded-lg text-white"
            >
              {isMobileMenuOpen ? <HiX className="w-5 h-5 md:w-6 md:h-6" /> : <HiMenu className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Menu Dropdown */}
        {isDesktopMenuOpen && (
          <div className="hidden md:block absolute right-[40px] top-20 w-64 bg-gray-900/90 backdrop-blur-lg shadow-lg">
            <div className="py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => setIsDesktopMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-900/90 backdrop-blur-lg shadow-lg border-t border-white/20">
            <div className="px-3 py-3 space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-white/20">
                <Image
                  src="/assets/slflag.png"
                  alt="Sri Lanka Flag"
                  width={32}
                  height={16}
                  className="rounded-sm"
                />
                <span className="text-sm font-medium text-white">{currentTime}</span>
              </div>
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block w-full text-center py-2 rounded-lg text-white hover:bg-gray-700 transition-colors duration-200 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!isLoggedIn && (
                <>
                  <Link 
                    href="/login"
                    className="block w-full text-center py-2 rounded-lg text-white hover:bg-gray-700 transition-colors duration-200 text-sm cursor-pointer"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/signup"
                    className="block w-full text-center py-2 rounded-lg bg-white text-gray-900 hover:bg-gray-200 transition-colors duration-200 text-sm cursor-pointer"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}
              {isLoggedIn && (
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="block w-full text-center py-2 rounded-lg text-white hover:bg-gray-700 transition-colors duration-200 text-sm"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-fadeIn">
            <svg className="w-16 h-16 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Login Required</h2>
            <p className="text-gray-600 mb-6 text-center">You must be logged in to post an ad. Please log in or register to continue.</p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => { setShowAuthModal(false); router.push('/login'); }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition"
              >
                Login
              </button>
              <button
                onClick={() => { setShowAuthModal(false); router.push('/signup'); }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-xl transition"
              >
                Register
              </button>
            </div>
            <button
              onClick={() => setShowAuthModal(false)}
              className="mt-6 text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </motion.header>
  );
};

export default Header;
