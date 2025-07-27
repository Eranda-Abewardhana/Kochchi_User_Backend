'use client';

import React from 'react';
import { Poppins } from 'next/font/google';
import { motion } from 'framer-motion';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

function PrivacyPolicyPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-50 dark:to-gray-100 py-20 ${poppins.className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl mt-5 md:text-5xl font-bold text-gray-800 dark:text-gray-700 mb-6">
            Privacy Policy
          </h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "6rem" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1 bg-blue-500 mx-auto rounded-full"
          ></motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-gray-600 dark:text-gray-500 mt-8 max-w-2xl mx-auto"
          >
            We are deeply committed to protecting your privacy and the confidentiality of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services. We respect your privacy and are dedicated to being transparent about how we handle your data.
          </motion.p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <motion.section
            variants={itemVariants}
            className="bg-white dark:bg-white/80 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-200"
          >
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl font-semibold text-gray-800 dark:text-gray-700 mb-6 flex items-center"
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-100 text-blue-600 dark:text-blue-500 flex items-center justify-center mr-3 text-sm font-medium"
              >1</motion.span>
              Information We Collect
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                We may collect personal information that you voluntarily provide to us, such as your name, email address, phone number, and payment information when you register on our site, place an order, subscribe to our newsletter, or engage in other activities on our site. Additionally, we may collect non-personal information such as your IP address, browser type, and operating system through automated means like cookies and web beacons to improve your browsing experience and analyze site traffic.
              </p>
            </motion.div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="bg-white dark:bg-white/80 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-200"
          >
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl font-semibold text-gray-800 dark:text-gray-700 mb-6 flex items-center"
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-100 text-blue-600 dark:text-blue-500 flex items-center justify-center mr-3 text-sm font-medium"
              >2</motion.span>
              How We Use Your Information
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                The information we collect is used to personalize your experience, process transactions, manage your account, and provide you with customer support. We may also use your information to send you promotional materials, updates, and other communications related to our products and services, unless you have opted out of receiving such communications. We do not sell, rent, or lease your personal information to third parties. However, we may share your data with trusted third-party service providers who assist us in operating our website, conducting our business, or servicing you, as long as those parties agree to keep this information confidential.
              </p>
            </motion.div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="bg-white dark:bg-white/80 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-200"
          >
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl font-semibold text-gray-800 dark:text-gray-700 mb-6 flex items-center"
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-100 text-blue-600 dark:text-blue-500 flex items-center justify-center mr-3 text-sm font-medium"
              >3</motion.span>
              Data Security
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                We implement a variety of security measures to maintain the safety of your personal information. Your data is stored in secure networks and is only accessible by a limited number of persons who have special access rights to such systems and are required to keep the information confidential. Despite these measures, please be aware that no data transmission over the Internet can be guaranteed to be completely secure. As a result, while we strive to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </motion.div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="bg-white dark:bg-white/80 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-200"
          >
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl font-semibold text-gray-800 dark:text-gray-700 mb-6 flex items-center"
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-100 text-blue-600 dark:text-blue-500 flex items-center justify-center mr-3 text-sm font-medium"
              >4</motion.span>
              Cookies and Tracking Technologies
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                We use cookies and similar tracking technologies to enhance your experience on our site. Cookies are small files that a site or its service provider transfers to your computer's hard drive through your web browser that enables the site's systems to recognize your browser and capture and remember certain information. You can choose to disable cookies through your browser settings, but doing so may limit your access to certain features of our site.
              </p>
            </motion.div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="bg-white dark:bg-white/80 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-200"
          >
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl font-semibold text-gray-800 dark:text-gray-700 mb-6 flex items-center"
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-100 text-blue-600 dark:text-blue-500 flex items-center justify-center mr-3 text-sm font-medium"
              >5</motion.span>
              Third-Party Links
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                Our website may contain links to third-party websites, products, or services. Please be aware that we are not responsible for the privacy practices of these third-party sites. We encourage you to read the privacy policies of any third-party site you visit, as their practices may differ from ours.
              </p>
            </motion.div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="bg-white dark:bg-white/80 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-200"
          >
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl font-semibold text-gray-800 dark:text-gray-700 mb-6 flex items-center"
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-100 text-blue-600 dark:text-blue-500 flex items-center justify-center mr-3 text-sm font-medium"
              >6</motion.span>
              Your Rights and Choices
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                You have the right to access, correct, or delete your personal information that we hold. You can also object to the processing of your data or request that we restrict its processing in certain circumstances. To exercise these rights, please contact us at [Your Contact Information]. We will respond to your request in accordance with applicable data protection laws.
              </p>
            </motion.div>
          </motion.section>
          
          <motion.section
            variants={itemVariants}
            className="bg-white dark:bg-white/80 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-200 lg:col-span-2"
          >
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl font-semibold text-gray-800 dark:text-gray-700 mb-6 flex items-center"
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-100 text-blue-600 dark:text-blue-500 flex items-center justify-center mr-3 text-sm font-medium"
              >7</motion.span>
              Changes to This Privacy Policy
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically to stay informed about how we are protecting your information. Your continued use of our website after any changes to this policy constitutes your acceptance of such changes.
              </p>
            </motion.div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
