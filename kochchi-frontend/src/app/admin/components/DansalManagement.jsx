import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCalendar, FaMapMarkerAlt, FaUsers, FaClock, FaPhone, FaWhatsapp, FaEnvelope, FaUtensils, FaImage } from 'react-icons/fa';

function DansalManagement() {
  const [dansals, setDansals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    organizer: '',
    contact: '',
    expectedAttendees: '',
    isActive: true
  });

  // Fetch dansals
  const fetchDansals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dansal/all`, {
        headers: { accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch dansals');
      const data = await res.json();
      setDansals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDansals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    
    const token = localStorage.getItem('admin_token');
    const body = new URLSearchParams();
    Object.keys(formData).forEach(key => {
      body.append(key, formData[key]);
    });

    try {
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/dansals/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/dansals/`;
      
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      
      if (!res.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} dansal`);
      
      setSuccess(`Dansal ${isEditing ? 'updated' : 'created'} successfully!`);
      resetForm();
      fetchDansals();
    } catch (err) {
      setError(err.message || `Error ${isEditing ? 'updating' : 'creating'} dansal`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dansal) => {
    setIsEditing(true);
    setEditingId(dansal.id);
    setFormData({
      title: dansal.title || '',
      description: dansal.description || '',
      date: dansal.date || '',
      time: dansal.time || '',
      location: dansal.location || '',
      organizer: dansal.organizer || '',
      contact: dansal.contact || '',
      expectedAttendees: dansal.expectedAttendees || '',
      isActive: dansal.isActive !== undefined ? dansal.isActive : true
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dansal?')) return;
    
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dansal/delete/${id}`, {
        method: 'DELETE',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete dansal');
      setSuccess('Dansal deleted successfully!');
      fetchDansals();
    } catch (err) {
      setError(err.message || 'Error deleting dansal');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      organizer: '',
      contact: '',
      expectedAttendees: '',
      isActive: true
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatLocation = (location) => {
    if (!location) return 'Location not specified';
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.district && location.district !== location.city) parts.push(location.district);
    if (location.province) parts.push(location.province);
    return parts.join(', ') || 'Location not specified';
  };

  const formatOrganizer = (organizer) => {
    if (!organizer) return 'Organizer not specified';
    return organizer.name || 'Organizer not specified';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Dansal Management</h2>
        <p className="text-gray-600 mt-1">Manage charity events and food distribution activities</p>
      </div>

      {/* Dansals List */}
      <div className="max-w-7xl mx-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaCalendar className="text-orange-500" /> 
          {loading ? 'Loading dansals...' : `Dansal Events (${dansals.length})`}
        </h3>
        
        {loading ? (
          <div className="text-center py-8 text-lg">Loading dansals...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : dansals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No dansal events found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dansals.map((dansal, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border-l-4 border-orange-500 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Header with image */}
                <div className="relative mb-4">
                  {dansal.images && dansal.images.length > 0 ? (
                    <div className="h-48 rounded-lg overflow-hidden mb-4">
                      <img 
                        src={dansal.images[0]} 
                        alt={dansal.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center mb-4">
                      <FaImage className="text-4xl text-orange-300" />
                    </div>
                  )}
                  
                  {/* Food Type Badge */}
                  {dansal.foodType && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {dansal.foodType}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title and Actions */}
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 mr-2">{dansal.title}</h4>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDelete(dansal.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete Dansal"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                {/* Event Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCalendar className="text-orange-500 flex-shrink-0" />
                    <span>{dansal.date} at {dansal.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaMapMarkerAlt className="text-orange-500 flex-shrink-0" />
                    <span className="line-clamp-1">{formatLocation(dansal.location)}</span>
                  </div>
                  
                  {dansal.organizer && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaUsers className="text-orange-500 flex-shrink-0" />
                      <span className="line-clamp-1">{formatOrganizer(dansal.organizer)}</span>
                    </div>
                  )}
                  
                  {/* Organizer Contact Info */}
                  {dansal.organizer && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FaPhone className="text-orange-500" />
                        <span>{dansal.organizer.phone || 'No phone'}</span>
                      </div>
                      {dansal.organizer.whatsapp && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <FaWhatsapp className="text-green-500" />
                          <span>{dansal.organizer.whatsapp}</span>
                        </div>
                      )}
                      {dansal.organizer.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <FaEnvelope className="text-blue-500" />
                          <span className="line-clamp-1">{dansal.organizer.email}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {dansal.description && (
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 line-clamp-3">{dansal.description}</p>
                    </div>
                  )}
                </div>
                
                {/* Footer with timestamps */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Created: {new Date(dansal.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(dansal.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DansalManagement; 