import React, { useState, useEffect } from 'react';
import { FaTrophy, FaPlus, FaMedal, FaTrash } from 'react-icons/fa';

function CompetitionManagement() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCompetition, setNewCompetition] = useState({ title: '', content: '', images: null });
  const [creating, setCreating] = useState(false);
  const [winnerForms, setWinnerForms] = useState({}); // { competitionId: { name, place, location, images, loading, error } }

  // Fetch competitions
  const fetchCompetitions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/competition/`, {
        headers: { accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch competitions');
      const data = await res.json();
      setCompetitions(data);
    } catch (err) {
      setError(err.message || 'Error fetching competitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  // Handle create competition
  const handleCreateCompetition = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('title', newCompetition.title);
    formData.append('content', newCompetition.content);
    if (newCompetition.images) {
      for (let i = 0; i < newCompetition.images.length; i++) {
        formData.append('images', newCompetition.images[i]);
      }
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/competition/`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to create competition');
      setNewCompetition({ title: '', content: '', images: null });
      setShowCreateForm(false);
      fetchCompetitions();
    } catch (err) {
      setError(err.message || 'Error creating competition');
    } finally {
      setCreating(false);
    }
  };

  // Handle winner form state
  const handleWinnerFormChange = (competitionId, field, value) => {
    setWinnerForms((prev) => ({
      ...prev,
      [competitionId]: {
        ...prev[competitionId],
        [field]: value,
      },
    }));
  };

  // Handle add winner
  const handleAddWinner = async (competitionId, e) => {
    e.preventDefault();
    setWinnerForms((prev) => ({
      ...prev,
      [competitionId]: { ...prev[competitionId], loading: true, error: '' },
    }));
    const token = localStorage.getItem('admin_token');
    const form = winnerForms[competitionId] || {};
    const formData = new FormData();
    formData.append('name', form.name || '');
    formData.append('place', form.place || '');
    formData.append('location', form.location || '');
    if (form.images) {
      for (let i = 0; i < form.images.length; i++) {
        formData.append('images', form.images[i]);
      }
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/competition/${competitionId}/winners`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to add winner');
      setWinnerForms((prev) => ({ ...prev, [competitionId]: {} }));
      fetchCompetitions();
    } catch (err) {
      setWinnerForms((prev) => ({
        ...prev,
        [competitionId]: { ...prev[competitionId], error: err.message || 'Error adding winner', loading: false },
      }));
    }
  };

  // Handle delete competition
  const handleDeleteCompetition = async (competitionId) => {
    if (!window.confirm('Are you sure you want to delete this competition?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/competition/${competitionId}`, {
        method: 'DELETE',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete competition');
      fetchCompetitions();
    } catch (err) {
      alert(err.message || 'Error deleting competition');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><FaTrophy className="text-yellow-600" /> Competition Management</h2>
          <p className="text-gray-600 mt-1">Manage competitions and contests</p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
          onClick={() => setShowCreateForm((v) => !v)}
        >
          <FaPlus /> {showCreateForm ? 'Cancel' : 'Create Competition'}
        </button>
      </div>
      {showCreateForm && (
        <form onSubmit={handleCreateCompetition} className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-2xl border-2 border-blue-300 shadow-xl p-8 mb-8 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <FaTrophy className="text-yellow-500 text-2xl" />
            <h3 className="text-2xl font-bold text-gray-900">Create a New Competition</h3>
          </div>
          <div>
            <label className="block text-md font-semibold text-gray-900 mb-1">Title</label>
            <input
              type="text"
              value={newCompetition.title}
              onChange={e => setNewCompetition({ ...newCompetition, title: e.target.value })}
              required
              className="mt-1 block w-full border border-blue-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 text-gray-900 px-4 py-3 text-lg transition-all"
              placeholder="Competition title"
            />
          </div>
          <div>
            <label className="block text-md font-semibold text-gray-900 mb-1">Content</label>
            <textarea
              value={newCompetition.content}
              onChange={e => setNewCompetition({ ...newCompetition, content: e.target.value })}
              required
              className="mt-1 block w-full border border-blue-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 text-gray-900 px-4 py-3 text-lg transition-all"
              placeholder="Describe the competition"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-md font-semibold text-gray-900 mb-1">Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={e => setNewCompetition({ ...newCompetition, images: e.target.files })}
              className="mt-1 block w-full text-gray-900"
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-md flex items-center gap-2 transition-all duration-200"
            disabled={creating}
          >
            <FaTrophy className="text-yellow-300" />
            {creating ? 'Creating...' : 'Create Competition'}
          </button>
        </form>
      )}
      {loading ? (
        <div className="text-center py-8 text-lg">Loading competitions...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : competitions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No competitions found.</div>
      ) : (
        <div className="space-y-8">
          {competitions.map((comp) => (
            <div key={comp.id} className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-4 mb-2">
                <FaTrophy className="text-yellow-600 text-2xl" />
                <h3 className="text-xl font-bold text-gray-900">{comp.title}</h3>
                <button
                  className="ml-auto bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm"
                  title="Delete Competition"
                  onClick={() => handleDeleteCompetition(comp.id)}
                >
                  <FaTrash /> Delete
                </button>
                {!comp.is_completed && (
                  <button
                    className="ml-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm"
                    title="Mark as Complete"
                    onClick={async () => {
                      const token = localStorage.getItem('admin_token');
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/competition/${comp.id}/complete`, {
                          method: 'PUT',
                          headers: {
                            accept: 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                        });
                        if (!res.ok) throw new Error('Failed to mark as complete');
                        fetchCompetitions();
                      } catch (err) {
                        alert(err.message || 'Error marking as complete');
                      }
                    }}
                  >
                    Mark as Complete
                  </button>
                )}
              </div>
              <div className="text-gray-700 mb-2">{comp.content}</div>
              {comp.images && Array.isArray(comp.images) && comp.images.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {comp.images.map((img, idx) => (
                    <img key={idx} src={img} alt="Competition" className="w-24 h-24 object-cover rounded-lg border" />
                  ))}
                </div>
              )}
              {/* Winners */}
              {comp.winners && comp.winners.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><FaMedal className="text-yellow-500" /> Winners</h4>
                  <div className="flex flex-wrap gap-4">
                    {comp.winners.map((winner, idx) => (
                      <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 min-w-[180px]">
                        <div className="font-bold text-yellow-800">{winner.place === 1 ? '1st' : winner.place === 2 ? '2nd' : winner.place === 3 ? '3rd' : winner.place}</div>
                        <div className="text-gray-900">{winner.name}</div>
                        <div className="text-gray-600 text-sm">{winner.location}</div>
                        {winner.images && Array.isArray(winner.images) && winner.images.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {winner.images.map((img, i) => (
                              <img key={i} src={img} alt="Winner" className="w-12 h-12 object-cover rounded border" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Add Winner Form */}
              <div className="mt-6">
                <details>
                  <summary className="cursor-pointer font-semibold text-blue-700">Add Winner</summary>
                  <form onSubmit={e => handleAddWinner(comp.id, e)} className="mt-3 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={winnerForms[comp.id]?.name || ''}
                        onChange={e => handleWinnerFormChange(comp.id, 'name', e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-700 px-4 py-2 transition-all duration-150"
                        placeholder="Winner's name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Place</label>
                      <select
                        value={winnerForms[comp.id]?.place || ''}
                        onChange={e => handleWinnerFormChange(comp.id, 'place', e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-700 px-4 py-2 transition-all duration-150"
                      >
                        <option value="">Select place</option>
                        <option value="1">1st</option>
                        <option value="2">2nd</option>
                        <option value="3">3rd</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                        type="text"
                        value={winnerForms[comp.id]?.location || ''}
                        onChange={e => handleWinnerFormChange(comp.id, 'location', e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-700 px-4 py-2 transition-all duration-150"
                        placeholder="Winning location"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Images</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={e => handleWinnerFormChange(comp.id, 'images', e.target.files)}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 px-4 py-2 transition-all duration-150"
                      />
                    </div>
                    {winnerForms[comp.id]?.error && <div className="text-red-600 text-sm">{winnerForms[comp.id].error}</div>}
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
                      disabled={winnerForms[comp.id]?.loading}
                    >
                      {winnerForms[comp.id]?.loading ? 'Adding...' : 'Add Winner'}
                    </button>
                  </form>
                </details>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompetitionManagement; 