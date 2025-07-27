'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Poppins } from 'next/font/google';
import { FaTimesCircle, FaHome, FaArrowLeft, FaCreditCard } from 'react-icons/fa';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

function PaymentCancelledPage() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleTryAgain = () => {
    router.push('/addpost');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-red-50 to-pink-100 ${poppins.className}`}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Error Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FaTimesCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
            <p className="text-xl text-gray-600">Your payment was not completed</p>
          </motion.div>

          {/* Main Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Don't worry!</h2>
              <p className="text-gray-600 mb-6">
                Your ad information has been saved. You can complete the payment anytime to activate your listing.
              </p>
            </div>

            {/* Information Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">What you can do:</h3>
              <ul className="space-y-2 text-blue-800 text-left">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Try the payment again with a different method</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Check your payment method and try again</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Contact support if you need assistance</span>
                </li>
              </ul>
            </div>

            {/* Support Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-gray-600 text-sm">
                Need help? Contact our support team at{' '}
                <a href="mailto:support@kochchibazaar.lk" className="text-blue-600 hover:underline font-semibold">
                  support@kochchibazaar.lk
                </a>
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center gap-3 bg-gray-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            
            <button
              onClick={handleTryAgain}
              className="flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <FaCreditCard className="w-5 h-5" />
              Try Again
            </button>
            
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              <FaHome className="w-5 h-5" />
              Go Home
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default PaymentCancelledPage; 