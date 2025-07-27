import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

function AdPostingNotification({ message = 'Your ad has been posted successfully! It will be reviewed and published soon.' }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setShow(false), 4000);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="fixed bottom-4 right-4 z-50 w-[95vw] max-w-sm sm:max-w-md md:max-w-lg p-4 rounded-2xl shadow-2xl border border-green-200 backdrop-blur-md bg-white/60 bg-gradient-to-br from-white/80 via-white/50 to-green-50/40 flex items-center space-x-4 font-poppins"
          style={{
            boxShadow: '0 8px 32px 0 rgba(0,128,0,0.10)',
            border: '1.5px solid rgba(34,197,94,0.18)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <FaCheckCircle className="text-green-500 text-3xl mr-2" />
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-green-800 mb-1">Ad Posted Successfully!</p>
            <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="ml-2 bg-red-500 hover:bg-red-600 text-white transition p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-300"
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

export default AdPostingNotification; 