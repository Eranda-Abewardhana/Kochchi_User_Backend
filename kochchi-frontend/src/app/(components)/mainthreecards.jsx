'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaPlayCircle } from 'react-icons/fa';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const MainThreeCards = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  const cards = [
    {
      id: 1,
      tag: 'Advertising',
      title: 'Innovate your industry',
      description: "Don't just scroll—discover! Visit our YouTube channel for content that informs, inspires, and entertains!",
      buttons: [
        { text: 'VISIT YOUTUBE', link: 'https://www.youtube.com/watch?v=DMblHAJMN7o', isPrimary: true },
        { text: 'CONTACT US', link: '/contact', isPrimary: false }
      ],
      bgColor: 'bg-gray-800/70',
      textColor: 'text-white',
      tagBg: 'bg-yellow-400',
      tagText: 'text-gray-900',
      image: '/assets/bg.mp4', // Using video as background
      isYouTube: true
    },
    {
      id: 2,
      tag: 'Competition',
      title: 'Together, we build',
      description: "Competitions bring joy and rewards. Participate in Kochchi Bazaar competitions and anticipate many more rewards ahead.",
      buttons: [
        { text: 'Enroll Competitions', link: '/competition', isPrimary: true }
      ],
      bgColor: 'bg-teal-700/70',
      textColor: 'text-white',
      tagBg: 'bg-teal-400',
      tagText: 'text-gray-900',
      image: '/assets/challange.jpg',
      isYouTube: false
    },
    {
      id: 3,
      tag: 'Blog',
      title: 'visit our blog ',
      description: "Discover new ideas, stay updated, and grow your knowledge—reading blogs turns everyday moments into learning opportunities!",
      buttons: [
        { text: 'Visit Blogs', link: '/blog', isPrimary: true }
      ],
      bgColor: 'bg-orange-700/50',
      textColor: 'text-white',
      tagBg: 'bg-orange-400',
      tagText: 'text-gray-900',
      image: '/assets/cards/liquorshops.jpg',
      isYouTube: false
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    hover: { scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" },
    tap: { scale: 0.98 }
  };

  return (
    <div ref={containerRef} className={`w-full py-8 sm:py-12 md:py-16 bg-gray-50 dark:bg-gray-950 ${poppins.className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              className={`relative flex flex-col justify-end p-4 sm:p-5 md:p-6 w-full h-[280px] sm:h-[320px] md:h-[350px] lg:h-[380px] rounded-2xl overflow-hidden shadow-xl backdrop-blur-lg border border-white/20 dark:border-gray-700/20 ${card.bgColor}`}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              whileHover="hover"
              whileTap="tap"
            >
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                {card.image && !card.isYouTube && (
                  <Image
                    src={card.image}
                    alt={card.title}
                    layout="fill"
                    objectFit="cover"
                    className="opacity-30"
                  />
                )}
                {card.isYouTube && card.image && (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute min-w-full min-h-full object-cover opacity-30"
                  >
                    <source src={card.image} type="video/mp4" />
                  </video>
                )}
              </div>
              
              <span className={`absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold uppercase z-20 ${card.tagBg} ${card.tagText}`}>
                {card.tag}
              </span>

              <div className="relative z-10 mt-auto">
                <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 ${card.textColor}`}>
                  {card.title}
                </h2>
                <p className={`text-sm sm:text-base md:text-lg mb-3 sm:mb-4 md:mb-6 line-clamp-2 sm:line-clamp-3 ${card.textColor} opacity-90`}>
                  {card.description}
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {card.buttons.map((button, index) => (
                    <Link href={button.link} passHref key={index}>
                      <motion.button
                        className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all duration-300 ${
                          button.isPrimary && card.isYouTube
                            ? 'bg-red-600 text-white hover:bg-red-700 border border-transparent'
                            : button.isPrimary
                            ? `${card.textColor} border border-current hover:bg-white/20 hover:border-white/30`
                            : `border border-current ${card.textColor} hover:bg-white/20 hover:border-white/30`
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="flex items-center gap-2">
                          {button.text}
                          {card.isYouTube && button.isPrimary && (
                            <motion.span
                              className="text-base sm:text-lg md:text-xl"
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1, repeat: Infinity, repeatType: 'loop' }}
                            >
                              <FaPlayCircle />
                            </motion.span>
                          )}
                        </span>
                      </motion.button>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainThreeCards; 



