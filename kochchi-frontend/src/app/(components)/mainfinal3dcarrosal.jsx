// Complete working version of the 3D Ad Carousel with Details Modal and Pagination
// MainFinal3DCarousel.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Play, Pause, RotateCcw, ArrowRight
} from 'lucide-react';
import AdvertisementCard from './AdvertisementCard';

const AdCard = ({ ad, index, activeIndex, onClick, onViewDetails }) => {
  const offset = index - activeIndex;
  const isActive = offset === 0;
  const isVisible = Math.abs(offset) <= 3;

  const getTransform = () => {
    const transforms = {
      0: { x: 0, scale: 1, z: 0, rotateY: 0 },
      1: { x: 280, scale: 0.8, z: -50, rotateY: -15 },
      '-1': { x: -280, scale: 0.8, z: -50, rotateY: 15 },
      2: { x: 420, scale: 0.6, z: -100, rotateY: -25 },
      '-2': { x: -420, scale: 0.6, z: -100, rotateY: 25 },
      3: { x: 500, scale: 0.4, z: -150, rotateY: -30 },
      '-3': { x: -500, scale: 0.4, z: -150, rotateY: 30 },
    };
    return transforms[offset] || { x: offset * 600, scale: 0.3, z: -200, rotateY: offset * 30 };
  };

  const transform = getTransform();

  // Helper to determine open/close status
  const getOpenStatus = () => {
    // Get current time and day
    const now = new Date();
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = days[now.getDay()];
    const scheduleKey = `schedule_${today}`;
    const schedule = ad[scheduleKey];
    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) return null;
    // Check if any time range for today is open
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    for (const range of schedule) {
      const [open, close] = range.split('-');
      if (!open || !close) continue;
      const [openH, openM] = open.split(':').map(Number);
      const [closeH, closeM] = close.split(':').map(Number);
      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;
      if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
        return 'open';
      }
    }
    return 'closed';
  };
  const openStatus = getOpenStatus();

  if (!isVisible) return null;

  return (
    <motion.div
      className={`absolute cursor-pointer ${isActive ? 'w-96 h-[420px]' : 'w-72 h-96'}`}
      style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
      animate={{
        x: transform.x,
        scale: transform.scale,
        z: transform.z,
        rotateY: transform.rotateY,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      onClick={() => onClick(index)}
    >
      <div className={`relative w-full h-full rounded-2xl overflow-hidden ${isActive ? 'bg-white shadow-xl' : 'bg-gray-50 shadow-md'} border border-gray-200`}>
        {/* Full-size background image */}
        <div className="absolute inset-0">
          <img 
            src={ad.image_url || ad.images?.[0] || '/assets/defaulthotelimage.jpg'} 
            alt={ad.title || ad.shopName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/assets/defaulthotelimage.jpg';
            }}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
          {/* White fade overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
          {/* Main content area */}
          <div className="text-center flex-1 flex items-center justify-center">
            <div>
              <h2 className="text-white font-bold text-2xl mb-3 drop-shadow-lg">{ad.title || ad.shopName}</h2>
              <p className="text-white/90 text-sm line-clamp-3 drop-shadow-md">
                {ad.business_description || 'Discover amazing experiences'}
              </p>
              {/* Location info for active card - moved up and highlighted */}
              {isActive && ad.location_city && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 mt-4 mb-2 px-4 py-2 rounded-full bg-white/80 shadow-lg border-2 border-blue-500 text-blue-900 font-semibold text-base backdrop-blur-sm"
                  style={{ fontWeight: 600 }}
                >
                  <span role="img" aria-label="location">📍</span> {ad.location_city}, {ad.location_district}
                </motion.div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <motion.button
              className="bg-blue-600 text-white font-semibold rounded-full px-8 py-3 text-base hover:bg-blue-700 transition shadow-lg hover:shadow-xl backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                const formattedAd = {
                  ...ad,
                  id: ad.ad_id || ad.id,
                  images: ad.images || [ad.image_url],
                  contact: ad.contact || {
                    phone: ad.phone,
                    whatsapp: ad.whatsapp,
                    website: ad.website,
                    address: ad.address
                  },
                  location: ad.location || {
                    city: ad.location_city,
                    district: ad.location_district,
                    googleMapLocation: ad.google_map_location
                  },
                  business: ad.business || {
                    description: ad.business_description,
                    halalAvailable: ad.business_halalAvailable
                  },
                  schedule: ad.schedule || {},
                  shopName: ad.shopName || ad.title,
                  title: ad.title || ad.shopName
                };
                onViewDetails(formattedAd);
              }}
            >
              View Details
            </motion.button>
            {/* Location info for active card - removed from here */}
          </div>
        </div>

        {/* Halal Badge and Open/Close Status */}
        <div className="absolute top-4 left-4 flex gap-2">
          {ad.business_halalAvailable && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-semibold shadow-lg">
              Halal
            </span>
          )}
        </div>
        {/* Open/Close Status Badge */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
          {openStatus && (
            <span className={`px-3 py-1 text-xs rounded-full font-semibold shadow-lg ${openStatus === 'open' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
              {openStatus === 'open' ? 'Open' : 'Closed'}
            </span>
          )}
        </div>
        {/* Active indicator */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 w-4 h-4 bg-blue-600 rounded-full shadow-lg"
          />
        )}
      </div>
    </motion.div>
  );
};

// See More Card Component
const SeeMoreCard = ({ index, activeIndex, onClick, onNextPage }) => {
  const offset = index - activeIndex;
  const isActive = offset === 0;
  const isVisible = Math.abs(offset) <= 3;

  const getTransform = () => {
    const transforms = {
      0: { x: 0, scale: 1, z: 0, rotateY: 0 },
      1: { x: 280, scale: 0.8, z: -50, rotateY: -15 },
      '-1': { x: -280, scale: 0.8, z: -50, rotateY: 15 },
      2: { x: 420, scale: 0.6, z: -100, rotateY: -25 },
      '-2': { x: -420, scale: 0.6, z: -100, rotateY: 25 },
      3: { x: 500, scale: 0.4, z: -150, rotateY: -30 },
      '-3': { x: -500, scale: 0.4, z: -150, rotateY: 30 },
    };
    return transforms[offset] || { x: offset * 600, scale: 0.3, z: -200, rotateY: offset * 30 };
  };

  const transform = getTransform();

  if (!isVisible) return null;

  return (
    <motion.div
      className={`absolute cursor-pointer ${isActive ? 'w-96 h-[420px]' : 'w-72 h-96'}`}
      style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
      animate={{
        x: transform.x,
        scale: transform.scale,
        z: transform.z,
        rotateY: transform.rotateY,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      onClick={() => onNextPage()}
    >
      <div className={`relative w-full h-full rounded-2xl overflow-hidden ${isActive ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl' : 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-md'} border border-gray-200`}>
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Content overlay */}
        <div className="absolute inset-0 p-5 flex flex-col justify-center items-center text-white">
          <div className="text-center">
            <motion.div
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-sm"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-white font-bold text-2xl mb-4 drop-shadow-lg">
              See More Ads
            </h2>
            
            <p className="text-white/90 text-sm mb-6 drop-shadow-md max-w-xs">
              Discover more amazing restaurants, services, and experiences in Kochchi
            </p>
            
            <motion.button
              className="bg-white text-blue-600 font-semibold rounded-full px-8 py-3 text-base hover:bg-gray-100 transition shadow-lg hover:shadow-xl backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore More
            </motion.button>
          </div>
        </div>

        {/* Active indicator */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 w-4 h-4 bg-white rounded-full shadow-lg"
          />
        )}
      </div>
    </motion.div>
  );
};

const MainFinal3DCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedAds, setDisplayedAds] = useState([]);

  const MAX_ADS = 25;
  const ADS_PER_PAGE = 10;

  // Shuffle function using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ads/filter`);
        const data = await res.json();
        const filtered = data.filter(ad => ad.isCarousalAd);
        // Limit to maximum 25 ads and shuffle them
        const limitedAds = filtered.slice(0, MAX_ADS);
        const shuffledAds = shuffleArray(limitedAds);
        setAds(shuffledAds);
        updateDisplayedAds(shuffledAds, 1);
      } catch (err) {
        setError('Failed to load ads.');
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  const updateDisplayedAds = (allAds, page) => {
    const startIndex = (page - 1) * ADS_PER_PAGE;
    const endIndex = startIndex + ADS_PER_PAGE;
    const pageAds = allAds.slice(startIndex, endIndex);
    
    // Shuffle the ads for this page
    const shuffledPageAds = shuffleArray(pageAds);
    
    // Add "See More" card if there are more ads and we're not on the last page
    const hasMorePages = endIndex < allAds.length;
    const finalAds = hasMorePages ? [...shuffledPageAds, { isSeeMore: true }] : shuffledPageAds;
    
    setDisplayedAds(finalAds);
    setActiveIndex(0); // Reset to first card when page changes
  };

  const goToNextPage = () => {
    const totalPages = Math.ceil(ads.length / ADS_PER_PAGE);
    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      setCurrentPage(nextPage);
      updateDisplayedAds(ads, nextPage);
    }
  };

  const goToPrevPage = () => {
    const prevPage = currentPage - 1;
    if (prevPage >= 1) {
      setCurrentPage(prevPage);
      updateDisplayedAds(ads, prevPage);
    }
  };

  useEffect(() => {
    if (!isAutoPlay || displayedAds.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % displayedAds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlay, displayedAds.length]);

  const goToSlide = (index) => setActiveIndex(index);
  const goToNext = () => setActiveIndex((prev) => (prev + 1) % displayedAds.length);
  const goToPrev = () => setActiveIndex((prev) => (prev - 1 + displayedAds.length) % displayedAds.length);

  const totalPages = Math.ceil(ads.length / ADS_PER_PAGE);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (ads.length === 0) return <div className="text-center py-20 text-gray-500">No ads available</div>;

  return (
    <div className="relative w-full bg-gray-900 text-white overflow-hidden">
      <div className="relative w-full max-w-6xl mx-auto h-[500px] flex items-center justify-center">
        <div style={{ perspective: '800px', transformStyle: 'preserve-3d' }} className="relative w-full h-full flex items-center justify-center">
          {displayedAds.map((ad, index) => (
            ad.isSeeMore ? (
              <SeeMoreCard 
                key="see-more" 
                index={index} 
                activeIndex={activeIndex} 
                onClick={goToSlide} 
                onNextPage={goToNextPage}
              />
            ) : (
              <AdCard 
                key={ad.ad_id || ad.id || index} 
                ad={ad} 
                index={index} 
                activeIndex={activeIndex} 
                onClick={goToSlide} 
                onViewDetails={setSelectedAd} 
              />
            )
          ))}
        </div>
      </div>
      
      {/* Carousel Controls */}
      <div className="flex items-center gap-3 justify-center mt-4">
        <button onClick={goToPrev}><ChevronLeft /></button>
        <button onClick={() => setIsAutoPlay(!isAutoPlay)}>{isAutoPlay ? <Pause /> : <Play />}</button>
        <button onClick={() => setActiveIndex(0)}><RotateCcw /></button>
        <button onClick={goToNext}><ChevronRight /></button>
      </div>
      
      {/* Carousel Indicators */}
      <div className="flex justify-center gap-2 mt-2">
        {displayedAds.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`rounded-full ${i === activeIndex ? 'bg-blue-600 w-6 h-2' : 'bg-gray-400 w-2 h-2'}`}
          />
        ))}
      </div>



      {selectedAd && (
        <AdvertisementCard ad={selectedAd} onClose={() => setSelectedAd(null)} />
      )}
    </div>
  );
};

export default MainFinal3DCarousel;
