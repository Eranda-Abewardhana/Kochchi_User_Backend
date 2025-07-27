import React, { useState, useEffect } from 'react';
import { FaHourglassHalf, FaCheck, FaTimes, FaEye, FaSpinner } from 'react-icons/fa';
import AdMiniCard from '../../(components)/AdMiniCard';
import AdvertisementCard from '../../(components)/AdvertisementCard';

function PendingAds() {
  const [pendingAds, setPendingAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);
  const [showAdDetails, setShowAdDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveComment, setApproveComment] = useState('');
  const [approvingAdId, setApprovingAdId] = useState(null);

  // Fetch pending ads from API
  const fetchPendingAds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ads/pending`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPendingAds(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching pending ads:', err);
      setError('Failed to fetch pending ads. Please try again.');
      setPendingAds([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle approve button click - show comment modal
  const handleApproveClick = (adId) => {
    setApprovingAdId(adId);
    setApproveComment('');
    setShowApproveModal(true);
  };

  // Handle approve with comment
  const handleApproveWithComment = async () => {
    if (!approvingAdId) return;
    
    try {
      setActionLoading(true);
      
      const requestBody = `status=approved&comment=${encodeURIComponent(approveComment || 'Ad approved by admin')}`;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ads/${approvingAdId}/approve`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: requestBody
      });

      if (!response.ok) {
        throw new Error('Failed to approve ad');
      }

      // Remove the ad from pending list
      setPendingAds(prev => prev.filter(ad => ad.id !== approvingAdId));
      
      // Close modal and reset
      setShowApproveModal(false);
      setApprovingAdId(null);
      setApproveComment('');
      
      console.log('Ad approved successfully');
      
    } catch (err) {
      console.error('Error approving ad:', err);
      alert('Failed to approve ad. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Approve or reject an ad
  const handleAdAction = async (adId, action) => {
    try {
      setActionLoading(true);
      
      let requestBody = '';
      
      if (action === 'approve') {
        // For approval, send status=approved and comment
        requestBody = `status=approved&comment=Ad approved by admin`;
      } else if (action === 'reject') {
        // For rejection, send status=rejected and comment
        requestBody = `status=rejected&comment=Ad rejected by admin`;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ads/${adId}/${action}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: requestBody
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} ad`);
      }

      // Remove the ad from pending list
      setPendingAds(prev => prev.filter(ad => ad.id !== adId));
      
      // Show success message (you can implement a toast notification here)
      console.log(`Ad ${action}ed successfully`);
      
    } catch (err) {
      console.error(`Error ${action}ing ad:`, err);
      alert(`Failed to ${action} ad. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  // View ad details using AdvertisementCard
  const handleViewAd = (ad) => {
    setSelectedAd(ad);
    setShowAdDetails(true);
  };

  // Close ad details
  const handleCloseAdDetails = () => {
    setShowAdDetails(false);
    setSelectedAd(null);
  };

  useEffect(() => {
    fetchPendingAds();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading pending ads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={fetchPendingAds}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FaHourglassHalf className="text-2xl text-orange-600" />
          <h2 className="text-3xl font-bold text-gray-800">Pending Ads</h2>
        </div>
        <p className="text-gray-700">Review and approve or reject advertisement submissions</p>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Total Pending: <span className="font-semibold text-orange-700">{pendingAds.length}</span>
          </span>
          <button
            onClick={fetchPendingAds}
            className="text-sm text-blue-600 hover:text-blue-700 underline font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Pending Ads Grid */}
      {pendingAds.length === 0 ? (
        <div className="text-center py-16">
          <FaHourglassHalf className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Pending Ads</h3>
          <p className="text-gray-500">All advertisements have been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingAds.map((ad) => (
            <div key={ad.id || ad.ad_id} className="relative group">
              {/* Action buttons overlay */}
              <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                               <div className="flex gap-2">
                 <button
                   onClick={() => handleViewAd(ad)}
                   className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
                   title="View Details"
                 >
                   <FaEye className="text-sm" />
                 </button>
                 <button
                   onClick={() => handleAdAction(ad.id || ad.ad_id, 'approve')}
                   disabled={actionLoading}
                   className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
                   title="Approve"
                 >
                   <FaCheck className="text-sm" />
                 </button>
                 <button
                   onClick={() => handleAdAction(ad.id || ad.ad_id, 'reject')}
                   disabled={actionLoading}
                   className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
                   title="Reject"
                 >
                   <FaTimes className="text-sm" />
                 </button>
               </div>
              </div>

                             {/* Pending status badge */}
               

              <AdMiniCard 
                ad={ad} 
                onClick={() => handleViewAd(ad)}
              />
            </div>
          ))}
        </div>
      )}

            {/* Ad Details using AdvertisementCard */}
      {showAdDetails && selectedAd && (
        <div className="fixed inset-0 z-50">
          <AdvertisementCard 
            ad={selectedAd} 
            onClose={handleCloseAdDetails}
          />
          
          {/* Admin Action Buttons Overlay */}
          <div className="fixed top-6 left-6 z-60 flex gap-3">
            <button
              onClick={() => {
                handleAdAction(selectedAd.id || selectedAd.ad_id, 'reject');
                handleCloseAdDetails();
              }}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 font-medium shadow-lg flex items-center gap-2"
            >
              <FaTimes className="text-sm" />
              Reject Ad
            </button>
            <button
              onClick={() => {
                handleApproveClick(selectedAd.id || selectedAd.ad_id);
                handleCloseAdDetails();
              }}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 font-medium shadow-lg flex items-center gap-2"
            >
              <FaCheck className="text-sm" />
              Approve Ad
            </button>
          </div>
        </div>
      )}

      {/* Approve Comment Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Approve Advertisement</h3>
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setApprovingAdId(null);
                  setApproveComment('');
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Comment (Optional)
              </label>
              <textarea
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                placeholder="Enter a comment for this approval..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                rows="4"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setApprovingAdId(null);
                  setApproveComment('');
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveWithComment}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    Approving...
                  </>
                ) : (
                  <>
                    <FaCheck className="text-sm" />
                    Approve
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingAds;
