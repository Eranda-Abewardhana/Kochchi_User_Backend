'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import { motion } from 'framer-motion';
import { FaStar, FaCrown, FaEye, FaImages, FaArrowUp, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Toast from '../(components)/Toast';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const specialties = [
  "All Day Breakfast",
  "Local Food Restaurants",
  "African",
  "Arabic",
  "BBQ / Grill",
  "Buffet Style Restaurants",
  "Burghers / Submarine / Hotdogs",
  "Cafeteria",
  "Cake Shops / Cake Designers",
  "Caribbean",
  "Casual Dining",
  "Chinese",
  "Chocolate Shops",
  "Coffee Shops / Tea Shops",
  "Contemporary Casual (e.g. Eco Friendly, Bar, Karaoke)",
  "Continental",
  "Dine-in Only Restaurants",
  "Family Style Restaurants",
  "Fast Casual",
  "Fast Food (QSR)",
  "Fine Dining",
  "Food Truck / Cart / Stand",
  "Fried Chicken Shops",
  "German",
  "Greasy Spoon Restaurants",
  "Grill",
  "Ice Cream Shops",
  "Indonesian",
  "Italian",
  "Japanese",
  "Korean",
  "Mexican",
  "Mongolian",
  "Night Only Restaurants",
  "Online / Ghost / Delivery Only Restaurants",
  "Regional Food Restaurants",
  "Pakistani",
  "Pastry and Bakery",
  "Pizza",
  "Pop-up / Temporary Restaurants",
  "Pubs",
  "Russian",
  "Seafood",
  "Singaporean",
  "Snack Bars / Juice Bars",
  "Soya Food",
  "Spanish",
  "Street Food",
  "Sweet Shops",
  "Thai",
  "Vegetarian",
  "Other"
];

const categories = [
  "Restaurant",
  "Restaurant with Liquor",
  "Liquor Shops",
  "Catering Services",
  "Day-out Packages",
  "Event Management Companies",
  "Reception Halls",
  "Restaurant Promotions",
  "Sri Lankan Worldwide Restaurant"
];

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

// Utility functions for currency conversion
const rupeesToDollars = (amount) => {
  if (!amount || isNaN(amount)) return '$0.00';
  return `$${(amount / 300).toFixed(2)}`;
};

const dollarsToRupees = (amount) => {
  if (!amount || isNaN(amount)) return '0.00';
  return (amount * 300).toFixed(2);
};

// Currency conversion API function
export async function convertToLKR(amount) {
  try {
    // Fetch exchange rates
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    const data = await res.json();
    // Get LKR rate
    const lkrRate = data.rates.LKR;
    // Return converted amount
    return amount * lkrRate;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return amount * 300; // Fallback rate
  }
}







function Page() {
  const [formData, setFormData] = useState({
    restaurantName: '',
    address: '',
    mobileNumber: '',
    whatsapp: '',
    email: '',
    website: '',
    googleMapLocation: '',
    district: '',
    city: '',
    country: '',
    state: '',
    halalAvailability: 'No',
    openingTimes: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    closingTimes: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    description: '',
    images: [],
    category: '',
    specialties: [],
    carouselAdd: false,
    topAdd: false
  });

  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [showLiquorWarning, setShowLiquorWarning] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [menuOptions, setMenuOptions] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedCoords, setSelectedCoords] = useState({ lat: 6.9271, lng: 79.8612 }); // Default to Colombo
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [pricing, setPricing] = useState({
    base: 0,
    carousal: 0,
    top: 0,
    international: 0,
  });

  // Dansal form state
  const [dansalForm, setDansalForm] = useState({
    title: '',
    organizer: { name: '', phone: '', whatsapp: '', email: '' },
    location: { city: '', district: '', province: '', lat: 7.2905715, lon: 80.6337262 },
    foodType: '',
    date: '',
    time: '',
    endDateTime: '',
    description: '',
    images: [],
  });
  const [dansalImagePreviewUrls, setDansalImagePreviewUrls] = useState([]);
  const [dansalLoading, setDansalLoading] = useState(false);
  const [dansalSuccess, setDansalSuccess] = useState('');
  const [dansalError, setDansalError] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(true); // default true for SSR safety

  const [missingFields, setMissingFields] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    // Check login status on mount
    const token = localStorage.getItem('access_token') || localStorage.getItem('admin_token');
    setIsLoggedIn(!!token);
  }, []);

  // Helper for province (auto-fill based on district, or let user type)
  const getProvinceForDistrict = (district) => {
    // You can expand this mapping as needed
    const provinceMap = {
      "Colombo": "Western", "Gampaha": "Western", "Kalutara": "Western",
      "Kandy": "Central", "Matale": "Central", "Nuwara Eliya": "Central",
      "Galle": "Southern", "Matara": "Southern", "Hambantota": "Southern",
      // ... add more as needed
    };
    return provinceMap[district] || '';
  };

  // Dansal image upload
  const handleDansalImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (dansalForm.images.length + files.length > 8) {
      alert('You can only upload up to 8 images');
      return;
    }
    const newImages = [...dansalForm.images, ...files];
    setDansalForm(prev => ({ ...prev, images: newImages }));
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setDansalImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };
  const removeDansalImage = (index) => {
    const newImages = dansalForm.images.filter((_, i) => i !== index);
    const newPreviewUrls = dansalImagePreviewUrls.filter((_, i) => i !== index);
    setDansalForm(prev => ({ ...prev, images: newImages }));
    setDansalImagePreviewUrls(newPreviewUrls);
  };

  // Dansal form submit
  const handleDansalSubmit = async (e) => {
    e.preventDefault();
    setDansalLoading(true);
    setDansalSuccess('');
    setDansalError('');
    try {
      const now = new Date();
      const createdAt = now.toISOString();
      const updatedAt = createdAt;
      
      // Parse endDateTime from date and time
      const endDateTimeISO = (dansalForm.date && dansalForm.time)
        ? (() => {
            // Try to parse time like '6:00 PM – 10:00 PM' and use the end time
            const timeRange = dansalForm.time.split('–').map(t => t.trim());
            const endTimeStr = timeRange[1] || timeRange[0] || '';
            if (!endTimeStr) return '';
            // Convert to 24h format
            const [time, period] = endTimeStr.split(' ');
            let [hours, minutes] = time.split(':');
            hours = parseInt(hours, 10);
            minutes = minutes || '00';
            if (period && period.toUpperCase().includes('PM') && hours < 12) hours += 12;
            if (period && period.toUpperCase().includes('AM') && hours === 12) hours = 0;
            const pad = n => n.toString().padStart(2, '0');
            return `${dansalForm.date}T${pad(hours)}:${pad(minutes)}:00`;
          })()
        : '';

      // Helper function to get province for district
      const getProvinceForDistrict = (district) => {
        const provinceMap = {
          "Colombo": "Western", "Gampaha": "Western", "Kalutara": "Western",
          "Kandy": "Central", "Matale": "Central", "Nuwara Eliya": "Central",
          "Galle": "Southern", "Matara": "Southern", "Hambantota": "Southern",
          "Ampara": "Eastern", "Batticaloa": "Eastern", "Trincomalee": "Eastern",
          "Anuradhapura": "North Central", "Polonnaruwa": "North Central",
          "Badulla": "Uva", "Monaragala": "Uva",
          "Jaffna": "Northern", "Kilinochchi": "Northern", "Mannar": "Northern", "Mullaitivu": "Northern", "Vavuniya": "Northern",
          "Kegalle": "Sabaragamuwa", "Ratnapura": "Sabaragamuwa",
          "Kurunegala": "North Western", "Puttalam": "North Western"
        };
        return provinceMap[district] || 'Central';
      };

      const data = {
        title: dansalForm.title,
        organizer: {
          name: dansalForm.organizer.name,
          phone: dansalForm.organizer.phone,
          whatsapp: dansalForm.organizer.whatsapp || dansalForm.organizer.phone,
          email: dansalForm.organizer.email || '',
        },
        location: {
          city: dansalForm.location.city,
          district: dansalForm.location.district,
          province: getProvinceForDistrict(dansalForm.location.district),
          lat: dansalForm.location.lat?.toString() || '7.2905715',
          lon: dansalForm.location.lon?.toString() || '80.6337262',
        },
        foodType: dansalForm.foodType,
        date: dansalForm.date,
        time: dansalForm.time,
        endDateTime: endDateTimeISO,
        description: dansalForm.description,
        createdAt,
        updatedAt,
      };

      console.log('Dansal JSON to be sent:', data);

      const form = new FormData();
      form.append('data', JSON.stringify(data));
      
      // Add images
      if (dansalForm.images && dansalForm.images.length > 0) {
        dansalForm.images.forEach((img) => {
          form.append('images', img);
        });
      }

      const token = localStorage.getItem('access_token') || localStorage.getItem('admin_token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dansal/create`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData
        },
        body: form,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error occurred' }));
        console.error('Dansal API Error Response:', errorData);
        throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      const responseData = await res.json();
      console.log('Dansal API response:', responseData);

      setDansalSuccess('Dansal created successfully! Thank you for your contribution.');
      setTimeout(() => {
        setShowDansalForm(false);
        setDansalForm({
          title: '', organizer: { name: '', phone: '', whatsapp: '', email: '' },
          location: { city: '', district: '', province: '', lat: 7.2905715, lon: 80.6337262 },
          foodType: '', date: '', time: '', endDateTime: '', description: '', images: [],
        });
        setDansalImagePreviewUrls([]);
      }, 2000);
    } catch (err) {
      console.error('Dansal submission error:', err);
      setDansalError(err.message || 'Error posting dansal');
    } finally {
      setDansalLoading(false);
    }
  };

  // Fetch pricing from API on mount
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/pricing/all`);
        const data = await res.json();
        if (data && Array.isArray(data.prices)) {
          // Ignore the last element
          const prices = data.prices.slice(0, 4);
          let base = 0, carousal = 0, top = 0, international = 0;
          prices.forEach((item) => {
            if (item.product.name === 'base_price') base = item.amount;
            else if (item.product.name === 'carosal_add_price') carousal = item.amount;
            else if (item.product.name === 'top_add_price') top = item.amount;
            else if (item.product.name === 'international_add_price') international = item.amount;
          });
          setPricing({ base, carousal, top, international });
        }
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
      }
    };
    fetchPricing();
  }, []);

  // Load Leaflet CSS and JS
  useEffect(() => {
    const loadLeaflet = async () => {
      // Load CSS first
      if (!document.querySelector('link[href*="leaflet"]')) {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCSS);
        
        // Wait for CSS to load
        await new Promise(resolve => {
          leafletCSS.onload = resolve;
          setTimeout(resolve, 100);
        });
      }

      // Add custom CSS to fix z-index issues
      if (!document.querySelector('#leaflet-custom-css')) {
        const customCSS = document.createElement('style');
        customCSS.id = 'leaflet-custom-css';
        customCSS.textContent = `
          .leaflet-container {
            z-index: 1 !important;
            height: 100% !important;
            width: 100% !important;
          }
          .leaflet-control-container {
            z-index: 2 !important;
          }
          .leaflet-popup {
            z-index: 3 !important;
          }
          .leaflet-tooltip {
            z-index: 4 !important;
          }
          .leaflet-map-pane {
            z-index: 1 !important;
          }
          .leaflet-zoom-animated {
            z-index: 1 !important;
          }
          .leaflet-tile-pane {
            z-index: 1 !important;
          }
          .leaflet-overlay-pane {
            z-index: 2 !important;
          }
          .leaflet-marker-pane {
            z-index: 3 !important;
          }
          .leaflet-shadow-pane {
            z-index: 4 !important;
          }
          .leaflet-tooltip-pane {
            z-index: 5 !important;
          }
          .leaflet-popup-pane {
            z-index: 6 !important;
          }
        `;
        document.head.appendChild(customCSS);
      }

      // Load JS
      if (!window.L) {
        return new Promise((resolve) => {
          const leafletScript = document.createElement('script');
          leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          leafletScript.async = true;
          leafletScript.onload = () => {
            setTimeout(() => {
              if (mapRef.current) {
                initMap();
              }
              resolve();
            }, 200);
          };
          document.body.appendChild(leafletScript);
        });
      } else if (mapRef.current) {
        setTimeout(() => {
          initMap();
        }, 100);
      }
    };

    loadLeaflet();
  }, []);

  // Initialize map when component mounts and mapRef is available
  useEffect(() => {
    if (mapRef.current && window.L && window.L.map) {
      setTimeout(() => {
        initMap();
      }, 100);
    }

    // Cleanup function to remove map when component unmounts
    return () => {
      if (mapRef.current && window.L && mapRef.current._leaflet_id) {
        try {
          const map = window.L.DomUtil.get(mapRef.current);
          if (map && map._leaflet_id) {
            map.remove();
          }
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
    };
  }, [mapRef.current]);

  const initMap = () => {
    if (!window.L || !mapRef.current) {
      console.log('Leaflet not loaded or mapRef not available');
      return;
    }

    try {
      // Clear the container first
      mapRef.current.innerHTML = '';
      
      // Remove any existing map instance
      if (mapRef.current._leaflet_id) {
        try {
          const existingMap = window.L.DomUtil.get(mapRef.current);
          if (existingMap && existingMap._leaflet_id) {
            existingMap.remove();
          }
        } catch (e) {
          console.log('No existing map to remove');
        }
      }

      // Ensure container has proper dimensions
      mapRef.current.style.height = '256px';
      mapRef.current.style.width = '100%';
      mapRef.current.style.position = 'relative';

      // Create new map instance
      const map = window.L.map(mapRef.current, {
        center: [selectedCoords.lat, selectedCoords.lng],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true,
        tap: true,
        bounceAtZoomLimits: false
      });

      // Add tile layer with better error handling
      const tileLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 3,
        subdomains: 'abc'
      });

      tileLayer.addTo(map);

      // Create draggable marker with custom icon
      const markerIcon = window.L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = window.L.marker([selectedCoords.lat, selectedCoords.lng], { 
        draggable: true,
        title: 'Drag to set location',
        icon: markerIcon
      }).addTo(map);

      markerRef.current = marker;

      // Add popup to marker
      marker.bindPopup(`
        <div style="text-align: center; padding: 5px;">
          <strong>Your Business Location</strong><br>
          <small>Drag to adjust position</small><br>
          <small>${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}</small>
        </div>
      `).openPopup();

      // On map click, move marker and update state
      map.on('click', (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        marker.setLatLng([lat, lng]);
        marker.bindPopup(`
          <div style="text-align: center; padding: 5px;">
            <strong>Selected Location</strong><br>
            <small>Drag to adjust position</small><br>
            <small>${lat.toFixed(6)}, ${lng.toFixed(6)}</small>
          </div>
        `).openPopup();
        setSelectedCoords({ lat, lng });
        setFormData((prev) => ({ ...prev, googleMapLocation: `${lat},${lng}` }));
      });

      // On marker drag end, update state
      marker.on('dragend', (e) => {
        const lat = e.target.getLatLng().lat;
        const lng = e.target.getLatLng().lng;
        marker.bindPopup(`
          <div style="text-align: center; padding: 5px;">
            <strong>Updated Location</strong><br>
            <small>Drag to adjust position</small><br>
            <small>${lat.toFixed(6)}, ${lng.toFixed(6)}</small>
          </div>
        `).openPopup();
        setSelectedCoords({ lat, lng });
        setFormData((prev) => ({ ...prev, googleMapLocation: `${lat},${lng}` }));
      });

      // Force map to resize and render properly
      setTimeout(() => {
        map.invalidateSize();
        map.setView([selectedCoords.lat, selectedCoords.lng], 12);
      }, 300);

      // Add zoom controls to top right
      window.L.control.zoom({
        position: 'topright'
      }).addTo(map);

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  // Build the JSON object for preview and submission (move outside handleSubmit)
  const adData = useMemo(() => {
    // Helper function to get province for district
    const getProvinceForDistrict = (district) => {
      const provinceMap = {
        "Colombo": "Western", "Gampaha": "Western", "Kalutara": "Western",
        "Kandy": "Central", "Matale": "Central", "Nuwara Eliya": "Central",
        "Galle": "Southern", "Matara": "Southern", "Hambantota": "Southern",
        "Ampara": "Eastern", "Batticaloa": "Eastern", "Trincomalee": "Eastern",
        "Anuradhapura": "North Central", "Polonnaruwa": "North Central",
        "Badulla": "Uva", "Monaragala": "Uva",
        "Jaffna": "Northern", "Kilinochchi": "Northern", "Mannar": "Northern", "Mullaitivu": "Northern", "Vavuniya": "Northern",
        "Kegalle": "Sabaragamuwa", "Ratnapura": "Sabaragamuwa",
        "Kurunegala": "North Western", "Puttalam": "North Western"
      };
      return provinceMap[district] || '';
    };

    return {
      shopName: formData.restaurantName || '',
      contact: {
        address: formData.address || '',
        phone: formData.mobileNumber || '',
        whatsapp: formData.whatsapp || formData.mobileNumber || '',
        email: formData.email || '',
        website: formData.website || '',
      },
      location: {
        googleMapLocation: formData.googleMapLocation || `${selectedCoords.lat},${selectedCoords.lng}`,
        city: formData.city || '',
        district: formData.district || '',
        province: formData.state || getProvinceForDistrict(formData.district) || '',
        country: formData.country || 'Sri Lanka',
        state: formData.state || 'N/A',
      },
      business: {
        category: formData.category || '',
        specialty: formData.specialties && formData.specialties.length > 0 ? formData.specialties.slice(0, 3) : ["Sri Lankan"],
        tags: formData.specialties && formData.specialties.length > 0 ? formData.specialties : ["Traditional"],
        halalAvailable: formData.halalAvailability === 'Yes',
        description: formData.description || 'Authentic local cuisine',
        menuOptions: menuOptions.length > 0 ? menuOptions : ["Rice & Curry", "Biryani"],
      },
      schedule: {
        mon: [formData.openingTimes.monday && formData.closingTimes.monday ? `${formData.openingTimes.monday}-${formData.closingTimes.monday}` : '10:00-22:00'],
        tue: [formData.openingTimes.tuesday && formData.closingTimes.tuesday ? `${formData.openingTimes.tuesday}-${formData.closingTimes.tuesday}` : '10:00-22:00'],
        wed: [formData.openingTimes.wednesday && formData.closingTimes.wednesday ? `${formData.openingTimes.wednesday}-${formData.closingTimes.wednesday}` : '10:00-22:00'],
        thu: [formData.openingTimes.thursday && formData.closingTimes.thursday ? `${formData.openingTimes.thursday}-${formData.closingTimes.thursday}` : '10:00-22:00'],
        fri: [formData.openingTimes.friday && formData.closingTimes.friday ? `${formData.openingTimes.friday}-${formData.closingTimes.friday}` : '10:00-22:00'],
        sat: [formData.openingTimes.saturday && formData.closingTimes.saturday ? `${formData.openingTimes.saturday}-${formData.closingTimes.saturday}` : '10:00-23:00'],
        sun: [formData.openingTimes.sunday && formData.closingTimes.sunday ? `${formData.openingTimes.sunday}-${formData.closingTimes.sunday}` : '10:00-23:00'],
      },
      adSettings: {
        isTopAd: Boolean(formData.topAdd),
        isCarousalAd: Boolean(formData.carouselAdd),
        hasHalal: formData.halalAvailability === 'Yes',
      },
      videoUrl: videoUrl || 'https://example.com/video.mp4',
    };
  }, [formData, selectedCoords, menuOptions, videoUrl]);

  // Define animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.08 }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 8) {
      alert('You can only upload up to 8 images');
      return;
    }
    
    const newImages = [...formData.images, ...files];
    setFormData(prev => ({ ...prev, images: newImages }));

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreviewUrls(newPreviewUrls);
  };

  const handleSpecialtyToggle = (specialty) => {
    setSelectedSpecialties(prev => {
      if (prev.includes(specialty)) {
        return prev.filter(s => s !== specialty);
      }
      return [...prev, specialty];
    });
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({ ...prev, category }));
    if (category === 'Restaurant with Liquor' || category === 'Liquor Shops') {
      setShowLiquorWarning(true);
    } else {
      setShowLiquorWarning(false);
    }
  };

  const handleDistrictChange = (district) => {
    setFormData(prev => ({ 
      ...prev, 
      district,
      city: '' // Reset city when district changes
    }));
  };

  useEffect(() => {
    let basePrice = pricing.base; // Use dynamic base price
    if (formData.category === 'Dansal') {
      basePrice = 0; // Free for dansal
    } else if (formData.category === 'Sri Lankan Worldwide Restaurant') {
      basePrice = pricing.international; // Use international price
      if (formData.carouselAdd) basePrice += pricing.carousal; // Use dynamic add-on prices
      if (formData.topAdd) basePrice += pricing.top;
    } else {
      // Regular pricing for other categories
      if (formData.carouselAdd) basePrice += pricing.carousal;
      if (formData.topAdd) basePrice += pricing.top;
    }
    setTotalPrice(basePrice);
  }, [formData.carouselAdd, formData.topAdd, formData.category, pricing]);

  // Keep formData.specialties in sync with selectedSpecialties
  useEffect(() => {
    setFormData(prev => ({ ...prev, specialties: selectedSpecialties }));
  }, [selectedSpecialties]);

  const validateForm = () => {
    const missing = [];
    if (formData.category === 'Dansal') {
      if (!formData.restaurantName) missing.push('Dansal Name');
      if (!formData.district) missing.push('District');
      if (!formData.city) missing.push('City');
      // For dansal, these fields are in dansalForm, not formData, so skip here
    } else if (formData.category === 'Sri Lankan Worldwide Restaurant') {
      if (!formData.restaurantName) missing.push('Hotel Chain Name');
      if (!formData.country) missing.push('Country');
      if (!formData.state) missing.push('State/Province/District');
      if (!formData.city) missing.push('City');
      // Description is now optional
      if (!formData.images || formData.images.length === 0) missing.push('Images');
    } else {
      if (!formData.restaurantName) missing.push('Restaurant Name');
      if (!formData.address) missing.push('Address');
      if (!formData.mobileNumber) missing.push('Mobile Number');
      if (!formData.district) missing.push('District');
      if (!formData.city) missing.push('City');
      if (!formData.halalAvailability) missing.push('Halal Availability');
      // Description is now optional
      if (!formData.images || formData.images.length === 0) missing.push('Images');
      // Opening and closing times for all days
      ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].forEach(day => {
        if (!formData.openingTimes[day]) missing.push(`${day.charAt(0).toUpperCase()+day.slice(1)} Opening Time`);
        if (!formData.closingTimes[day]) missing.push(`${day.charAt(0).toUpperCase()+day.slice(1)} Closing Time`);
      });
    }
    return missing;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    setMissingFields([]);
    const missing = validateForm();
    if (missing.length > 0) {
      setMissingFields(missing);
      setLoading(false);
      return;
    }
    try {
      // Validate required data
      if (!adData.shopName) {
        throw new Error('Shop name is required');
      }
      if (!adData.business.category) {
        throw new Error('Category is required');
      }
      if (formData.category !== 'Dansal' && (!formData.images || formData.images.length === 0)) {
        throw new Error('At least one image is required');
      }

      // Log the JSON output for user to see
      console.log('Ad JSON to be sent:', adData);
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/ads/create`);
      console.log('Form data images count:', formData.images?.length || 0);
      console.log('Coupon code:', couponCode || 'None');

      const form = new FormData();
      
      // Add the data as JSON string - this is critical to match the CURL format
      form.append('data', JSON.stringify(adData));
      
      // Add images - each image should be appended separately
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((img) => {
          form.append('images', img);
        });
      }
      
      // Add coupon code if provided
      if (couponCode && couponCode.trim()) {
        form.append('coupon_code', couponCode.trim());
      }

      // Special handling for Dansal category - redirect to dedicated endpoint
      if (formData.category === 'Dansal') {
        setError('Please use the "Publish a Dansal" button above to create Dansal listings. Dansal has a separate dedicated form.');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('access_token') || localStorage.getItem('admin_token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ads/create`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          // Note: Don't set Content-Type for FormData - let browser set it
        },
        body: form,
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error occurred' }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      const responseData = await res.json();
      console.log('API response:', responseData);
      
      // Check if payment is required
      if (responseData.payment && responseData.payment.checkout_url) {
        setSuccess('Ad created successfully! Redirecting to payment...');
        // Store ad ID in localStorage for reference
        localStorage.setItem('pending_ad_id', responseData.adId);
        // Redirect to Stripe checkout after a short delay
        setTimeout(() => {
          window.location.href = responseData.payment.checkout_url;
        }, 1500);
      } else if (responseData.message) {
        // For free ads or already paid ads
        setSuccess(responseData.message);
        setTimeout(() => {
          // window.location.href = '/success'; // Uncomment if you have a success page
        }, 2000);
      }
      
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Error posting ad');
    } finally {
      setLoading(false);
    }
  };

  const [showDansalForm, setShowDansalForm] = useState(false);

  // Memoized endDateTimeISO for Dansal preview and submission
  const endDateTimeISO = useMemo(() => {
    if (dansalForm.date && dansalForm.time) {
      const timeRange = dansalForm.time.split('–').map(t => t.trim());
      const endTimeStr = timeRange[1] || timeRange[0] || '';
      if (!endTimeStr) return '';
      const [time, period] = endTimeStr.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours, 10);
      minutes = minutes || '00';
      if (period && period.toUpperCase().includes('PM') && hours < 12) hours += 12;
      if (period && period.toUpperCase().includes('AM') && hours === 12) hours = 0;
      const pad = n => n.toString().padStart(2, '0');
      return `${dansalForm.date}T${pad(hours)}:${pad(minutes)}:00`;
    }
    return '';
  }, [dansalForm.date, dansalForm.time]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center max-w-sm w-full">
          <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-2.21 0-4 1.79-4 4v1h8v-1c0-2.21-1.79-4-4-4z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">Login Required</h2>
          <p className="text-gray-600 mb-6 text-center">You must be logged in to post an ad. Please login to continue.</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition-all"
            onClick={() => window.location.href = '/(login)/login'}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-100 flex items-center justify-center p-4 pt-24 ${poppins.className}`} style={{ position: 'relative', zIndex: 0 }}>
      <motion.div
        className="bg-white rounded-2xl shadow-lg w-full max-w-4xl overflow-hidden relative"
        style={{ zIndex: 1 }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top bar with Dansal button only */}
        <div className="w-full flex items-center justify-end mt-6 mb-2 px-6 md:px-10 lg:px-12">
          {!showDansalForm && (
            <button
              className="font-semibold py-2 px-4 rounded-full shadow transition-all text-sm flex items-center gap-2"
              style={{
                background: 'linear-gradient(90deg, #2563eb 0%, #fde047 25%, #ef4444 50%, #fff 75%, #fb923c 100%)',
                color: '#222',
                border: '1px solid #e5e7eb',
              }}
              onClick={() => setShowDansalForm(true)}
              type="button"
            >
              Publish a Dansal
            </button>
          )}
        </div>
        {/* Dansal Form */}
        {showDansalForm ? (
          <motion.div 
            className="p-6 md:p-10 lg:p-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-emerald-700">Dansal Creation</h1>
              <button
                className="text-gray-500 hover:text-gray-900 font-semibold text-sm border border-gray-300 rounded px-3 py-1"
                onClick={() => setShowDansalForm(false)}
                type="button"
              >
                ← Back to Ad Posting
              </button>
            </div>
            <div className="w-full flex flex-col items-center justify-center mb-4">
              {/* Removed quote and badge, only show green Total Price box below */}
              
            </div>
            <form onSubmit={handleDansalSubmit} className="space-y-6">
              {/* Total Price Box for Dansal */}
              <div className="p-6 sm:p-8 rounded-2xl border bg-gradient-to-r from-green-200 via-green-50 to-green-100 border-green-300 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
  <div className="flex items-center gap-4">
    <span className="text-3xl text-green-600 hover:scale-105 transition-transform duration-300">
      <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    </span>
    <span className="text-xl sm:text-2xl font-semibold text-green-900">Total Price</span>
  </div>

  <span className="text-3xl font-extrabold text-green-700">FREE</span>

  <div className="w-full sm:w-auto text-center sm:text-left">
    <span className="text-sm sm:text-base text-green-700 block">
      Your charitable contribution! Dansal listings are free to support community service.
    </span>
  </div>
</div>


              <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={itemVariants}>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">DANSAL NAME*</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-gray-800"
                    value={dansalForm.title}
                    onChange={e => setDansalForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">FOOD TYPE*</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-gray-800"
                    value={dansalForm.foodType}
                    onChange={e => setDansalForm(prev => ({ ...prev, foodType: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">DISTRICT*</label>
                  <select
                    required
                    className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-gray-800"
                    value={dansalForm.location.district}
                    onChange={e => setDansalForm(prev => ({ ...prev, location: { ...prev.location, district: e.target.value, city: '' } }))}
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">CITY*</label>
                  <select
                    required
                    className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-gray-800"
                    value={dansalForm.location.city}
                    onChange={e => setDansalForm(prev => ({ ...prev, location: { ...prev.location, city: e.target.value } }))}
                  >
                    <option value="">Select City</option>
                    {cities[dansalForm.location.district]?.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">DATE*</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-gray-800"
                    value={dansalForm.date}
                    onChange={e => setDansalForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">TIME (e.g. 6:00 PM – 10:00 PM)*</label>
                  <input
                    type="text"
                    required
                    placeholder="6:00 PM – 10:00 PM"
                    className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-gray-800"
                    value={dansalForm.time}
                    onChange={e => setDansalForm(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </motion.div>
              {/* Organizer Info */}
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={itemVariants}>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">ORGANIZER NAME*</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-gray-800"
                    value={dansalForm.organizer.name}
                    onChange={e => setDansalForm(prev => ({ ...prev, organizer: { ...prev.organizer, name: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">ORGANIZER PHONE*</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-gray-800"
                    value={dansalForm.organizer.phone}
                    onChange={e => setDansalForm(prev => ({ ...prev, organizer: { ...prev.organizer, phone: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">ORGANIZER WHATSAPP</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-gray-800"
                    value={dansalForm.organizer.whatsapp}
                    onChange={e => setDansalForm(prev => ({ ...prev, organizer: { ...prev.organizer, whatsapp: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">ORGANIZER EMAIL</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-gray-800"
                    value={dansalForm.organizer.email}
                    onChange={e => setDansalForm(prev => ({ ...prev, organizer: { ...prev.organizer, email: e.target.value } }))}
                  />
                </div>
              </motion.div>
              {/* Description */}
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-medium text-gray-500 mb-1">DESCRIPTION*</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-gray-800"
                  value={dansalForm.description}
                  onChange={e => setDansalForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </motion.div>
              {/* Image Upload */}
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-medium text-gray-500 mb-1">ADD IMAGES (MAX 8)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleDansalImageUpload}
                  className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-gray-800"
                />
                <p className="text-sm text-gray-500">{dansalForm.images.length} images uploaded (Max 8)</p>
                {dansalImagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    {dansalImagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeDansalImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
              {/* Submit Button */}
              <motion.button
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold mb-4 hover:bg-emerald-700 transition-all"
                variants={itemVariants}
                whileHover={{ scale: 1.02, backgroundColor: "#059669" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                type="submit"
                disabled={dansalLoading}
              >
                {dansalLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Dansal'
                )}
              </motion.button>
              {/* Success/Error */}
              {dansalSuccess && (
                <motion.div 
                  className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 mt-2 text-green-800 font-semibold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >{dansalSuccess}</motion.div>
              )}
              {dansalError && (
                <motion.div 
                  className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 mt-2 text-red-800 font-semibold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >{dansalError}</motion.div>
              )}
            </form>
          </motion.div>
        ) : (
        // Form Section */}
        <motion.div 
          className="p-6 md:p-10 lg:p-12"
          variants={containerVariants}
        >
          <motion.h1 className="text-4xl font-bold text-gray-900 mb-2" variants={itemVariants}>
            Add Your Business
          </motion.h1>
          <motion.p className="text-gray-600 mb-8" variants={itemVariants}>
            Let's get your business listed on Kochchibazaar
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <motion.div className="space-y-4" variants={itemVariants}>
              <label className="block text-xs font-medium text-gray-500 mb-1">SELECT CATEGORY*</label>
              <select
                required
                className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "Sri Lankan Worldwide Restaurant" ? "Sri Lankan Restaurant Worldwide" : category}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Liquor Warning */}
            {showLiquorWarning && (
              <motion.div 
                className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Please be advised that selling liquor requires the appropriate licenses as mandated by local, state, and federal laws. Our website and company are not responsible for ensuring that individuals or businesses have the necessary licenses to sell liquor. It is the sole responsibility of the seller to comply with all applicable regulations. Failure to obtain the required licenses may result in legal consequences. We strongly recommend consulting with legal professionals to ensure compliance with all relevant laws.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Basic Information */}
            <motion.div className="space-y-4" variants={itemVariants}>
              {formData.category === 'Dansal' ? (
                // Dansal Layout
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">DANSAL NAME*</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                      value={formData.restaurantName}
                      onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">DISTRICT*</label>
                    <select
                      required
                      className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                      value={formData.district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                    >
                      <option value="">Select District</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">CITY*</label>
                    <select
                      required
                      className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    >
                      <option value="">Select City</option>
                      {cities[formData.district]?.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : formData.category === 'Sri Lankan Worldwide Restaurant' ? (
                // Worldwide Restaurant Layout
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">HOTEL CHAIN NAME*</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                      value={formData.restaurantName}
                      onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">COUNTRY*</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                      value={formData.country || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">STATE/PROVINCE/DISTRICT*</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                      value={formData.state || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">CITY*</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                // Regular Restaurant Layout
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">RESTAURANT NAME*</label>
                    <input
                      type="text"
                      required
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800${missingFields.includes('Restaurant Name') || missingFields.includes('Dansal Name') || missingFields.includes('Hotel Chain Name') ? ' border-red-500 focus:ring-red-200' : ''}`}
                      value={formData.restaurantName}
                      onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">ADDRESS*</label>
                    <input
                      type="text"
                      required
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800${missingFields.includes('Address') ? ' border-red-500 focus:ring-red-200' : ''}`}
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Contact Information */}
            {formData.category !== 'Dansal' && (
              <motion.div className="space-y-4" variants={itemVariants}>
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">MOBILE NUMBER*</label>
                    <input
                      type="tel"
                      required
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800${missingFields.includes('Mobile Number') ? ' border-red-500 focus:ring-red-200' : ''}`}
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">WHATSAPP</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">EMAIL</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">WEBSITE</label>
                    <input
                      type="url"
                      className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Location Information */}
            {formData.category !== 'Dansal' && formData.category !== 'Sri Lankan Worldwide Restaurant' && (
              <motion.div className="space-y-4" variants={itemVariants}>
                <h3 className="text-lg font-semibold text-gray-900">Location Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">GOOGLE MAP LOCATION*</label>
                    <div className="w-full h-64 rounded-xl overflow-hidden border mb-2 relative bg-gray-50">
                      <div 
                        ref={mapRef} 
                        style={{ 
                          width: '100%', 
                          height: '256px',
                          position: 'relative',
                          zIndex: 1,
                          backgroundColor: '#f8fafc'
                        }} 
                        className="leaflet-map-container"
                      />
                      <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs text-gray-600 shadow-sm">
                        Click map or drag marker to set location
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (mapRef.current) {
                            // Clear the container
                            mapRef.current.innerHTML = '';
                            // Reinitialize the map after a short delay
                            setTimeout(() => {
                              initMap();
                            }, 100);
                          }
                        }}
                        className="absolute top-2 right-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-2 text-gray-600 shadow-sm transition-colors duration-200"
                        title="Refresh map"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                      </button>
                    </div>
                    <div className="text-xs text-gray-700 mt-1">
                      Click on the map or drag the marker to select your location.<br />
                      <span className="font-semibold">Selected Coordinates:</span> {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}
                    </div>
                    <input
                      type="hidden"
                      value={formData.googleMapLocation}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">DISTRICT*</label>
                    <select
                      required
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800${missingFields.includes('District') ? ' border-red-500 focus:ring-red-200' : ''}`}
                      value={formData.district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                    >
                      <option value="">Select District</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">CITY*</label>
                    <select
                      required
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800${missingFields.includes('City') ? ' border-red-500 focus:ring-red-200' : ''}`}
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    >
                      <option value="">Select City</option>
                      {cities[formData.district]?.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">HALAL AVAILABILITY*</label>
                    <select
                      required
                      className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800${missingFields.includes('Halal Availability') ? ' border-red-500 focus:ring-red-200' : ''}`}
                      value={formData.halalAvailability}
                      onChange={(e) => setFormData(prev => ({ ...prev, halalAvailability: e.target.value }))}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Opening Hours */}
            {formData.category !== 'Dansal' && (
              <>
                <motion.div className="mb-4" variants={itemVariants}>
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl flex items-start gap-3">
                    <svg className="h-6 w-6 text-red-400 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-red-800 text-sm">
                      <p className="font-semibold mb-1">Important:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>For establishments operating on a <span className="font-semibold">24-hour basis</span>, please record the <span className="font-semibold">opening time as 00:00</span> and the <span className="font-semibold">closing time as 23:00</span>.</li>
                        <li>In cases where the establishment is <span className="font-semibold">permanently closed on a particular day of the week</span>, kindly input <span className="font-semibold">00:00 as the opening time</span> and <span className="font-semibold">00:00 as the closing time</span> for that specific day.</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
                <motion.div className="space-y-4" variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-gray-900">Opening Hours</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="space-y-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{day} OPENING TIME*</label>
                        <select
                          required
                          className={`w-full px-2 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800 text-sm${missingFields.includes(`${day.charAt(0).toUpperCase()+day.slice(1)} Opening Time`) ? ' border-red-500 focus:ring-red-200' : ''}`}
                          value={formData.openingTimes[day]}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            openingTimes: { ...prev.openingTimes, [day]: e.target.value }
                          }))}
                        >
                          <option value="">Time</option>
                          {timeOptions.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </motion.div>
                <motion.div className="space-y-4 mt-8" variants={itemVariants}>
                  <h3 className="text-lg font-semibold text-gray-900">Closing Hours</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="space-y-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{day} CLOSING TIME*</label>
                        <select
                          required
                          className={`w-full px-2 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800 text-sm${missingFields.includes(`${day.charAt(0).toUpperCase()+day.slice(1)} Closing Time`) ? ' border-red-500 focus:ring-red-200' : ''}`}
                          value={formData.closingTimes[day]}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            closingTimes: { ...prev.closingTimes, [day]: e.target.value }
                          }))}
                        >
                          <option value="">Time</option>
                          {timeOptions.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}

            {/* Description */}
            {formData.category !== 'Dansal' && (
              <motion.div className="space-y-4" variants={itemVariants}>
                <label className="block text-xs font-medium text-gray-500 mb-1">DESCRIPTION*</label>
                <textarea
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800${missingFields.includes('Description') ? ' border-red-500 focus:ring-red-200' : ''}`}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </motion.div>
            )}

            {/* Image Upload and Preview */}
            {formData.category !== 'Dansal' && (
              <motion.div className="space-y-4" variants={itemVariants}>
                <label className="block text-xs font-medium text-gray-500 mb-1">ADD IMAGES (MAX 8)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800${missingFields.includes('Images') ? ' border-red-500 focus:ring-red-200' : ''}`}
                />
                <p className="text-sm text-gray-500">
                  {formData.images.length} images uploaded (Max 8)
                </p>
                
                {/* Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Menu Options */}
            {formData.category !== 'Dansal' && (
              <motion.div className="space-y-4" variants={itemVariants}>
                <label className="block text-xs font-medium text-gray-500 mb-1">MENU OPTIONS (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Rice & Curry, Biryani, Kottu (separate with commas)"
                  className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                  value={menuOptions.join(', ')}
                  onChange={(e) => {
                    const options = e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
                    setMenuOptions(options);
                  }}
                />
                <p className="text-sm text-gray-500">
                  List your popular menu items separated by commas.
                </p>
              </motion.div>
            )}

            {/* Video URL */}
            {formData.category !== 'Dansal' && (
              <motion.div className="space-y-4" variants={itemVariants}>
                <label className="block text-xs font-medium text-gray-500 mb-1">VIDEO URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/your-restaurant-video.mp4"
                  className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Add a promotional video URL to showcase your business.
                </p>
              </motion.div>
            )}

            {/* Specialties Selection (for Restaurants) */}
            {formData.category === 'Restaurant' && (
              <motion.div className="space-y-4" variants={itemVariants}>
                <label className="block text-xs font-medium text-gray-500 mb-1">SELECT SPECIALTIES</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {specialties.map(specialty => (
                    <div key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        id={specialty}
                        checked={selectedSpecialties.includes(specialty)}
                        onChange={() => handleSpecialtyToggle(specialty)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={specialty} className="ml-2 block text-sm text-gray-700">
                        {specialty}
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Optional Add-ons with Creative Design */}
            {formData.category !== 'Dansal' && (
              <motion.div className="space-y-6" variants={itemVariants}>
                <h3 className="text-lg font-semibold text-gray-900">Premium Add-ons <small  className="text-xs text-gr
                ay-700">   (Optional)</small></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Carousel Add - Premium Option */}
                  <motion.div 
                    className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      formData.carouselAdd 
                        ? 'border-amber-600 bg-amber-50' 
                        : 'border-gray-200 bg-white hover:border-amber-400'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, carouselAdd: !prev.carouselAdd }))}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${formData.carouselAdd ? 'bg-amber-600' : 'bg-gray-100'}`}>
                          <FaImages className={`text-xl ${formData.carouselAdd ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Carousel Add</h4>
                          <p className="text-2xl font-bold text-amber-600">
                            Rs. {formData.category === 'Sri Lankan Worldwide Restaurant' ? dollarsToRupees(pricing.carousal) : dollarsToRupees(pricing.carousal)}
                            <span className="ml-2 text-base text-gray-500">(${pricing.carousal})</span>
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.carouselAdd}
                        onChange={() => setFormData(prev => ({ ...prev, carouselAdd: !prev.carouselAdd }))}
                        className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="space-y-2">
                     
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCheckCircle className="text-emerald-600" />
                        <span>Featured at the top of the front page</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCheckCircle className="text-emerald-600" />
                        <span>Higher click-through rate</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCheckCircle className="text-emerald-600" />
                        <span>More attractive display to customers</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCheckCircle className="text-emerald-600" />
                        <span>Rotating banner placement</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Top Add - Standard Option */}
                  <motion.div 
                    className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      formData.topAdd 
                        ? 'border-slate-700 bg-slate-50' 
                        : 'border-gray-200 bg-white hover:border-slate-500'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, topAdd: !prev.topAdd }))}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${formData.topAdd ? 'bg-slate-700' : 'bg-gray-100'}`}>
                          <FaArrowUp className={`text-xl ${formData.topAdd ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Top Add</h4>
                          <p className="text-2xl font-bold text-slate-700">
                            Rs. {formData.category === 'Sri Lankan Worldwide Restaurant' ? dollarsToRupees(pricing.top) : dollarsToRupees(pricing.top)}
                            <span className="ml-2 text-base text-gray-500">(${(pricing.top)})</span>
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.topAdd}
                        onChange={() => setFormData(prev => ({ ...prev, topAdd: !prev.topAdd }))}
                        className="h-5 w-5 text-slate-700 focus:ring-slate-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCheckCircle className="text-emerald-600" />
                        <span>Display at the front of the page</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCheckCircle className="text-emerald-600" />
                        <span>Priority placement in search results</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCheckCircle className="text-emerald-600" />
                        <span>Increased visibility to customers</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Coupon Code */}
            {formData.category !== 'Dansal' && (
              <motion.div className="space-y-4" variants={itemVariants}>
                <label className="block text-xs font-medium text-gray-500 mb-1">COUPON CODE (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter coupon code if you have one"
                  className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-800"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Have a discount coupon? Enter it here to get reduced pricing.
                </p>
              </motion.div>
            )}

            {/* Total Price */}
            <motion.div 
              className={`p-6 rounded-xl border ${
                formData.category === 'Dansal' 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-gradient-to-r from-slate-50 to-amber-50 border-slate-300'
              }`}
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaStar className={`text-xl ${
                    formData.category === 'Dansal' ? 'text-emerald-600' : 'text-amber-600'
                  }`} />
                  <h3 className="text-lg font-semibold text-gray-900">Total Price</h3>
                </div>
                <p className={`text-3xl font-bold ${
                  formData.category === 'Dansal' ? 'text-emerald-700' : 'text-slate-800'
                }`}>
                  {formData.category === 'Dansal' ? 'FREE' : `Rs. ${dollarsToRupees(totalPrice)}`}
                  {formData.category !== 'Dansal' && (
                    <span className="ml-2 text-lg text-gray-500">(${(totalPrice)})</span>
                  )}
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {formData.category === 'Dansal' 
                  ? "Thank you for your charitable contribution! Dansal listings are free to support community service."
                  : formData.topAdd && formData.carouselAdd 
                  ? "You've selected both premium add-ons for maximum visibility!"
                  : formData.topAdd || formData.carouselAdd
                  ? "Great choice! Your business will stand out from the crowd."
                  : "Add premium features to boost your business visibility."
                }
              </p>
            </motion.div>

            {/* Submit Button */}
            <motion.button 
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold mb-4"
              variants={itemVariants}
              whileHover={{ scale: 1.02, backgroundColor: "#333" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                'Submit'
              )}
            </motion.button>
            
            {/* Success Message */}
            {success && (
              <motion.div 
                className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-800 font-semibold">{success}</p>
                    {success.includes('Redirecting to payment') && (
                      <p className="text-green-600 text-sm mt-1">
                        Please complete your payment to activate your ad listing.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Error Message */}
            {error && (
              <motion.div 
                className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-red-800 font-semibold">Error</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
            {missingFields.length > 0 && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  <span className="text-red-700 font-semibold">Please fill in the following required fields:</span>
                </div>
                <ul className="list-disc pl-6">
                  {missingFields.map((field, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-red-600 text-sm">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>


        </motion.div>
        )}
      </motion.div>
      {/* Toast Notification */}
      {showToast && <Toast message={toastMessage} />}
    </div>
  );
}

export default Page;
