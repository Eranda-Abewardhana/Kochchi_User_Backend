'use client';

import React, { useState, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUser, FaEye, FaHeart, FaShare, FaArrowRight } from 'react-icons/fa';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const baseURL = "https://api.kochchibazaar.lk/api/blog/";

function Page() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    console.log("baseURL",baseURL);
    const fetchBlogs = async () => {
      try {
        const response = await fetch(baseURL);
       
        
        console.log(response)
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }
        const data = await response.json();
        setBlogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (baseURL) {
      fetchBlogs();
    } else {
      setError('API URL not configured');
      setLoading(false);
    }
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Modal component
  const BlogModal = ({ blog, onClose }) => {
    if (!blog) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] flex flex-col"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
            aria-label="Close"
          >
            &times;
          </button>
          <img
            src={blog.img_url}
            alt={blog.title}
            className="w-full h-48 object-cover rounded-xl mb-4"
            style={{ display: blog.img_url ? 'block' : 'none' }}
          />
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <FaUser className="text-blue-500" />
            <span>{blog.author || 'Admin'}</span>
            <FaCalendarAlt className="ml-4 text-blue-300" />
            <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'Recent'}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{blog.title}</h2>
          <div className="text-gray-700 mb-4 whitespace-pre-line overflow-y-auto" style={{maxHeight: '40vh'}} dangerouslySetInnerHTML={{ __html: blog.content }}></div>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-white to-gray-50 py-20 ${poppins.className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blogs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-white to-gray-50 py-20 ${poppins.className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-md mx-auto">
              <p className="text-red-700">Error: {error}</p>
              <p className="text-sm text-red-600 mt-2">Please check your API configuration</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-gray-50 py-20 ${poppins.className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Our Blog
          </h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "6rem" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1 bg-blue-500 mx-auto rounded-full"
          ></motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-gray-600 mt-8 max-w-2xl mx-auto"
          >
            Discover the latest insights, tips, and stories from the culinary world of Sri Lanka
          </motion.p>
        </motion.div>

        {/* Blog Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {blogs.length > 0 ? (
            blogs.map((blog, index) => (
              <motion.article
                key={blog.id || index}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                onClick={() => setSelectedBlog(blog)}
              >
                {/* Blog Image */}
                <div className="relative overflow-hidden h-48">
                  {blog.img_url && (
                  <img
                      src={blog.img_url}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <FaCalendarAlt className="text-blue-300" />
                      <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>
                </div>

                {/* Blog Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <FaUser className="text-blue-500" />
                    <span>{blog.author || 'Admin'}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {blog.title || 'Blog Title'}
                  </h3>
                  
                  <div className="text-gray-600 mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: blog.content }}>
                    
                  </div>

                  {/* Read More Button */}
                  <button
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 group"
                    onClick={e => { e.stopPropagation(); setSelectedBlog(blog); }}
                  >
                    Read More
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.article>
            ))
          ) : (
            // Empty State
            <motion.div
              variants={itemVariants}
              className="col-span-full text-center py-12"
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Blogs Yet</h3>
                <p className="text-gray-600">We're working on creating amazing content for you. Check back soon!</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Modal Popup */}
        {selectedBlog && (
          <BlogModal blog={selectedBlog} onClose={() => setSelectedBlog(null)} />
        )}
      </div>
    </div>
  );
}

export default Page;
