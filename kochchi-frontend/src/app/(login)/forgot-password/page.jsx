'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Poppins } from 'next/font/google';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

function ForgotPasswordPage() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.08 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send OTP');
      }
      setSuccess('If this email is registered, an OTP has been sent.');
      setShowReset(true);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to reset password');
      }
      setResetSuccess('Your password has been reset successfully. You can now log in with your new password.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setResetError(err.message || 'Something went wrong');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-100 flex items-center justify-center p-4 ${poppins.className}`}>
      <motion.div
        className="bg-white rounded-2xl shadow-lg flex max-w-6xl w-full overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Section: Form */}
        <motion.div
          className="w-full md:w-1/2 p-6 md:p-10 lg:p-12 flex flex-col justify-center"
          variants={containerVariants}
        >
          <motion.div className="flex justify-between items-center mb-8" variants={itemVariants}>
            <div className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Image
                  src="/assets/logo.png"
                  alt="Kochchibazaar Logo"
                  width={40}
                  height={40}
                  priority
                />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Kochchibazaar.
              </motion.span>
            </div>
          </motion.div>

          {!showReset && (
            <form onSubmit={handleSubmit}>
              <motion.h1 className="text-4xl font-bold text-gray-900 mb-2" variants={itemVariants}>
                Forgot Password
              </motion.h1>
              <motion.p className="text-gray-600 mb-6" variants={itemVariants}>
                Enter your email address to receive an OTP for password reset.
              </motion.p>
              <motion.div className="mb-4" variants={itemVariants}>
                <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-1">EMAIL</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                  required
                />
              </motion.div>
              {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
              {success && <div className="text-green-600 mb-2 text-sm">{success}</div>}
              <motion.button
                type="submit"
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold mb-4 disabled:opacity-60"
                variants={itemVariants}
                whileHover={{ scale: 1.02, backgroundColor: '#333' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </motion.button>
              <motion.p className="text-center text-gray-600 text-sm" variants={itemVariants}>
                Remember your password?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
              </motion.p>
            </form>
          )}

          {showReset && (
            <form onSubmit={handleReset}>
              <motion.h1 className="text-3xl font-bold text-gray-900 mb-2" variants={itemVariants}>
                Reset Password
              </motion.h1>
              <motion.p className="text-gray-600 mb-6" variants={itemVariants}>
                Enter the OTP you received in your email and your new password.
              </motion.p>
              <motion.div className="mb-4" variants={itemVariants}>
                <label htmlFor="otp" className="block text-xs font-medium text-gray-500 mb-1">OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                  required
                />
              </motion.div>
              <motion.div className="mb-4" variants={itemVariants}>
                <label htmlFor="newPassword" className="block text-xs font-medium text-gray-500 mb-1">NEW PASSWORD</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                  required
                />
              </motion.div>
              {resetError && <div className="text-red-500 mb-2 text-sm">{resetError}</div>}
              {resetSuccess && <div className="text-green-600 mb-2 text-sm">{resetSuccess}</div>}
              <motion.button
                type="submit"
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold mb-4 disabled:opacity-60"
                variants={itemVariants}
                whileHover={{ scale: 1.02, backgroundColor: '#333' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                disabled={resetLoading}
              >
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </motion.button>
              <motion.p className="text-center text-gray-600 text-sm" variants={itemVariants}>
                Go back to{' '}
                <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
              </motion.p>
            </form>
          )}
        </motion.div>
        {/* Right Section: Image */}
        <motion.div
          className="hidden md:block md:w-1/2 relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
        >
          <Image
            src="/assets/cards/resturentwithliquor.jpg"
            alt="Forgot Password Background"
            layout="fill"
            objectFit="cover"
            quality={100}
            className="rounded-r-2xl"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ForgotPasswordPage;
