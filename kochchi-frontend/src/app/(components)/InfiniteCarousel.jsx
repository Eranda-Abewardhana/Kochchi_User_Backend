import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function InfiniteCarousel({ categories }) {
  return (
    <motion.div 
      className="relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <motion.div 
        className="scroll-container auto-scroll flex"
        initial={{ x: 0 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* First set of cards */}
        {categories.map((category, index) => (
          <Link href={category.path} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className="flex-none w-48 sm:w-56 rounded-xl overflow-hidden shadow-[0_4px_16px_0_rgba(255,255,255,0.3)] bg-gradient-to-br from-white/90 to-gray-100/90 backdrop-blur-md border border-white/50 mx-2 sm:mx-3 group"
            >
              <motion.div 
                className="relative h-32 sm:h-40"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={category.img}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110 brightness-105"
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </motion.div>
              <motion.div 
                className="p-3 sm:p-4 relative bg-gradient-to-b from-white/90 to-gray-100/90 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.h3 
                  className="text-gray-800 font-medium text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {category.name}
                </motion.h3>
                <motion.div 
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.div>
          </Link>
        ))}
        {/* Duplicate set for seamless loop */}
        {categories.map((category, index) => (
          <Link href={category.path} key={`dup-${index}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + categories.length) }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className="flex-none w-48 sm:w-56 rounded-xl overflow-hidden shadow-[0_4px_16px_0_rgba(255,255,255,0.3)] bg-gradient-to-br from-white/90 to-gray-100/90 backdrop-blur-md border border-white/50 mx-2 sm:mx-3 group"
            >
              <motion.div 
                className="relative h-32 sm:h-40"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={category.img}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110 brightness-105"
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </motion.div>
              <motion.div 
                className="p-3 sm:p-4 relative bg-gradient-to-b from-white/90 to-gray-100/90 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.h3 
                  className="text-gray-800 font-medium text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {category.name}
                </motion.h3>
                <motion.div 
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
      {/* Gradient Overlays for Scroll Effect */}
      <motion.div 
        className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-white to-transparent pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      />
      <motion.div 
        className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-white to-transparent pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      />
    </motion.div>
  );
} 