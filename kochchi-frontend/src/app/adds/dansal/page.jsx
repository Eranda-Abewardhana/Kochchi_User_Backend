'use client'
import React, { useEffect, useState } from 'react';

const Page = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDansal = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dansal/all`);
        if (!res.ok) throw new Error('Failed to fetch dansal events');
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError(err.message || 'Error fetching dansal events');
      } finally {
        setLoading(false);
      }
    };
    fetchDansal();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-emerald-50 py-10 px-2 md:px-8 pt-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text">
            <h1 className="text-5xl md:text-6xl font-black text-transparent mb-3">
              Dansal Events
            </h1>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-4 rounded-full"></div>
          <p className="text-xl text-gray-800 max-w-2xl mx-auto leading-relaxed font-medium">
            Discover free food events happening near you during the festive season!
          </p>
        </div>
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-emerald-700 font-semibold">Loading events...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 text-center mb-6">
            {error}
          </div>
        )}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col border-2 border-emerald-100 hover:border-emerald-300"
            >
              {event.images && event.images[0] && (
                <img
                  src={event.images[0]}
                  alt={event.title}
                  className="w-full h-48 object-cover object-center"
                  loading="lazy"
                />
              )}
              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-2xl font-bold text-emerald-800 mb-1 flex items-center gap-2">
                 {event.title}
                </h2>
                <div className="flex flex-wrap gap-2 mb-2 text-sm">
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                    {event.foodType}
                  </span>
                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                    {new Date(event.date).toLocaleDateString()} {event.time}
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                    {event.location.city}, {event.location.district}
                  </span>
                </div>
                <p className="text-gray-700 mb-3 line-clamp-3">{event.description}</p>
                <div className="mt-auto flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-semibold">Organizer:</span>
                  <span>{event.organizer?.name}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                  {event.organizer?.phone && <span>📞 {event.organizer.phone}</span>}
                  {event.organizer?.whatsapp && <span>💬 {event.organizer.whatsapp}</span>}
                  {event.organizer?.email && <span>✉️ {event.organizer.email}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {!loading && events.length === 0 && !error && (
          <div className="text-center text-gray-500 py-20 text-lg">No dansal events found at the moment. Please check back later!</div>
        )}
      </div>
    </div>
  );
};

export default Page;
