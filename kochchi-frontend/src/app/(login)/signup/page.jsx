'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Poppins } from 'next/font/google';
import { FaCalendarAlt } from 'react-icons/fa';
import { MdOutlineKeyboardArrowArrowDown } from 'react-icons/md';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

function SignUpPage() {
  // Step: 'signup' | 'verify' | 'success'
  const [step, setStep] = useState('signup');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [resendStatus, setResendStatus] = useState(''); // '', 'success', 'error'
  const [resendMessage, setResendMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otp, setOtp] = useState('');

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

  // Handlers
  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone_number: form.phone_number,
          password: form.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Registration failed');
      } else {
        setStep('verify');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ email: form.email, otp }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Verification failed');
      } else {
        setStep('success');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendStatus('');
    setResendMessage('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setResendStatus('error');
        setResendMessage(data.message || 'Failed to resend code');
      } else {
        setResendStatus('success');
        setResendMessage('Verification code resent! Please check your email.');
        setResendCooldown(30); // 30 seconds cooldown
      }
    } catch (err) {
      setResendStatus('error');
      setResendMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Cooldown timer effect
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Password match logic
  const passwordsMatch = form.password && form.confirmPassword && form.password === form.confirmPassword;
  const showPasswordCheck = form.confirmPassword.length > 0;

  return (
    <div className={`min-h-screen bg-gray-100 flex items-center justify-center p-4 pt-25 ${poppins.className}`}>
      <motion.div
        className="bg-white rounded-2xl shadow-lg flex max-w-6xl w-full h-full max-h-screen overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Section: Form/Verification/Success */}
        <motion.div
          className="w-full md:w-1/2 p-6 md:p-10 lg:p-12 flex flex-col justify-center overflow-y-auto max-h-screen"
          variants={containerVariants}
        >
          <motion.div className="flex justify-between items-center mb-8" variants={itemVariants}>
            <div className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
               
              </motion.div>
            </div>
          </motion.div>

          {step === 'signup' && (
            <form onSubmit={handleSignUp}>
              <motion.h1 className="text-4xl font-bold text-gray-900 mb-2" variants={itemVariants}>
                Sign Up
              </motion.h1>
              <motion.p className="text-gray-600 mb-6" variants={itemVariants}>
                Let's start with some facts about you
              </motion.p>
              <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" variants={itemVariants}>
                <div>
                  <label htmlFor="first_name" className="block text-xs font-medium text-gray-500 mb-1">FIRST NAME</label>
                  <input type="text" id="first_name" value={form.first_name} onChange={handleChange} placeholder="Talha" className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800" required />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-xs font-medium text-gray-500 mb-1">LAST NAME</label>
                  <input type="text" id="last_name" value={form.last_name} onChange={handleChange} placeholder="Aizan" className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800" required />
                </div>
              </motion.div>
              <motion.div className="mb-3" variants={itemVariants}>
                <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-1">EMAIL</label>
                <input type="email" id="email" value={form.email} onChange={handleChange} placeholder="example@mail.com" className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800" required />
              </motion.div>
              <motion.div className="mb-3" variants={itemVariants}>
                <label htmlFor="phone_number" className="block text-xs font-medium text-gray-500 mb-1">MOBILE NUMBER</label>
                <input type="tel" id="phone_number" value={form.phone_number} onChange={handleChange} placeholder="+94 77 123 4567" className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800" required />
              </motion.div>
              <motion.div className="mb-3" variants={itemVariants}>
                <label htmlFor="password" className="block text-xs font-medium text-gray-500 mb-1">PASSWORD</label>
                <input type="password" id="password" value={form.password} onChange={handleChange} placeholder="********" className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800" required />
              </motion.div>
              <motion.div className="mb-6 relative" variants={itemVariants}>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-500 mb-1">CONFIRM PASSWORD</label>
                <div className="relative">
                  <input type="password" id="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="********" className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800 pr-10" required />
                  {showPasswordCheck && (
                    passwordsMatch ? (
                      <FaCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-xl" />
                    ) : (
                      <FaExclamationCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 text-xl" />
                    )
                  )}
                </div>
              </motion.div>
              {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
              <motion.button
                type="submit"
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold mb-4 disabled:opacity-60"
                variants={itemVariants}
                whileHover={{ scale: 1.02, backgroundColor: '#333' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                disabled={loading}
              >
                {loading ? 'Signing Up...' : 'Sign Up'}
              </motion.button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerify}>
              <motion.h1 className="text-3xl font-bold text-gray-900 mb-2" variants={itemVariants}>
                Verify Your Email
              </motion.h1>
              <motion.p className="text-gray-600 mb-6" variants={itemVariants}>
                Please enter the OTP sent to your email.
              </motion.p>
              <motion.div className="mb-4" variants={itemVariants}>
                <label htmlFor="otp" className="block text-xs font-medium text-gray-500 mb-1">OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                  required
                />
              </motion.div>
              {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
              <motion.button
                type="submit"
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold mb-4 disabled:opacity-60"
                variants={itemVariants}
                whileHover={{ scale: 1.02, backgroundColor: '#333' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </motion.button>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="text-blue-600 hover:underline text-sm disabled:opacity-50 mb-2"
                >
                  {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend Verification Code'}
                </button>
                {resendStatus && (
                  <span className={
                    resendStatus === 'success'
                      ? 'text-green-600 text-xs'
                      : 'text-red-500 text-xs'
                  }>
                    {resendMessage}
                  </span>
                )}
              </div>
            </form>
          )}

          {step === 'success' && (
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-bold text-green-700 mb-4">Congratulations!</h1>
              <p className="text-gray-700 mb-6">You are successfully registered to Kochchibazaar! Redirecting to <Link href="/login" className="text-blue-600 hover:underline">login</Link>...</p>
            </motion.div>
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
            src="/assets/cards/worldwide.webp"
            alt="Tropical Leaf Background"
            layout="fill"
            objectFit="cover"
            quality={100}
            className="rounded-r-2xl"
          />
          <div className="absolute top-6 right-6 flex space-x-3"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SignUpPage;
