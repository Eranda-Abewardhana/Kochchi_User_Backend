'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Poppins } from 'next/font/google';
import { FaWhatsapp, FaMapMarkerAlt, FaEnvelope, FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin, FaCheckCircle } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

function ContactPage() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.1 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-gray-100 mt-10 md:mt-10 ${poppins.className}`} style={{ minHeight: '100dvh' }}>
      <motion.div
        className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row max-w-7xl w-full overflow-hidden flex-1 md:h-[80vh] h-full md:max-h-[800px]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ minHeight: '400px' }}
      >
        {/* Left Section: Image */}
        <motion.div
          className="hidden md:block md:w-1/2 relative h-64 md:h-auto"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
        >
          <Image
            src="/assets/cards/catering.jpg"
            alt="Contact Us"
            layout="fill"
            objectFit="cover"
            quality={100}
            className="rounded-l-2xl"
          />
        </motion.div>
        {/* Right Section: Contact Info + Social + Newsletter */}
        <motion.div
          className="w-full md:w-1/2 p-6 md:p-10 lg:p-12 flex flex-col justify-center overflow-y-auto max-h-[80vh]"
          variants={containerVariants}
        >
          
          <motion.h1 className="text-4xl font-bold text-gray-900 mb-4 text-center" variants={itemVariants}>
            Contact Us
          </motion.h1>
          <motion.p className="text-gray-600 mb-8 text-center" variants={itemVariants}>
            Reach out to us using any of the methods below.
          </motion.p>
          <motion.div className="space-y-6" variants={itemVariants}>
            {/* WhatsApp Numbers Centered */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3 justify-center">
                <FaWhatsapp className="text-green-500 text-lg" />
                <a
                  href="https://wa.me/94713223344"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline font-medium"
                >
                  00 94 713 22 33 44
                </a>
                <Image src="/assets/slflag.png" alt="Sri Lanka Flag" width={30} height={16} className="inline ml-1 rounded-sm border" />
                <span className="text-xs text-gray-500 italic ml-2">(WhatsApp msg only)</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <FaWhatsapp className="text-green-500 text-lg" />
                <a
                  href="https://wa.me/447913141166"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline font-medium"
                >
                  00 44 79 1314 1166
                </a>
                <Image src="https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg" alt="UK Flag" width={30} height={16} className="inline ml-1 rounded-sm border" />
                <span className="text-xs text-gray-500 italic ml-2">(WhatsApp msg only)</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-red-500 text-xl" />
              <span className="font-semibold text-gray-700">Our Location:</span>
              <span className="text-gray-600">
                Lakro International (Private) Limited, Batuwatta Road, Ganemulla, Sri Lanka
              </span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <FaEnvelope className="text-blue-500 text-xl" />
              <span className="font-semibold text-gray-700">Email Us:</span>
              <a
                href="mailto:kochchibazaar@gmail.com"
                className="text-blue-700 hover:underline font-medium"
              >
                kochchibazaar@gmail.com
              </a>
            </div>
            {/* Social Media Row */}
            <div className="flex flex-col items-center w-full gap-2 mt-6">
              <span className="font-semibold text-gray-700 mb-1 text-center w-full">Follow us on:</span>
              <div className="flex gap-3 justify-center w-full">
                <a href="https://www.facebook.com/kochchibazaarofficial" target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors" title="Facebook">
                  <FaFacebook size={22} />
                </a>
                <a href="https://www.instagram.com/kochchibazaarofficial/" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-tr from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white p-2 rounded-full transition-colors" title="Instagram">
                  <FaInstagram size={22} />
                </a>
                <a href="https://www.youtube.com/@kochchibazaarofficial" target="_blank" rel="noopener noreferrer" className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors" title="YouTube">
                  <FaYoutube size={22} />
                </a>
                <a href="https://www.linkedin.com/company/kochchibazaarofficial" target="_blank" rel="noopener noreferrer" className="bg-blue-800 hover:bg-blue-900 text-white p-2 rounded-full transition-colors" title="LinkedIn">
                  <FaLinkedin size={22} />
                </a>
                <a href="https://www.tiktok.com/@kochchibazaarofficial" target="_blank" rel="noopener noreferrer" className="bg-black hover:bg-gray-800 text-white p-2 rounded-full transition-colors" title="TikTok">
                  <SiTiktok size={22} />
                </a>
                <a href="https://wa.me/+94713223344" target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors" title="WhatsApp">
                  <FaWhatsapp size={22} />
                </a>
              </div>
            </div>
            {/* Newsletter Signup (integrated) */}
            
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ContactPage;
