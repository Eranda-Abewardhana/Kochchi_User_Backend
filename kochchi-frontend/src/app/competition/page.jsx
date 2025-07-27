'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

function CompetitionPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/competition/`, {
          headers: { accept: 'application/json' },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch competitions');
        }
        const data = await response.json();
        setCompetitions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCompetitions();
  }, []);

  const openModal = (competition) => {
    setSelectedCompetition(competition);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedCompetition(null), 300); // Wait for animation
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${poppins.className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <span className="ml-4 text-blue-700 text-lg font-medium">Loading competitions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${poppins.className}`}>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-md mx-auto">
          <p className="text-red-700">Error: {error}</p>
          <p className="text-sm text-red-600 mt-2">Please check your API or try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-gray-50 py-20 ${poppins.className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-gray-900">Competitions</h1>
        {competitions.length === 0 ? (
          <div className="text-center text-gray-500">No competitions available at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {competitions.map((comp, idx) => (
              <motion.div
                key={comp.id || idx}
                className="relative flex flex-col justify-end w-full h-[340px] rounded-2xl overflow-hidden shadow-xl border border-white/20 bg-white/10 backdrop-blur-lg cursor-pointer group"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.04, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal(comp)}
              >
                {comp.img_url && (
                  <Image
                    src={comp.img_url}
                    alt={comp.title}
                    fill
                    className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-300"
                    style={{ opacity: 0.35 }}
                  />
                )}
                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 z-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,1) 100%)',
                  }}
                />
                <div className="relative z-10 p-6 flex flex-col h-full justify-end">
                  <div className="flex items-center mb-2">
                    <span className={`inline-block px-4 py-2 rounded-full text-base font-bold shadow mr-2 transition-all duration-200
                      ${comp.is_completed ? 'bg-green-200 text-green-800 border border-green-400' : 'bg-yellow-200 text-yellow-800 border border-yellow-400'}`}
                    >
                      {comp.is_completed ? 'Completed' : 'Ongoing'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-white drop-shadow-lg line-clamp-1">{comp.title}</h2>
                  <p className="text-base mb-2 text-white/90 line-clamp-3">{comp.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Popup for Competition Details */}
      <AnimatePresence>
        {modalOpen && selectedCompetition && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 mx-2"
              initial={{ scale: 0.95, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 40 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
              {selectedCompetition.img_url && (
                <div className="w-full h-48 relative rounded-xl overflow-hidden mb-4">
                  <Image
                    src={selectedCompetition.img_url}
                    alt={selectedCompetition.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <h2 className="text-2xl font-bold mb-2 text-gray-900">{selectedCompetition.title}</h2>
              <p className="text-gray-700 mb-2">{selectedCompetition.content}</p>
              <p className="text-sm text-gray-500 mb-4">Created: {selectedCompetition.createdAt ? new Date(selectedCompetition.createdAt).toLocaleString() : ''}</p>
              <div className="mb-2">
                <span className={`inline-block px-4 py-2 rounded-full text-base font-bold shadow transition-all duration-200
                  ${selectedCompetition.is_completed ? 'bg-green-200 text-green-800 border border-green-400' : 'bg-yellow-200 text-yellow-800 border border-yellow-400'}`}
                >
                  {selectedCompetition.is_completed ? 'Completed' : 'Ongoing'}
                </span>
              </div>
              {/* Winners Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Winners</h3>
                {selectedCompetition.winners && selectedCompetition.winners.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedCompetition.winners.map((winner, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 shadow-sm">
                        {winner.imageUrl && (
                          <div className="w-14 h-14 relative rounded-full overflow-hidden border border-gray-200">
                            <Image
                              src={winner.imageUrl}
                              alt={winner.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-gray-900">{winner.name}</div>
                          <div className="text-sm text-gray-600">Place: {winner.place}</div>
                          <div className="text-xs text-gray-500">{winner.location}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No winners announced yet.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CompetitionPage;
