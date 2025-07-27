import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

function SuccessNotification() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const STORAGE_KEY = 'successNotificationData';
    const now = Date.now();
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    let shouldShow = false;

    if (!data || !data.firstShownAt || !data.count) {
      // No record, initialize
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ count: 1, firstShownAt: now })
      );
      shouldShow = true;
    } else {
      const { count, firstShownAt } = data;
      const hours24 = 24 * 60 * 60 * 1000;
      if (now - firstShownAt > hours24) {
        // More than 24 hours passed, reset
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ count: 1, firstShownAt: now })
        );
        shouldShow = true;
      } else if (count < 2) {
        // Within 24 hours and less than 2 times
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ count: count + 1, firstShownAt })
        );
        shouldShow = true;
      }
    }
    setShow(shouldShow);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="fixed bottom-4 right-4 z-50 w-[95vw] max-w-sm sm:max-w-md md:max-w-lg p-4 rounded-2xl shadow-2xl border border-gray-200 backdrop-blur-md bg-white/40 bg-gradient-to-br from-white/60 via-white/30 to-gray-100/30 flex items-center space-x-4 font-poppins"
          style={{
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.12)',
            border: '1.5px solid rgba(180,180,180,0.18)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-700 mt-1 leading-relaxed">
              <p className='text-xl text-gray-900 mb-2'>Great News !!!</p>
              <p>
                You can now enjoy our services on the go —<br />
                download and use our mobile apps today! 📱🚀
              </p>
            </div>
            <div className="flex gap-3 mt-3">
              <motion.a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08, rotate: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block"
              >
                <Image
                  src="/assets/play-store.png"
                  alt="Get it on Google Play"
                  width={120}
                  height={40}
                  className="h-10 w-auto rounded-lg shadow-md border border-gray-200 bg-white/70"
                />
              </motion.a>
              <motion.a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08, rotate: 2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block"
              >
                <Image
                  src="/assets/app-store.png"
                  alt="Download on the App Store"
                  width={120}
                  height={40}
                  className="h-10 w-auto rounded-lg shadow-md border border-gray-200 bg-white/70"
                />
              </motion.a>
            </div>
          </div>
          <button
            onClick={() => setShow(false)}
            className="ml-2 -mt-28 bg-red-500 hover:bg-red-600 text-white transition p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SuccessNotification;
