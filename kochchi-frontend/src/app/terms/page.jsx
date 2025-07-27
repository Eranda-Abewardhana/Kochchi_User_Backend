'use client';

import React from 'react';
import { Poppins } from 'next/font/google';
import { motion } from 'framer-motion';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

function TermsAndConditionsPage() {
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
            Terms and Conditions
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
            Please read these terms carefully before using the Kochchi Bazaar website and mobile application.
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
              Ownership and Responsibilities
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                These resources, namely the "Kochchi Bazaar website" and the "Kochchi Bazaar" mobile application, are owned, operated, and managed by Lakro International (Private) Limited. Henceforth, "website" shall refer to "both" the Website and the application. The rights of every individual are reserved. It is the responsibility of both users and advertisers to ensure that any content they submit to this Website adheres to all relevant legislation.
              </p>
              <p>
                Lakro International (Private) Limited and "The Website" do not provide any assurance or accept responsibility for the content's legality or accuracy. Users indemnify "Lakro International (Private) Limited" and "the Website" against any liabilities and obligations that may result from their failure to ensure that their content does not violate any copyright or intellectual property boundaries.
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
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-2xl font-semibold text-gray-800 dark:text-gray-700 mb-6 flex items-center"
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-100 text-blue-600 dark:text-blue-500 flex items-center justify-center mr-3 text-sm font-medium"
              >2</motion.span>
              Copyright and Usage Rights
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                Lakro International (Private) Limited and "the Website" are granted non-exclusive, perpetual, royalty-free rights by the advertisers to use and distribute the content. The entirety of the Website's content is the intellectual property of Lakro International (Private) Limited. Images featured on the "website" are protected against unauthorised use by watermarks placed by the advertisers.
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
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-2xl font-semibold text-gray-800 dark:text-gray-700 mb-6 flex items-center"
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-100 text-blue-600 dark:text-blue-500 flex items-center justify-center mr-3 text-sm font-medium"
              >3</motion.span>
              Privacy, Editorial Alterations, and Security
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                "The Website" and "Lakro International (Private) Limited" retain the prerogative to make alterations to the titles of content for editorial objectives. Images that contravene its policies or are deemed irrelevant may be denied publication. Lakro International (Private) Limited and "the Website" may cooperate with authorities where content violates legal regulations; under such circumstances, user identities may be made public. With users' explicit consent, Lakro International (Private) Limited and "the Website" gathers user and advertiser information to operate, maintain, and improve the platform.
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
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-2xl font-semibold text-gray-800 dark:text-gray-700 mb-6 flex items-center"
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-100 text-blue-600 dark:text-blue-500 flex items-center justify-center mr-3 text-sm font-medium"
              >4</motion.span>
              Advertisements in Liquor Stores and Establishments
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                Please be advised that a legitimate government license is mandatory to sell alcoholic beverages on your business property. Distribution of illicit spirits is rigorously forbidden and subject to legal repercussions. Lakro International (Private) Limited and "the Website" are not responsible for legal actions or unauthorised spirits sales. Please remove any visual representations of bottles carrying spirits from your advertisement. You may substitute images of the location of your business or something comparable. Kindly omit any images depicting spirit bottles within your advertisement. Instead, you may include pictures of your Company's location or something similar. If included, the photos of spirits bottles will be removed before the advertisement's publication.
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
              transition={{ duration: 0.6, delay: 1 }}
              className="text-2xl font-semibold text-gray-800 dark:text-gray-700 mb-6 flex items-center"
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 1.1 }}
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-100 text-blue-600 dark:text-blue-500 flex items-center justify-center mr-3 text-sm font-medium"
              >5</motion.span>
              Cookies and Email Addresses
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                Users must have cookies enabled on their devices for the Website to function effectively. Although cookies retain data, they cannot discern the identities of individual users. Users must provide authentic email addresses when placing advertisements; nevertheless, these addresses are obscured from the public.
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
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-2xl font-semibold text-gray-800 dark:text-gray-700 mb-6 flex items-center"
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 1.3 }}
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-100 text-blue-600 dark:text-blue-500 flex items-center justify-center mr-3 text-sm font-medium"
              >6</motion.span>
              External Links and Website Availability
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                Lakro International (Private) Limited and "the Website" cannot guarantee that it will remain accessible, error-free, secure, uninterrupted, or devoid of computer viruses or other malicious or invasive code consistently. Furthermore, in force majeure events, including power outages, shortages of telecommunications equipment or facilities, inability to procure or scarcity of essential materials, equipment facilities, power, or telecommunications, or information system failures, Lakro International (Private) Limited and "the Website" shall not be held liable for any resulting disruptions.
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
              transition={{ duration: 0.6, delay: 1.4 }}
              className="text-2xl font-semibold text-gray-800 dark:text-gray-700 mb-6 flex items-center"
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 1.5 }}
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-100 text-blue-600 dark:text-blue-500 flex items-center justify-center mr-3 text-sm font-medium"
              >7</motion.span>
              Paid Content, Memberships, and Disclaimer
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                Access to particular content and services offered by "the website" may require payment. Memberships involve the creation of a designated storefront, in which "the Website" or "Lakro International (Private) Limited" maintains exclusive proprietorship of the material. Lakro International (Private) Limited and "The Website" both disclaim liability for any complications arising from apparatus malfunctions, errors, the Website's unavailability, or third-party content. Advertisers and users at this moment establish that "the Website" and "Lakro International (Private) Limited" are not liable for any damages that may ensue as a consequence of modifications or indemnification requests triggered by violations of the terms and conditions. Lakrr International (Private) Limited and "The Website" retain the prerogative to amend the terms and conditions without prior notice, effective promptly following their publication. Ongoing utilisation suggests acceptance. 
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
              transition={{ duration: 0.6, delay: 1.6 }}
              className="text-2xl font-semibold text-gray-800 dark:text-gray-700 mb-6 flex items-center"
            >
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 1.7 }}
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-100 text-blue-600 dark:text-blue-500 flex items-center justify-center mr-3 text-sm font-medium"
              >8</motion.span>
              Sales Finality
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              className="space-y-4 text-gray-600 dark:text-gray-500 leading-relaxed"
            >
              <p>
                Please be advised that all sales are final. Once payment is processed and your advertisement is approved, it will be published.Advertisers are now released from liability by Lakro International (Private) Limited and "the Website" concerning the following, Notwithstanding any prior notification concerning potential indirect, exemplary, or consequential losses. Lakro International (Private) Limited and "the Website" shall not be liable for such damages.
              </p>
            </motion.div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}

export default TermsAndConditionsPage;
