'use client';

import React, { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import { motion } from 'framer-motion';
import Loading from '../(components)/Loading';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

function AboutPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for demo
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loading message="Loading About Page..." />;

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
            About Us
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
            Welcome to www.kochchibazaar.lk, your one-stop destination for navigating the vibrant culinary landscape of Sri Lanka.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white dark:bg-white/80 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-200 lg:col-span-2"
          >
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-2xl font-semibold text-gray-800 dark:text-gray-700 mb-6 flex items-center"
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 1 }}
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-100 text-blue-600 dark:text-blue-500 flex items-center justify-center mr-3 text-sm font-medium"
              >1</motion.span>
              Our Vision and Platform
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                Welcome to www.kochchibazaar.lk, your one-stop destination for navigating the vibrant culinary landscape of Sri Lanka. We take pride in being the pioneers of a revolutionary concept – an app-based restaurant search engine that opens up a world of dining possibilities like never before. In a country known for its rich and diverse culinary traditions, we bring you a platform that simplifies finding the perfect dining spot, a restaurant with a selection of spirits, or a wine store to complement your dining experience. Our website is designed to cater to the dynamic needs of both patrons and business owners, making it the first of its kind in Sri Lanka. With just a few taps, users can effortlessly explore an extensive database of restaurants, each offering a unique gastronomic journey.
              </p>
              <p>
                What sets us apart is our commitment to providing a comprehensive experience, allowing users to filter their search based on various criteria, including the availability of liquor, ensuring that every dining preference is met with precision. For those establishments looking to enhance their visibility and reach a wider audience, www.kochchibazaar.lk offers an unparalleled opportunity to promote their services. Advertising on our platform has many advantages, making it an indispensable tool for business growth. One of the key benefits is the low cost associated with our advertising services, providing an affordable yet highly effective means of reaching potential customers. Our platform lies in the seamless integration of technology. In a world where convenience is paramount, we have positioned ourselves as the go-to solution for anyone seeking to discover the best dining options in Sri Lanka.
              </p>
              <p>
                Whether you're a resident or a visitor to this beautiful island, our platform ensures your culinary journey is enjoyable and hassle-free. www.kochchibazaar.lk offers a comprehensive platform encompassing restaurants and establishments serving liquor and wine stores, bars, catering companies, event management firms, reception halls, and day outing packages. This user-friendly website and mobile app streamline the process, allowing customers to access these services effortlessly with a simple touch on the app. The advantages of advertising on www.kochchibazaar.lk extend beyond cost-effectiveness. By leveraging our platform, establishments can attract a more extensive customer base, fostering growth and sustainability. The ease of use and accessibility offered by our app ensures that businesses can connect with potential patrons effortlessly, ultimately leading to increased footfall and revenue. In an era where online presence is crucial for success, our website is a powerful tool for businesses to build popularity and establish a solid digital footprint. In conclusion, www.kochchibazaar.lk stands at the forefront of Sri Lanka's culinary revolution, bridging the gap between patrons and businesses.
              </p>
              <p>
                Whether you're a food enthusiast seeking the perfect dining experience or a business owner looking to elevate your establishment, our platform offers a cutting-edge solution that combines innovation, affordability, and accessibility. Join us on this gastronomic journey and discover the endless possibilities that await you in the vibrant world of Sri Lankan cuisine. The www.kochchibazaar.lk website and the app belong to and are managed by Lakro International (Private) Limited. All rights reserved.
              </p>
            </motion.div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
