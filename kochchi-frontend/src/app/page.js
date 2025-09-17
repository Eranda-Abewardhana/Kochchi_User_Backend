'use client';

import Image from "next/image";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";
import MainThreeCards from "./(components)/mainthreecards";
import { Poppins } from 'next/font/google';
import InfiniteCarousel from "./(components)/InfiniteCarousel";
import MainFinal3DCarousel from "./(components)/mainfinal3dcarrosal";
import SuccessNotification from "./(components)/notifications/SuccessNotification";

import Topaddcontainer from "./(components)/Topaddcontainer";
import Popup from "./(components)/popup.jsx";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const categoriesRef = useRef(null);
  const isInView = useInView(categoriesRef, {
    once: true,
    amount: 0.1,
  });

  const categories = [
    { name: "Restaurants", path: "/adds/Restaurants" , img : "/assets/cards/resturent.jpg" },
    { name: "Restaurants with Liquor", path: "/adds/Restaurantswithliquor" , img : "/assets/cards/resturentwithliquor.jpg" },
    { name: "Liquor Shops", path: "/adds/liquorshops" , img : "/assets/cards/liquorshops.jpg" },
    { name: "Catering Companies", path: "/adds/CateringCompanies" , img : "/assets/cards/catering.jpg" },
    { name: "Event Management Companies", path: "/adds/eventmangement" , img : "/assets/cards/eventmanagement.jpg" },
    { name: "Reception Halls", path: "/adds/reciptionhalls" , img : "/assets/cards/receptionhalls.jpg" },
    { name: "Restaurant Promotions", path: "/adds/retaurantpromotions" , img : "/assets/cards/promotions.jpg" },
    { name: "Day Outing Packages", path: "/adds/dayout" , img : "/assets/cards/dayout.jpg" },
    { name: "Dansal", path: "/adds/dansal" , img : "/assets/cards/dansal.jpg" },
    { name: "Srilankan Restaurants Worldwide", path: "/adds/worldwide" , img : "/assets/cards/worldwide.webp" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className={`relative min-h-screen ${poppins.className}`}>
      {/* Hero Section with Video Background */}
      <div className="relative h-screen">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute min-w-full min-h-full object-cover"
          >
            <source src="/assets/bg.mp4" type="video/mp4" />
          </video>
          {/* Overlay to make content more readable */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          {/* Logo and Search Container */}
          <div className="w-full max-w-3xl px-4 sm:px-6 md:px-8 space-y-4 sm:space-y-6 md:space-y-8 -mt-8 sm:-mt-12 md:-mt-16 lg:-mt-32">
            {/* Animated Logo */}
            <motion.div
              animate={{
                scale: isOpen ? 0.9 : 1,
                y: isOpen ? -16 : 0,
              }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="text-center"
            >
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7.9xl font-bold text-white mb-2 tracking-wider"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.span
                  animate={{ opacity: isOpen ? 0.5 : 1 }}
                  transition={{ duration: 0.5 }}
                  className=""
                >
                  Kochchi  Bazaar
                </motion.span>
              </motion.h1>
            </motion.div>
              
            {/* Search Bar with Categories */}
            <motion.div 
              className="relative w-full max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              <motion.div
                animate={{
                  scale: isOpen ? 1.05 : 1,
                }}
                transition={{ duration: 0.5 }}
                className="relative"
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full h-10 sm:h-12 md:h-14 lg:h-16 pl-4 sm:pl-6 pr-10 sm:pr-12 md:pr-16 rounded-full bg-white/10 backdrop-blur-md text-white text-sm sm:text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg border border-white/20 placeholder-white/70"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
                <motion.button
                  animate={{ 
                    rotate: isOpen ? 90 : 0,
                    scale: isOpen ? 1.1 : 1,
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-1.5 sm:p-2 md:p-3 rounded-full hover:bg-white/30 backdrop-blur-sm border border-white/20"
                >
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                    animate={{ 
                      opacity: 1, 
                      scale: isOpen ? [1, 1.2, 1] : 1,
                      rotate: isOpen ? 0 : 0,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: 0.3,
                      repeat: isOpen ? Infinity : 0,
                      repeatType: "reverse"
                    }}
                  >
                    <motion.path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </motion.svg>
                </motion.button>
              </motion.div>

              {/* Categories Dropdown with Glass Effect */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="absolute w-full mt-2 backdrop-blur-md bg-white/30 border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] overflow-hidden"
                  >
                    <motion.div 
                      className="p-2 sm:p-3 md:p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.h3
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-white/100 text-xs sm:text-sm font-medium mb-2 md:mb-3 px-2"
                      >
                        Popular Categories
                      </motion.h3>
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2"
                      >
                        {categories.map((category, index) => (
                          <Link href={category.path} key={index}>
                            <motion.button
                              variants={itemVariants}
                              className="w-full flex items-center p-1.5 sm:p-2 md:p-3 rounded-xl backdrop-blur-sm hover:bg-white/30 text-left group border border-white/10"
                              whileHover={{ 
                                scale: 1.02, 
                                backgroundColor: "rgba(255, 255, 255, 0.3)",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                              }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span className="text-white group-hover:text-white font-medium text-xs sm:text-sm md:text-base">
                                {category.name}
                              </span>
                            </motion.button>
                          </Link>
                        ))}
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
            
          {/* Animated Scroll Marker */}
          { !isOpen && (
          <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-1 sm:space-y-2 animate-bounce">
            <span className="text-white text-xs sm:text-sm font-medium">Scroll Down</span>
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 10 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 0.8,
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </motion.svg>
          </div>
          )}
        </div>
      </div>

      {/* 3D Carousel Section */}
      <motion.div 
        className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 py-12 sm:py-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Featured Advertisements
          </motion.h2>
          <motion.p 
            className="text-gray-600 text-center mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Discover the best restaurants, services, and experiences in Kochchi
          </motion.p>
          <MainFinal3DCarousel />
        </div>
      </motion.div>

      {/* Category Cards Section */}
      <motion.div 
        ref={categoriesRef}
        className="w-full bg-white"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.h2 
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Browse Categories
          </motion.h2>
          <InfiniteCarousel categories={categories} />
        </div>
      </motion.div>
      {/* Top Ads Section */}
      <Topaddcontainer />
      <MainThreeCards/>
      {/* <SuccessNotification/> */}
      <Popup />
    </div>
  );
}
