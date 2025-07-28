import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-50 dark:to-gray-100">
      {/* Main Loading Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Animated Logo/Icon */}
        <motion.div 
          className="relative mb-8"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {/* Plate with Food Animation */}
          <div className="relative w-24 h-24 mx-auto">
            {/* Plate */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(59, 130, 246, 0.4)",
                  "0 0 0 20px rgba(59, 130, 246, 0)",
                  "0 0 0 0 rgba(59, 130, 246, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Food Items */}
            <motion.div 
              className="absolute inset-2 bg-white rounded-full flex items-center justify-center"
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              {/* Food Icons */}
              <div className="relative w-16 h-16">
                {/* Utensils */}
                <motion.div 
                  className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-blue-600 rounded"
                  animate={{ 
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="absolute top-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-blue-600 rounded"
                  animate={{ 
                    rotate: [0, -15, 15, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                />
                
                {/* Food Dots */}
                <motion.div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-green-500 rounded-full"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ 
                    duration: 1.2, 
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3
                  }}
                />
                <motion.div 
                  className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-red-500 rounded-full"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ 
                    duration: 1.2, 
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.6
                  }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          <motion.h2 
            className="text-2xl font-bold text-gray-800 dark:text-gray-700"
            animate={{ 
              opacity: [1, 0.7, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Kochchi Bazaar
          </motion.h2>
          
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-500 font-medium"
            animate={{ 
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            {message}
          </motion.p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          className="mt-8 w-64 h-2 bg-gray-200 dark:bg-gray-300 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 2, 
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </motion.div>

        {/* Floating Food Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-blue-400 opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            >
              {i % 3 === 0 ? "🍽️" : i % 3 === 1 ? "🍴" : "🥘"}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Loading; 