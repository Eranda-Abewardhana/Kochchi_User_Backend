'use client'
import React, { useEffect, useState } from 'react';
import AdMiniCard from '../../(components)/AdMiniCard';
import AdvertisementCard from '../../(components)/AdvertisementCard';
import Loading from '../../(components)/Loading';
import { motion } from 'framer-motion';

const Page = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ads/filter`);
        if (!res.ok) throw new Error('Failed to fetch ads');
        const data = await res.json();
        setAds(data.filter(
          (ad) => ad.business_category === 'Sri Lankan Restaurant Worldwide '
        ));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  const filteredAds = ads.filter(ad => {
    if (state && ad.location_state && !ad.location_state.toLowerCase().includes(state.toLowerCase())) return false;
    if (country && ad.location_country && !ad.location_country.toLowerCase().includes(country.toLowerCase())) return false;
    return true;
  });

  const EnhancedAdMiniCard = ({ ad, ...props }) => (
    <AdMiniCard
      {...props}
      ad={{
        ...ad,
        location_city: ad.location_city,
        location_district: ad.location_district,
      }}
    />
  );

  return (
    <div className="min-h-screen bg-gray-100 pt-24 py-8 px-2 sm:px-6 md:px-12 lg:px-32">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-2 drop-shadow-lg">Srilankan Worldwide Restaurent</h1>
        <div className="flex justify-center mb-6">
          <div className="w-24 h-1 bg-blue-200 rounded-full" />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 bg-white border border-gray-200 shadow-lg rounded-2xl px-6 py-4 max-w-2xl mx-auto">
          <label className="flex flex-col text-base font-semibold text-gray-700 w-full max-w-xs">
            Country
            <input
              type="text"
              placeholder="Enter country..."
              className="mt-1 w-full min-w-[220px] max-w-xs rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 shadow focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
              value={country}
              onChange={e => setCountry(e.target.value)}
            />
          </label>
          <label className="flex flex-col text-base font-semibold text-gray-700 w-full max-w-xs">
            State
            <input
              type="text"
              placeholder="Enter state..."
              className="mt-1 w-full min-w-[220px] max-w-xs rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 shadow focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
              value={state}
              onChange={e => setState(e.target.value)}
            />
          </label>
        </div>
        {loading && <Loading message="Loading worldwide restaurants..." />}
        {error && <p className="text-center text-red-600 font-semibold py-8">{error}</p>}
        {!loading && !error && filteredAds.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-xl text-gray-500 font-semibold">There are no worldwide restaurants advertised on this site.</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAds.map(ad => (
            <motion.div
              key={ad.ad_id}
              className="bg-white rounded-xl border border-gray-200 shadow-md p-0 transition-transform duration-200 hover:scale-[1.02] hover:shadow-xl"
              whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.10)' }}
              whileTap={{ scale: 0.98 }}
            >
              <EnhancedAdMiniCard ad={ad} onClick={() => setSelectedAd(ad)} />
            </motion.div>
          ))}
        </div>
        {selectedAd && (
          <AdvertisementCard ad={selectedAd} onClose={() => setSelectedAd(null)} />
        )}
      </div>
    </div>
  );
};

export default Page;
