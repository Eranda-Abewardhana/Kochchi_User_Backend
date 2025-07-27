import React, { useState, useEffect } from 'react';
import {
  MapPin, Phone, MessageCircle, Globe,
  ChevronLeft, ChevronRight, Users, ThumbsUp, X,
  Mail,
  ChevronDown
} from 'lucide-react';
import AdMiniCard from './AdMiniCard';

export default function AdvertisementCard({ ad, onClose }) {
  const [showDetails, setShowDetails] = useState(!!onClose);
  const [currentImg, setCurrentImg] = useState(0);
  const [isRecommended, setIsRecommended] = useState(!!ad.is_recommended);
  // Fix: Extract count if recommendations is an object
  function getRecommendCount(ad) {
    if (ad.recommendations_count && typeof ad.recommendations_count === 'object' && ad.recommendations_count.count !== undefined) {
      return ad.recommendations_count.count;
    }
    if (ad.recommendations && typeof ad.recommendations === 'object' && ad.recommendations.count !== undefined) {
      return ad.recommendations.count;
    }
    if (typeof ad.recommendations_count === 'number') return ad.recommendations_count;
    if (typeof ad.recommendations === 'number') return ad.recommendations;
    if (typeof ad.likes_count === 'number') return ad.likes_count;
    if (ad.likes_userIds) return ad.likes_userIds.length;
    return 0;
  }
  const [recommendCount, setRecommendCount] = useState(getRecommendCount(ad));
  const [loadingRecommend, setLoadingRecommend] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const images = ad.images || [];
  // Use business_halalAvailable from API for halal status
  const halal = ad.business_halalAvailable;

  // Robust field mapping for all ad fields
  const shopName = ad.shopName || ad.business?.shopName || ad.title || 'No Name';
  const city = ad.location?.city || ad.location_city || 'Unknown';
  const address = ad.contact_address || ad.contact?.address || 'No address';
  const description = ad.business?.description || ad.business_description || 'No description provided.';
  const adId = ad.id || ad.ad_id;
  const tags = ad.business?.tags || ad.business_tags || [];
  const category = ad.business?.category || ad.business_category || 'Other';

  // Schedule for open/close badge
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const checkIfOpen = () => {
      const now = new Date();
      const dayIdx = now.getDay(); // 0=Sunday, 1=Monday, ...
      const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const todayKey = dayKeys[dayIdx];
      const hoursArr = ad[`schedule_${todayKey}`];
      let isOpenNow = false;
      function timeToMinutes(t) {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      }
      if (Array.isArray(hoursArr) && hoursArr.length > 0) {
        const nowMins = now.getHours() * 60 + now.getMinutes();
        for (const range of hoursArr) {
          const [openTime, closeTimeRaw] = range.split('-');
          const closeTime = closeTimeRaw === '24:00' ? '23:59' : closeTimeRaw;
          const openMins = timeToMinutes(openTime);
          const closeMins = timeToMinutes(closeTime);
          if (openMins <= closeMins) {
            // Normal range
            if (nowMins >= openMins && nowMins <= closeMins) {
              isOpenNow = true;
              break;
            }
          } else {
            // Overnight range (e.g., 20:00-02:00)
            if (nowMins >= openMins || nowMins <= closeMins) {
              isOpenNow = true;
              break;
            }
          }
        }
      }
      setIsOpen(isOpenNow);
    };
    checkIfOpen();
    const interval = setInterval(checkIfOpen, 60000);
    return () => clearInterval(interval);
  }, [mounted, ad.schedule_mon, ad.schedule_tue, ad.schedule_wed, ad.schedule_thu, ad.schedule_fri, ad.schedule_sat, ad.schedule_sun]);

  useEffect(() => {
    if (!mounted) return;
    // Prevent background scroll when popup is open
    if (typeof window !== 'undefined') {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [mounted]);

  const handlePrev = () => setCurrentImg((prev) => (prev - 1 + images.length) % images.length);
  const handleNext = () => setCurrentImg((prev) => (prev + 1) % images.length);

  // If onClose is provided, always show details and use onClose for close
  if (onClose) {
    // Detailed view (modern layout)
    return (
      <div className="fixed inset-x-0 top-4 bottom-4 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full h-full max-w-7xl max-h-screen mx-auto bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden border border-gray-200 flex flex-col md:flex-row relative">
          {/* Close button (top right) */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-xl border-2 border-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-300"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          {/* Status badges below close button (move to top left on mobile) */}
          <div className="ad-badges absolute top-20 right-6 z-20 flex flex-col gap-2 items-end md:items-end md:top-20 md:right-6">
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              halal 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {halal === true ? 'Halal Available' : 'Halal Not Available'}
            </span>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
              isOpen 
                ? 'bg-emerald-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {isOpen ? 'OPEN NOW' : 'CLOSED NOW'}
            </span>
          </div>
          {/* LEFT: Image Carousel */}
          <div className="w-full md:w-1/2 relative h-[30vh] md:h-full max-h-screen">
            <img
              src={images[currentImg]}
              alt={`Ad Image ${currentImg + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <button 
              onClick={handlePrev} 
              className="ad-slider-btn absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button 
              onClick={handleNext} 
              className="ad-slider-btn absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
            <div className="absolute left-1/2 bottom-8 transform -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImg ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="w-full md:w-1/2 p-4 md:p-8 overflow-y-auto max-h-screen relative" id="ad-details-scrollable">
            {/* Visibility badge removed from detailed view */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-2">{shopName}</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="font-poppins text-sm">{address}, {city}</span>
                </div>
              </div>
              {/* Removed badges from here */}
            </div>

            <p className="font-poppins text-gray-700 text-base leading-relaxed mb-6">
              {description}
            </p>

            {/* Recommendation */}
            <div className="flex items-center text-blue-600 mb-8 bg-blue-50 px-4 py-3 rounded-lg">
              <Users className="w-5 h-5 mr-2" />
              <span className="font-poppins font-medium">
                {Number.isFinite(recommendCount) ? recommendCount : 0} people recommend this
              </span>
              <button
                className={`ml-4 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border border-blue-200 shadow-sm ${isRecommended ? 'bg-blue-500 text-white' : 'bg-white text-blue-700 hover:bg-blue-100'}`}
                disabled={loadingRecommend}
                onClick={async () => {
                  if (isRecommended) {
                    alert('You already recommend this advertisement');
                    return;
                  }
                  if (loadingRecommend) return;
                  setLoadingRecommend(true);
                  try {
                    const token = localStorage.getItem('access_token') || localStorage.getItem('user_token') || localStorage.getItem('admin_token');
                    if (!token) {
                      alert('You must be logged in to recommend ads.');
                      setLoadingRecommend(false);
                      return;
                    }
                    // POST to recommend endpoint
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ads/${adId}/recommend`, {
                      method: 'POST',
                      headers: {
                        'accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                    });
                    if (!res.ok) {
                      throw new Error('Failed to recommend');
                    }
                    // After recommending, fetch the updated ad data
                    const adRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ads/${adId}`, {
                      headers: {
                        'accept': 'application/json',
                      },
                    });
                    if (!adRes.ok) {
                      throw new Error('Failed to fetch updated ad data');
                    }
                    const updatedAd = await adRes.json();
                    setIsRecommended(true);
                    let newCount = recommendCount + 1;
                    if (typeof updatedAd === 'object') {
                      if (updatedAd.recommendations_count && typeof updatedAd.recommendations_count === 'object' && updatedAd.recommendations_count.count !== undefined) {
                        newCount = updatedAd.recommendations_count.count;
                      } else if (updatedAd.recommendations && typeof updatedAd.recommendations === 'object' && updatedAd.recommendations.count !== undefined) {
                        newCount = updatedAd.recommendations.count;
                      } else if (typeof updatedAd.recommendations_count === 'number') {
                        newCount = updatedAd.recommendations_count;
                      } else if (typeof updatedAd.recommendations === 'number') {
                        newCount = updatedAd.recommendations;
                      }
                    } else if (typeof updatedAd === 'number') {
                      newCount = updatedAd;
                    }
                    setRecommendCount(newCount);
                  } catch (err) {
                    alert(err.message || 'Error recommending');
                  } finally {
                    setLoadingRecommend(false);
                  }
                }}
              >
                <ThumbsUp className="w-4 h-4" />
                {isRecommended ? 'Recommended' : 'Recommend'}
              </button>
            </div>

            {/* Creative Weekly Schedule (API schedule_* fields) - Two columns per row */}
            <div className="mb-8">
              <h4 className="font-playfair text-xl font-semibold text-gray-900 mb-4">Opening Hours</h4>
              <div className="bg-white/80 rounded-2xl p-4 shadow-md border border-gray-200">
                {(() => {
                  const days = [
                    { key: 'mon', label: 'Monday' },
                    { key: 'tue', label: 'Tuesday' },
                    { key: 'wed', label: 'Wednesday' },
                    { key: 'thu', label: 'Thursday' },
                    { key: 'fri', label: 'Friday' },
                    { key: 'sat', label: 'Saturday' },
                    { key: 'sun', label: 'Sunday' },
                  ];
                  const rows = [];
                  for (let i = 0; i < days.length; i += 2) {
                    const left = days[i];
                    const right = days[i + 1];
                    const leftHours = ad[`schedule_${left.key}`];
                    const rightHours = right ? ad[`schedule_${right.key}`] : null;
                    const renderHours = hours =>
                      Array.isArray(hours) && hours.length > 0
                        ? hours.map((h, i) => (
                            <span key={i}>
                              {i > 0 && <span className="mx-1">•</span>}
                              {h.replace('-', ' - ')}
                            </span>
                          ))
                        : <span className="text-gray-400">-</span>;
                    rows.push(
                      <div key={left.key} className="flex items-center justify-between gap-4 py-1 border-b last:border-b-0 border-gray-100">
                        {/* Left day */}
                        <div className="flex-1 flex items-center gap-2 min-w-[120px]">
                          <span className="font-poppins font-semibold text-gray-800 w-20 text-base">{left.label}</span>
                          <span className="font-poppins text-sm px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                            {renderHours(leftHours)}
                          </span>
                        </div>
                        {/* Separator */}
                        {right && <span className="mx-2 text-gray-300 font-bold">|</span>}
                        {/* Right day */}
                        {right && (
                          <div className="flex-1 flex items-center gap-2 min-w-[120px]">
                            <span className="font-poppins font-semibold text-gray-800 w-20 text-base">{right.label}</span>
                            <span className="font-poppins text-sm px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                              {renderHours(rightHours)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return rows;
                })()}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-300 transition-colors">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="font-poppins text-base text-gray-800 font-semibold">{ad.contact_phone || ad.contact?.phone || 'No number'}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors">
                <a 
                  href={`mailto:${ad.contact_email || ad.contact?.email || ''}`}
                  className="flex items-center"
                >
                  <Mail className="w-4 h-4 text-gray-600" />
                </a>
                {(ad.contact_email || ad.contact?.email) && (
                  <span className="font-poppins text-base text-gray-800 font-semibold break-all">
                    {ad.contact_email || ad.contact?.email}
                  </span>
                )}
              </div>
              <a 
                href={ad.contact_website || ad.contact?.website || '#'} 
                target="_blank" 
                className="flex items-center gap-2 p-3 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors"
              >
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="font-poppins text-sm text-gray-700 font-semibold">Website</span>
              </a>
              <a 
                href={ad.location_googleMapLocation ? `https://maps.google.com/?q=${ad.location_googleMapLocation}` : (ad.location?.googleMapLocation ? `https://maps.google.com/?q=${ad.location.googleMapLocation}` : '#')} 
                target="_blank"
                className="flex items-center gap-2 p-3 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors"
              >
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="font-poppins text-sm text-gray-700 font-semibold">View on Map</span>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <a
                href={(ad.contact_whatsapp || ad.contact?.whatsapp) ? `https://wa.me/${(ad.contact_whatsapp || ad.contact?.whatsapp).replace(/\D/g, '')}` : '#'}
                target="_blank"
                className="flex-1 bg-[#25D366] text-white py-3 rounded-xl text-sm font-medium text-center hover:bg-[#1ebe5d] transition-colors flex items-center justify-center gap-2"
              >
                {/* WhatsApp SVG icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor"><path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.41L4.062 28.25a1 1 0 0 0 1.312 1.312l6.84-2.174A11.94 11.94 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10c-1.77 0-3.43-.463-4.86-1.27a1 1 0 0 0-.74-.08l-5.13 1.632 1.633-5.13a1 1 0 0 0-.08-.74A9.963 9.963 0 0 1 6 15c0-5.523 4.477-10 10-10zm-4.07 6.07a1 1 0 0 0-.97 1.242c.14.56.37 1.1.68 1.6.22.36.18.82-.12 1.12l-.44.44a.997.997 0 0 0-.22 1.06c.54 1.47 1.7 2.63 3.17 3.17.38.14.81.05 1.06-.22l.44-.44c.3-.3.76-.34 1.12-.12.5.31 1.04.54 1.6.68a1 1 0 0 0 1.24-.97v-1.01A1 1 0 0 0 20 15c0-2.76-2.24-5-5-5h-1.07z"/></svg>
                Contact Us
              </a>
            </div>
            {/* Animated scroll down icon if content is scrollable */}
            <ScrollDownIndicator />
          </div>
        </div>
      </div>
    );
  }

  if (!showDetails) {
    // Use AdMiniCard for summary card
    return (
      <AdMiniCard ad={ad} onClick={() => setShowDetails(true)} />
    );
  }

  // Detailed view (modern layout)
  return (
    <div className="fixed inset-x-0 top-4 bottom-4 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full h-full max-w-7xl max-h-screen mx-auto bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden border border-gray-200 flex flex-col md:flex-row relative">
        {/* Close button (top right) */}
        <button
          onClick={() => setShowDetails(false)}
          className="absolute top-6 right-6 z-20 bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-xl border-2 border-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-300"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        {/* Status badges below close button (move to top left on mobile) */}
        <div className="ad-badges absolute top-20 right-6 z-20 flex flex-col gap-2 items-end md:items-end md:top-20 md:right-6">
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
            halal 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {halal === true ? 'Halal Available' : 'Halal Not Available'}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
            isOpen 
              ? 'bg-emerald-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {isOpen ? 'OPEN NOW' : 'CLOSED NOW'}
          </span>
        </div>
        {/* LEFT: Image Carousel */}
        <div className="w-full md:w-1/2 relative h-[30vh] md:h-full max-h-screen">
          <img
            src={images[currentImg]}
            alt={`Ad Image ${currentImg + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button 
            onClick={handlePrev} 
            className="ad-slider-btn absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button 
            onClick={handleNext} 
            className="ad-slider-btn absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
          <div className="absolute left-1/2 bottom-8 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImg ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: Details */}
        <div className="w-full md:w-1/2 p-4 md:p-8 overflow-y-auto max-h-screen relative" id="ad-details-scrollable">
          {/* Visibility badge removed from detailed view */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-2">{shopName}</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="font-poppins text-sm">{address}, {city}</span>
              </div>
            </div>
            {/* Removed badges from here */}
          </div>

          <p className="font-poppins text-gray-700 text-base leading-relaxed mb-6">
            {description}
          </p>

          {/* Recommendation */}
          <div className="flex items-center text-blue-600 mb-8 bg-blue-50 px-4 py-3 rounded-lg">
            <Users className="w-5 h-5 mr-2" />
            <span className="font-poppins font-medium">
              {Number.isFinite(recommendCount) ? recommendCount : 0} people recommend this
            </span>
            <button
              className={`ml-4 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border border-blue-200 shadow-sm ${isRecommended ? 'bg-blue-500 text-white' : 'bg-white text-blue-700 hover:bg-blue-100'}`}
              disabled={loadingRecommend}
              onClick={async () => {
                if (isRecommended) {
                  alert('You already recommend this advertisement');
                  return;
                }
                if (loadingRecommend) return;
                setLoadingRecommend(true);
                try {
                  const token = localStorage.getItem('access_token') || localStorage.getItem('user_token') || localStorage.getItem('admin_token');
                  if (!token) {
                    alert('You must be logged in to recommend ads.');
                    setLoadingRecommend(false);
                    return;
                  }
                  // POST to recommend endpoint
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ads/${adId}/recommend`, {
                    method: 'POST',
                    headers: {
                      'accept': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                  });
                  if (!res.ok) {
                    throw new Error('Failed to recommend');
                  }
                  // After recommending, fetch the updated ad data
                  const adRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ads/${adId}`, {
                    headers: {
                      'accept': 'application/json',
                    },
                  });
                  if (!adRes.ok) {
                    throw new Error('Failed to fetch updated ad data');
                  }
                  const updatedAd = await adRes.json();
                  setIsRecommended(true);
                  let newCount = recommendCount + 1;
                  if (typeof updatedAd === 'object') {
                    if (updatedAd.recommendations_count && typeof updatedAd.recommendations_count === 'object' && updatedAd.recommendations_count.count !== undefined) {
                      newCount = updatedAd.recommendations_count.count;
                    } else if (updatedAd.recommendations && typeof updatedAd.recommendations === 'object' && updatedAd.recommendations.count !== undefined) {
                      newCount = updatedAd.recommendations.count;
                    } else if (typeof updatedAd.recommendations_count === 'number') {
                      newCount = updatedAd.recommendations_count;
                    } else if (typeof updatedAd.recommendations === 'number') {
                      newCount = updatedAd.recommendations;
                    }
                  } else if (typeof updatedAd === 'number') {
                    newCount = updatedAd;
                  }
                  setRecommendCount(newCount);
                } catch (err) {
                  alert(err.message || 'Error recommending');
                } finally {
                  setLoadingRecommend(false);
                }
              }}
            >
              <ThumbsUp className="w-4 h-4" />
              {isRecommended ? 'Recommended' : 'Recommend'}
            </button>
          </div>

          {/* Creative Weekly Schedule (API schedule_* fields) - Two columns per row */}
          <div className="mb-8">
            <h4 className="font-playfair text-xl font-semibold text-gray-900 mb-4">Opening Hours</h4>
            <div className="bg-white/80 rounded-2xl p-4 shadow-md border border-gray-200">
              {(() => {
                const days = [
                  { key: 'mon', label: 'Monday' },
                  { key: 'tue', label: 'Tuesday' },
                  { key: 'wed', label: 'Wednesday' },
                  { key: 'thu', label: 'Thursday' },
                  { key: 'fri', label: 'Friday' },
                  { key: 'sat', label: 'Saturday' },
                  { key: 'sun', label: 'Sunday' },
                ];
                const rows = [];
                for (let i = 0; i < days.length; i += 2) {
                  const left = days[i];
                  const right = days[i + 1];
                  const leftHours = ad[`schedule_${left.key}`];
                  const rightHours = right ? ad[`schedule_${right.key}`] : null;
                  const renderHours = hours =>
                    Array.isArray(hours) && hours.length > 0
                      ? hours.map((h, i) => (
                          <span key={i}>
                            {i > 0 && <span className="mx-1">•</span>}
                            {h.replace('-', ' - ')}
                          </span>
                        ))
                      : <span className="text-gray-400">-</span>;
                  rows.push(
                    <div key={left.key} className="flex items-center justify-between gap-4 py-1 border-b last:border-b-0 border-gray-100">
                      {/* Left day */}
                      <div className="flex-1 flex items-center gap-2 min-w-[120px]">
                        <span className="font-poppins font-semibold text-gray-800 w-20 text-base">{left.label}</span>
                        <span className="font-poppins text-sm px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                          {renderHours(leftHours)}
                        </span>
                      </div>
                      {/* Separator */}
                      {right && <span className="mx-2 text-gray-300 font-bold">|</span>}
                      {/* Right day */}
                      {right && (
                        <div className="flex-1 flex items-center gap-2 min-w-[120px]">
                          <span className="font-poppins font-semibold text-gray-800 w-20 text-base">{right.label}</span>
                          <span className="font-poppins text-sm px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                            {renderHours(rightHours)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }
                return rows;
              })()}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-300 transition-colors">
              <Phone className="w-4 h-4 text-gray-600" />
              <span className="font-poppins text-base text-gray-800 font-semibold">{ad.contact_phone || ad.contact?.phone || 'No number'}</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors">
              <a 
                href={`mailto:${ad.contact_email || ad.contact?.email || ''}`}
                className="flex items-center"
              >
                <Mail className="w-4 h-4 text-gray-600" />
              </a>
              {(ad.contact_email || ad.contact?.email) && (
                <span className="font-poppins text-base text-gray-800 font-semibold break-all">
                  {ad.contact_email || ad.contact?.email}
                </span>
              )}
            </div>
            <a 
              href={ad.contact_website || ad.contact?.website || '#'} 
              target="_blank" 
              className="flex items-center gap-2 p-3 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors"
            >
              <Globe className="w-4 h-4 text-gray-600" />
              <span className="font-poppins text-sm text-gray-700 font-semibold">Website</span>
            </a>
            <a 
              href={ad.location_googleMapLocation ? `https://maps.google.com/?q=${ad.location_googleMapLocation}` : (ad.location?.googleMapLocation ? `https://maps.google.com/?q=${ad.location.googleMapLocation}` : '#')} 
              target="_blank"
              className="flex items-center gap-2 p-3 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors"
            >
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="font-poppins text-sm text-gray-700 font-semibold">View on Map</span>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <a
              href={(ad.contact_whatsapp || ad.contact?.whatsapp) ? `https://wa.me/${(ad.contact_whatsapp || ad.contact?.whatsapp).replace(/\D/g, '')}` : '#'}
              target="_blank"
              className="flex-1 bg-[#25D366] text-white py-3 rounded-xl text-sm font-medium text-center hover:bg-[#1ebe5d] transition-colors flex items-center justify-center gap-2"
            >
              {/* WhatsApp SVG icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor"><path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.41L4.062 28.25a1 1 0 0 0 1.312 1.312l6.84-2.174A11.94 11.94 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10c-1.77 0-3.43-.463-4.86-1.27a1 1 0 0 0-.74-.08l-5.13 1.632 1.633-5.13a1 1 0 0 0-.08-.74A9.963 9.963 0 0 1 6 15c0-5.523 4.477-10 10-10zm-4.07 6.07a1 1 0 0 0-.97 1.242c.14.56.37 1.1.68 1.6.22.36.18.82-.12 1.12l-.44.44a.997.997 0 0 0-.22 1.06c.54 1.47 1.7 2.63 3.17 3.17.38.14.81.05 1.06-.22l.44-.44c.3-.3.76-.34 1.12-.12.5.31 1.04.54 1.6.68a1 1 0 0 0 1.24-.97v-1.01A1 1 0 0 0 20 15c0-2.76-2.24-5-5-5h-1.07z"/></svg>
              Contact Us
            </a>
          </div>
          {/* Animated scroll down icon if content is scrollable */}
          <ScrollDownIndicator />
        </div>
      </div>
    </div>
  );
} 

// ScrollDownIndicator component
function ScrollDownIndicator() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const el = document.getElementById('ad-details-scrollable');
    if (!el) return;
    function checkScroll() {
      setShow(el.scrollHeight > el.clientHeight && el.scrollTop + el.clientHeight < el.scrollHeight - 10);
    }
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);
  if (!show) return null;
  return (
    <div className="absolute left-1/2 bottom-2 transform -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
      <ChevronDown className="w-7 h-7 text-gray-600 animate-bounce" />
    </div>
  );
} 