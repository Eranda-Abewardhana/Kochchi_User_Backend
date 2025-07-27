import React from 'react';
import AdMiniCard from '../../(components)/AdMiniCard';

function ApprovedAds({ approvedAds, handleRemoveApprovedAd }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Approved Ads</h2>
        <p className="text-gray-600 mt-1">Manage currently active advertisements</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvedAds.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">No approved ads found.</div>
        )}
        {approvedAds.map((ad) => (
          <div key={ad.ad_id || ad.id} className="relative">
            {/* Expiry Date at the top right */}
            {ad.expiryDate && (
              <div className="absolute top-2 right-2 z-30 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold shadow">
                Expires: {ad.expiryDate.slice(0, 10)}
              </div>
            )}
            <AdMiniCard ad={ad} onClick={() => {}} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApprovedAds; 