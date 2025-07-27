import React, { useState } from 'react';
import { FaUsers, FaPlus, FaTrash, FaLock } from 'react-icons/fa';

function AdminPriceManagement({
  newSubAdmin,
  handleAddSubAdmin,
  setNewSubAdmin,
  adminList,
  userRole = 'sub_admin'
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const result = await handleAddSubAdmin();
      if (result && result.success) {
        setSubmitSuccess(result.message);
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSubmitSuccess('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating sub-admin:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (userRole !== 'super_admin') {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin & Price Management</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage sub-administrators and set pricing for different ad types</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock className="text-red-600 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600 mb-4">
            Only Super Administrators can access the Admin & Price Management section.
          </p>
          <p className="text-sm text-gray-500">
            Contact your Super Administrator if you need access to this functionality.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin & Price Management</h2>
        <p className="text-gray-600 text-sm sm:text-base">Manage sub-administrators and set pricing for different ad types</p>
      </div>
      {/* Stretched full-width admin section */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Sub-administrators</h3>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUsers className="text-blue-600 text-base sm:text-lg" />
            </div>
          </div>
          <div className="space-y-4 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500 text-sm sm:text-base"
                  value={newSubAdmin.username || ''}
                  onChange={e => setNewSubAdmin({ ...newSubAdmin, username: e.target.value })}
                  style={{ minHeight: 40 }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter sub-admin email"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500 text-sm sm:text-base"
                  value={newSubAdmin.email || ''}
                  onChange={e => setNewSubAdmin({ ...newSubAdmin, email: e.target.value })}
                  style={{ minHeight: 40 }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500 text-sm sm:text-base"
                  value={newSubAdmin.first_name || ''}
                  onChange={e => setNewSubAdmin({ ...newSubAdmin, first_name: e.target.value })}
                  style={{ minHeight: 40 }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500 text-sm sm:text-base"
                  value={newSubAdmin.last_name || ''}
                  onChange={e => setNewSubAdmin({ ...newSubAdmin, last_name: e.target.value })}
                  style={{ minHeight: 40 }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500 text-sm sm:text-base"
                  value={newSubAdmin.phone_number || ''}
                  onChange={e => setNewSubAdmin({ ...newSubAdmin, phone_number: e.target.value })}
                  style={{ minHeight: 40 }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500 text-sm sm:text-base"
                  value={newSubAdmin.password || ''}
                  onChange={e => setNewSubAdmin({ ...newSubAdmin, password: e.target.value })}
                  style={{ minHeight: 40 }}
                />
              </div>
            </div>
            {submitSuccess && (
              <div className="text-green-600 text-sm mt-2 p-2 bg-green-50 rounded-lg">
                {submitSuccess}
              </div>
            )}
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 mt-2 text-sm sm:text-base ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FaPlus /> Add Sub-admin
                </>
              )}
            </button>
          </div>
          {/* Admins List */}
          <div className="mt-8">
            <h4 className="font-semibold text-gray-900 border-b pb-2 text-sm sm:text-base mb-2">All Admins</h4>
            {adminList && adminList.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl shadow-sm border border-blue-100 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-blue-700">Admin</th>
                      <th className="px-4 py-3 text-left font-bold text-blue-700">Email</th>
                      <th className="px-4 py-3 text-left font-bold text-blue-700">Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminList.map((admin, idx) => {
                      // Generate initials
                      const initials = (admin.first_name && admin.last_name)
                        ? `${admin.first_name[0]}${admin.last_name[0]}`.toUpperCase()
                        : (admin.username ? admin.username.slice(0, 2).toUpperCase() : 'AD');
                      // Color palette for avatars
                      const colors = ["bg-blue-500", "bg-green-500", "bg-pink-500", "bg-yellow-500", "bg-purple-500", "bg-indigo-500"];
                      const color = colors[idx % colors.length];
                      return (
                        <tr
                          key={admin.id || idx}
                          className={
                            `transition-colors ${idx % 2 === 0 ? 'bg-blue-50/40' : 'bg-white'} hover:bg-blue-100/60`
                          }
                        >
                          <td className="px-4 py-3 flex items-center gap-3 font-medium text-gray-900">
                            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-white font-bold text-base shadow ${color}`}>{initials}</span>
                            <span>{admin.username}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-700 font-medium">{admin.email}</td>
                          <td className="px-4 py-3 text-gray-600">{admin.last_login ? new Date(admin.last_login).toLocaleString() : <span className="italic text-gray-400">Never</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No admins found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPriceManagement; 