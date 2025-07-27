import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

export default function AdMiniCard({ ad, onClick }) {
  const images = ad.images || [];
  const category = ad.business?.category || ad.business_category || 'Other';
  const city = ad.location?.city || ad.location_city || 'Unknown';
  const shopName = ad.shopName || ad.business?.shopName || ad.title || 'No Name';
  const tags = ad.business?.tags || ad.business_tags || [];

  // Open/close time for today
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const now = new Date();
  const todayKey = dayKeys[now.getDay()];
  const todayHours = ad[`schedule_${todayKey}`];
  let openCloseText = '-';
  let isOpenNow = false;
  function timeToMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }
  if (Array.isArray(todayHours) && todayHours.length > 0) {
    openCloseText = todayHours.map(h => h.replace('-', ' - ')).join(' • ');
    const nowMins = now.getHours() * 60 + now.getMinutes();
    for (const range of todayHours) {
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

  return (
    <div
      className="relative bg-gradient-to-br from-blue-100 via-white to-purple-100 rounded-2xl shadow-xl border border-gray-100 p-0 flex flex-col cursor-pointer hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 group overflow-hidden min-h-[270px]"
      onClick={onClick}
      style={{ minHeight: 270 }}
    >
      {/* Status tag at top-left, floating */}
      {(ad.visibility === 'visible' || ad.visibility === 'hidden') && (
        <div className="absolute top-4 left-4 z-20">
          {ad.visibility === 'visible' ? (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-lg">Approved</span>
          ) : (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-lg">Pending</span>
          )}
        </div>
      )}
      {/* Card image, rectangular banner */}
      <div className="w-full h-32 bg-gray-100 overflow-hidden">
        <img
          src={images[0]}
          alt={shopName}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Card content */}
      <div className="flex-1 flex flex-col items-center px-6 py-4">
        {/* Category badge & city */}
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-200/60 text-blue-800 px-3 py-0.5 rounded-full text-xs font-medium shadow-sm">
            {category}
          </span>
          <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full font-medium shadow-sm">
            <FaMapMarkerAlt className="inline-block text-blue-500 text-sm" />
            {city}
          </span>
        </div>
        {/* Title */}
        <h3 className="font-bold text-xl text-gray-900 text-center mb-1 drop-shadow-sm line-clamp-1">{shopName}</h3>
        {/* Open/Close time for today */}
        <div className="flex items-center gap-2 mt-1 mb-1">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isOpenNow ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            {isOpenNow ? 'OPEN NOW' : 'CLOSED NOW'}
          </span>
        </div>
        {/* Tags */}
        <div className="mt-2 flex gap-2 flex-wrap justify-center">
          {tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="bg-blue-200/60 text-blue-800 px-3 py-0.5 rounded-full text-xs font-medium shadow-sm">{tag}</span>
          ))}
        </div>
      </div>
      {/* Bottom bar: quick stats & view button */}
      <div className="w-full flex items-center justify-between gap-2 px-6 pb-4 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="ml-2 text-gray-400">{ad.createdAt ? new Date(ad.createdAt).toLocaleDateString() : ''}</span>
        </div>
        <button
          className="ml-auto bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow transition-all"
          onClick={e => { e.stopPropagation(); if (onClick) onClick(); }}
        >
          View Details
        </button>
      </div>
    </div>
  );
} 