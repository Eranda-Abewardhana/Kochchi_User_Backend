'use client'
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell } from 'react-icons/fa';

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('https://api.kochchibazaar.lk/api/notifications/', {
          headers: { accept: 'application/json' },
        });
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-2 sm:px-6 lg:px-12">
      <div className="max-w-3xl mx-auto mt-24">
        <div className="flex items-center gap-3 mb-10">
          <FaBell className="text-blue-600 text-3xl" />
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-blue-700 text-lg font-medium">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-md mx-auto">
            <p className="text-red-700">Error: {error}</p>
            <p className="text-sm text-red-600 mt-2">Please try again later.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <FaBell className="text-5xl text-blue-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No notifications yet</h2>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {notifications.map((noti, idx) => (
                <motion.div
                  key={noti.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.4, delay: idx * 0.07 }}
                  className="relative bg-white rounded-2xl shadow-lg border-l-8 border-blue-500 p-6 flex items-start gap-4 hover:shadow-2xl transition-shadow group"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shadow">
                      <FaBell className="text-blue-500 text-2xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{noti.title}</h3>
                    <p className="text-gray-700 mb-2">{noti.description}</p>
                    <div className="text-xs text-gray-400">{new Date(noti.createdAt).toLocaleString()}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationPage;
