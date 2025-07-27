'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./(components)/Header";
import Footer from "./(components)/Footer";
import Popup from "./(components)/popup";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { AuthProvider } from "./(components)/AuthContext";
//import SuccessNotification from "./components/notifications/SuccessNotification";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login/login' || pathname === '/admin/login';
  const isSignupPage = pathname === '/login/signup';
  const hideHeaderAndFooter = isLoginPage || isSignupPage;

  useEffect(() => {
    const REFRESH_KEY = 'site_last_refresh';
    const REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in ms
    const CHECK_INTERVAL = 60 * 1000; // 1 minute

    function clearAllStorageAndReload() {
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      // Clear all cookies
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      });
      // Set new refresh timestamp
      localStorage.setItem(REFRESH_KEY, Date.now().toString());
      // Reload the page
      window.location.reload();
    }

    function checkAndRefresh() {
      const lastRefresh = parseInt(localStorage.getItem(REFRESH_KEY), 10);
      const now = Date.now();
      if (isNaN(lastRefresh) || now - lastRefresh > REFRESH_INTERVAL) {
        clearAllStorageAndReload();
      }
    }

    checkAndRefresh();
    const interval = setInterval(checkAndRefresh, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          {!hideHeaderAndFooter && <Header />}
          {!hideHeaderAndFooter }
          <main className="flex-grow">
          {children}
          </main>
          {!hideHeaderAndFooter && <Footer />}
          <Popup />
        </AuthProvider>
      </body>
    </html>
  );
}
