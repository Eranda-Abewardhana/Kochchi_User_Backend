import React, { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

function PopupAdsManagement({ popupAds, handleDeletePopupAd, onPopupAdAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('title', title);
    if (image) formData.append('images', image);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/popup-ads/create`, {
        method: 'POST',
        body: formData,
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to create popup ad');
      setTitle('');
      setImage(null);
      setShowForm(false);
      if (onPopupAdAdded) onPopupAdAdded();
    } catch (err) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 max-w-full sm:max-w-3xl w-full mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Popup Ad Management</h2>
        <p className="text-gray-600 text-sm sm:text-base mt-1">Manage promotional popup advertisements</p>
      </div>
      <div className="space-y-4 max-w-full sm:max-w-3xl w-full mx-auto">
        {popupAds.map((ad) => (
          <div key={ad.id} className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 bg-white rounded-xl border hover:shadow-md transition-shadow w-full gap-4">
            <div className="flex items-center gap-4 w-full">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {ad.image_url ? (
                  <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500 text-xs sm:text-sm">No Image</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 break-words text-sm sm:text-base">{ad.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Popup Advertisement</p>
              </div>
            </div>
            <button 
              onClick={() => handleDeletePopupAd(ad.id)} 
              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 sm:p-3 rounded-lg transition-colors ml-0 sm:ml-4"
            >
              <FaTrash />
            </button>
          </div>
        ))}
        <div className="mt-6 w-full">
          <button
            type="button"
            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm sm:text-base"
            onClick={() => setShowForm((v) => !v)}
          >
            <FaPlus className="mx-auto mb-2 text-xl sm:text-2xl" />
            <div className="font-semibold">Add New Popup Ad</div>
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleFormSubmit} className="mt-4 bg-white p-6 rounded-xl border space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                required
                className="mt-1 block w-full"
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Popup Ad'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default PopupAdsManagement; 