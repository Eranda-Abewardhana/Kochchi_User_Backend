'use client'
import React, { useEffect, useState } from 'react';
import AdMiniCard from '../../(components)/AdMiniCard';
import AdvertisementCard from '../../(components)/AdvertisementCard';
import Loading from '../../(components)/Loading';
import { motion } from 'framer-motion';

const districts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
  "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa",
  "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

const cities = {
  "Ampara": ["Ampara", "Akkaraipattu", "Kalmunai", "Sammanthurai", "Addalaichenai", "Ninthavur", "Irakkamam", "Pottuvil", "Sainthamaruthu", "Dehiattakandiya", "Lahugala", "Uhana", "Mahaoya"],
  "Anuradhapura": ["Anuradhapura", "Kekirawa", "Mihintale", "Nochchiyagama", "Galenbindunuwewa", "Medawachchiya", "Thambuttegama", "Horowpathana", "Kahatagasdigiliya", "Padaviya"],
  "Badulla": ["Badulla", "Bandarawela", "Haputale", "Ella", "Hali-Ela", "Passara", "Mahiyanganaya", "Welimada", "Diyatalawa", "Lunugala", "Meegahakivula", "Soranatota"],
  "Batticaloa": ["Batticaloa", "Eravur", "Kattankudy", "Kaluwanchikudy", "Valaichchenai", "Oddamavadi", "Chenkalady", "Arayampathy", "Vakarai"],
  "Colombo": ["Colombo", "Dehiwala-Mount Lavinia", "Moratuwa", "Maharagama", "Kottawa", "Nugegoda", "Piliyandala", "Homagama", "Battaramulla", "Kolonnawa", "Kesbewa", "Boralesgamuwa", "Rajagiriya", "Angoda", "Rathmalana"],
  "Galle": ["Galle", "Hikkaduwa", "Ambalangoda", "Elpitiya", "Ahungalla", "Bentota (partially)", "Karandeniya", "Imaduwa", "Balapitiya", "Udugama"],
  "Gampaha": ["Negombo", "Gampaha", "Ja-Ela", "Wattala", "Ragama", "Minuwangoda", "Katunayake", "Kelaniya", "Nittambuwa", "Ganemulla", "Kiribathgoda", "Kandana", "Seeduwa", "Divulapitiya", "Mirigama"],
  "Hambantota": ["Hambantota", "Tangalle", "Tissamaharama", "Ambalantota", "Beliatta", "Weeraketiya", "Suriyawewa", "Sooriyawewa", "Walasmulla", "Lunugamvehera", "Kirinda"],
  "Jaffna": ["Jaffna", "Nallur", "Chavakachcheri", "Point Pedro", "Kopay", "Kodikamam", "Karainagar", "Atchuvely", "Manipay", "Navaly"],
  "Kalutara": ["Kalutara", "Panadura", "Beruwala", "Aluthgama", "Horana", "Matugama", "Bandaragama", "Ingiriya", "Bulathsinhala", "Payagala", "Dodangoda"],
  "Kandy": ["Kandy", "Peradeniya", "Katugastota", "Gampola", "Nawalapitiya", "Kundasale", "Akurana", "Pallekele", "Gelioya", "Wattegama", "Teldeniya", "Galagedara"],
  "Kegalle": ["Kegalle", "Mawanella", "Rambukkana", "Warakapola", "Aranayake", "Ruwanwella", "Deraniyagala", "Yatiyanthota", "Dehiowita"],
  "Kilinochchi": ["Kilinochchi", "Paranthan", "Pooneryn", "Pallai", "Kandawalai"],
  "Kurunegala": ["Kurunegala", "Kuliyapitiya", "Nikaweratiya", "Polgahawela", "Pannala", "Alawwa", "Mawathagama", "Narammala", "Wariyapola", "Ganewatta", "Rideegama"],
  "Mannar": ["Mannar", "Thalaimannar", "Murunkan", "Pesalai", "Erukkalampiddy"],
  "Matale": ["Matale", "Dambulla", "Rattota", "Ukuwela", "Naula", "Galewela", "Pallepola", "Sigiriya"],
  "Matara": ["Matara", "Weligama", "Akuressa", "Dikwella", "Kamburupitiya", "Deniyaya", "Hakmana", "Devinuwara", "Kirinda Puhulwella"],
  "Monaragala": ["Monaragala", "Wellawaya", "Bibile", "Siyambalanduwa", "Madulla", "Thanamalwila"],
  "Mullaitivu": ["Mullaitivu", "Puthukudiyiruppu", "Oddusuddan", "Thunukkai", "Visuamadu"],
  "Nuwara Eliya": ["Nuwara Eliya", "Hatton", "Talawakele", "Lindula", "Ragala", "Walapane", "Kandapola", "Kotagala"],
  "Polonnaruwa": ["Polonnaruwa", "Hingurakgoda", "Medirigiriya", "Minneriya", "Dimbulagala", "Welikanda", "Thamankaduwa"],
  "Puttalam": ["Puttalam", "Chilaw", "Anamaduwa", "Wennappuwa", "Mundalama", "Marawila", "Dankotuwa", "Nattandiya", "Norochcholai", "Madampe"],
  "Ratnapura": ["Ratnapura", "Balangoda", "Embilipitiya", "Eheliyagoda", "Pelmadulla", "Kalawana", "Kuruwita", "Rakwana", "Nivithigala"],
  "Trincomalee": ["Trincomalee", "Kantale", "Kinniya", "Nilaveli", "Mutur", "Thampalakamam", "Thoppur"],
  "Vavuniya": ["Vavuniya", "Cheddikulam", "Nedunkeni", "Vavunikulam"]
};

const Page = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ads/filter`);
        if (!res.ok) throw new Error('Failed to fetch ads');
        const data = await res.json();
        setAds(data.filter(
          (ad) => ad.business_category === 'Restaurant Promotions'
        ));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  // Only show cities for the selected district
  const cityOptions = district ? cities[district] || [] : [];

  const filteredAds = ads.filter(ad => {
    if (district && ad.location_district !== district) return false;
    if (city && ad.location_city !== city) return false;
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
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-2 drop-shadow-lg">Restaurant Promotions</h1>
        <div className="flex justify-center mb-6">
          <div className="w-24 h-1 bg-blue-200 rounded-full" />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-10 bg-white border border-gray-200 shadow-lg rounded-2xl px-7 py-5 max-w-3xl mx-auto">
          <label className="flex text-lg flex-col text-sm font-medium text-gray-700 w-full max-w-xs">
            District
            <select
              className="mt-1 font-bold w-full min-w-[250px] max-w-xs rounded-xl border border-gray-300 bg-gray-50 px-5 py-3 shadow focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
              value={district}
              onChange={e => { setDistrict(e.target.value); setCity(''); }}
            >
              <option value=''>All</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label className="flex text-lg flex-col text-sm font-medium text-gray-700 w-full max-w-xs">
            City
            <select
              className="mt-1 w-full font-bold min-w-[250px] max-w-xs rounded-xl border border-gray-300 bg-gray-50 px-5 py-3 shadow focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
              value={city}
              onChange={e => setCity(e.target.value)}
              disabled={!district}
            >
              <option value=''>All</option>
              {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
        {loading && <Loading message="Loading restaurant promotions..." />}
        {error && <p className="text-center text-red-600 font-semibold py-8">{error}</p>}
        {!loading && !error && filteredAds.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-xl text-gray-500 font-semibold">There are no restaurant promotions advertised on this site.</p>
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