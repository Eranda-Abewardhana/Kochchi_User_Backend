import React, { useState, useEffect } from 'react';
import { FaBell, FaTrash } from 'react-icons/fa';

function NotificationManagement() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState('');

  // Fetch notifications
  const fetchNotifications = async () => {
    setNotifLoading(true);
    setNotifError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/`, {
        headers: { accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      setNotifError(err.message);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    const token = localStorage.getItem('admin_token');
    const body = new URLSearchParams();
    body.append('title', title);
    body.append('description', description);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      if (!res.ok) throw new Error('Failed to create notification');
      setSuccess('Notification sent successfully!');
      setTitle('');
      setDescription('');
      fetchNotifications();
    } catch (err) {
      setError(err.message || 'Error sending notification');
    } finally {
      setLoading(false);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete notification');
      fetchNotifications();
    } catch (err) {
      alert(err.message || 'Error deleting notification');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Notification Management</h2>
        <p className="text-gray-600 mt-1">Send and manage user notifications</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-2xl border-2 border-blue-300 shadow-xl p-8 mb-8 max-w-lg mx-auto space-y-6">
        <div>
          <label className="block text-md font-semibold text-gray-900 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="mt-1 block w-full border border-blue-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 text-gray-900 px-4 py-3 text-lg transition-all"
            placeholder="Notification title"
          />
        </div>
        <div>
          <label className="block text-md font-semibold text-gray-900 mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            className="mt-1 block w-full border border-blue-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 text-gray-900 px-4 py-3 text-lg transition-all"
            placeholder="Notification description"
            rows={4}
          />
        </div>
        {success && <div className="text-green-600 text-sm">{success}</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-md flex items-center gap-2 transition-all duration-200 w-full"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
      <div className="max-w-2xl mx-auto mt-10">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><FaBell className="text-blue-500" /> Uploaded Notifications</h3>
        {notifLoading ? (
          <div className="text-center py-8 text-lg">Loading notifications...</div>
        ) : notifError ? (
          <div className="text-center py-8 text-red-600">{notifError}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No notifications found.</div>
        ) : (
          <div className="space-y-4">
            {notifications.map((noti) => (
              <div key={noti.id} className="bg-white rounded-xl shadow border-l-4 border-blue-500 p-4 flex items-start gap-4 relative group">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shadow">
                    <FaBell className="text-blue-500 text-xl" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{noti.title}</h4>
                  <p className="text-gray-700 mb-1">{noti.description}</p>
                  <div className="text-xs text-gray-400">{new Date(noti.createdAt).toLocaleString()}</div>
                </div>
                <button
                  className="ml-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-xs"
                  title="Delete Notification"
                  onClick={() => handleDeleteNotification(noti.id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationManagement; 