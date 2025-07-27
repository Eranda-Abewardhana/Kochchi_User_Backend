import React, { useEffect, useState } from 'react';
import AdvertisementCard from './AdvertisementCard';

function Topaddcontainer() {
  const [topAds, setTopAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    async function fetchTopAds() {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ads/filter`);
        const data = await res.json();
        // If the API returns an array, filter here. If it returns an object with ads, adjust accordingly.
        const filtered = Array.isArray(data)
          ? data.filter(ad => ad.isTopAd)
          : (data.ads || []).filter(ad => ad.isTopAd);
        setTopAds(filtered);
      } catch (error) {
        setTopAds([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTopAds();
  }, []);

  // Helper function to determine if the restaurant is open now
  function isOpenNow(ad) {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const now = new Date();
    const dayKey = `schedule_${days[now.getDay()]}`;
    const schedule = ad[dayKey];
    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) return false;

    // Assume only one time range per day for simplicity
    const [openTime, closeTime] = schedule[0].split('-');
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    const open = new Date(now);
    open.setHours(openHour, openMinute, 0, 0);

    const close = new Date(now);
    close.setHours(closeHour, closeMinute, 0, 0);

    // Handle overnight (e.g., 22:00-02:00)
    if (close < open) {
      if (now >= open) return true;
      close.setDate(close.getDate() + 1);
      return now <= close;
    }

    return now >= open && now <= close;
  }

  if (!isClient) return null;

  return (
    <div className="top-ads-container" style={{ padding: '2rem 0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.8rem', fontSize: '2.5rem', fontWeight: 800, letterSpacing: '1px' }}>Discover the Hottest Restaurant in Town!</h2>
      {loading ? (
        <div className="top-ads-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <div className="spinner" style={{ width: 60, height: 60, border: '6px solid #eee', borderTop: '6px solid #0070f3', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="top-ads-list" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {topAds.length === 0 ? (
            <div>No top ads found.</div>
          ) : (
            topAds.map(ad => (
              <div
                key={ad.ad_id}
                className="top-ad-card"
                style={{
                  width: 300,
                  background: 'white',
                  borderRadius: 16,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  transition: 'transform 0.3s',
                  animation: 'fadeInUp 0.7s',
                  marginBottom: '1rem',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                onClick={() => setSelectedAd(ad)}
              >
                {/* Image and rest of the card */}
                <img
                  src={ad.image_url || (ad.images && ad.images[0]) || '/placeholder-image.jpg'}
                  alt={ad.title}
                  style={{ width: '100%', height: 180, objectFit: 'cover' }}
                />
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1a1a1a', textShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>{ad.title}</h3>
                    {(ad.business_halalAvailable || ad.hasHalal) && (
                      <span style={{
                        background: '#4caf50',
                        color: 'white',
                        borderRadius: 12,
                        padding: '2px 12px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        marginLeft: '0.5rem',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                        whiteSpace: 'nowrap',
                      }}>Halal</span>
                    )}
                  </div>
                  {/* Open/Close chip below title */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{
                      background: isOpenNow(ad) ? '#388e3c' : '#d32f2f',
                      color: 'white',
                      borderRadius: 12,
                      padding: '2px 12px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      whiteSpace: 'nowrap',
                    }}>
                      {isOpenNow(ad) ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <div style={{ color: '#666', fontSize: '0.95rem', margin: '0.5rem 0' }}>{ad.shopName}</div>
                  <div style={{ color: '#0070f3', fontWeight: 500 }}>{ad.location_city}, {ad.location_district}</div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#444' }}>{ad.business_description?.slice(0, 60)}...</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {selectedAd && (
        <AdvertisementCard ad={selectedAd} onClose={() => setSelectedAd(null)} />
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Topaddcontainer;
