import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message }) => (
  <AnimatePresence>
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-red-500 to-red-700 text-white px-8 py-4 rounded-xl shadow-2xl text-lg font-semibold border-2 border-red-300"
      style={{ minWidth: 280, textAlign: 'center' }}
    >
      {message}
    </motion.div>
  </AnimatePresence>
);

export default Toast; 