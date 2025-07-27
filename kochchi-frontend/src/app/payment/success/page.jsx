'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Poppins } from 'next/font/google';
import { FaCheckCircle, FaUser } from 'react-icons/fa';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

function PaymentSuccessPage() {
  const router = useRouter();

  const handleGoProfile = () => {
    router.push('/profile');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center ${poppins.className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <FaCheckCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h1>
        <p className="text-lg text-gray-700 mb-6"> Your  add will be approved soon by admin. Stay tuned!</p>
        <button
          onClick={handleGoProfile}
          className="flex items-center justify-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors mx-auto"
        >
          <FaUser className="w-5 h-5" />
          Go to Profile
        </button>
      </motion.div>
    </div>
  );
}

export default PaymentSuccessPage; 