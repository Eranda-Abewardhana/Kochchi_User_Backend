import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Image,
  Edit3,
  Trash2,
  Save,
  X,
  Calendar,
  Eye
} from 'lucide-react';


const BlogCreator = () => {
  const [blogs, setBlogs] = useState([]);
  const [currentBlog, setCurrentBlog] = useState({
    id: null,
    title: '',
    content: '',
    image: null,
    imagePreview: '',
    createdAt: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/blog`; // Corrected from /blogs to /blog
  const [previewBlog, setPreviewBlog] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAuthToken = () => localStorage.getItem('access_token') || localStorage.getItem('admin_token');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      // Per curl, GET is public and doesn't need a token
      const response = await axios.get(`${API_BASE_URL}/`, {
        headers: {
          'accept': 'application/json',
        }
      });
      const fetchedBlogs = response.data.map(blog => ({
        id: blog.id,
        title: blog.title,
        content: blog.content,
        image_url: blog.img_url || blog.image_url || '',
        image: null,
        createdAt: blog.created_at,
      }));
      setBlogs(fetchedBlogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  // Editor formatting functions
  const formatText = (command, value = null) => {
    // Ensure the editor is focused
    editorRef.current?.focus();

    // For list commands, check for execCommand support
    if ((command === 'insertUnorderedList' || command === 'insertOrderedList')) {
      // execCommand is deprecated but still works in most browsers
      if (typeof document.execCommand === 'function') {
        document.execCommand(command, false, value);
      } else {
        alert('Your browser does not support list formatting in this editor.');
      }
      handleContentChange();
      return;
    }

    // Execute the command for other formatting
    if (typeof document.execCommand === 'function') {
      document.execCommand(command, false, value);
    }
    handleContentChange();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setCurrentBlog(prev => ({
        ...prev,
        image: file,
        imagePreview: event.target.result // always set preview
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleContentChange = () => {
    const content = editorRef.current?.innerHTML || '';
    setCurrentBlog(prev => ({
      ...prev,
      content
    }));
  };

  // Handle key events for better list behavior
  const handleKeyDown = (e) => {
    // Handle Enter key in lists
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const listItem = range.startContainer.closest?.('li');
        
        if (listItem) {
          e.preventDefault();
          const newListItem = document.createElement('li');
          newListItem.innerHTML = '<br>';
          
          // Insert after current list item
          listItem.parentNode.insertBefore(newListItem, listItem.nextSibling);
          
          // Move cursor to new list item
          range.setStart(newListItem, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          
          handleContentChange();
        }
      }
    }
    
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      formatText('indent');
    }
  };

  const handleSubmit = async () => {
    if (!currentBlog.title.trim() || !currentBlog.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }
    const token = getAuthToken();
    if (!token) {
      alert('Authentication error. Please log in again.');
      return;
    }
    setLoading(true);
    try {
      if (isEditing) {
        // UPDATE (PUT)
        if (currentBlog.image) {
          // Use FormData for image upload
         const formData = new FormData();
          const blogDetails = {
            title: currentBlog.title,
            content: currentBlog.content,
          };
          formData.append('blog_json', JSON.stringify(blogDetails));
          formData.append('images', currentBlog.image, currentBlog.image.name);
          await axios.put(`${API_BASE_URL}/${currentBlog.id}`, formData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'accept': 'application/json',
            },
          });
        } else {
          // If no new image, use application/json as per the curl command
          const updatePayload = {
            title: currentBlog.title,
            content: currentBlog.content,
          };
          if (currentBlog.imagePreview && currentBlog.imagePreview.trim() !== '') {
            updatePayload.img_url = currentBlog.imagePreview;
          }
          await axios.put(`${API_BASE_URL}/${currentBlog.id}`, updatePayload, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });
        }
        setIsEditing(false);
      } else {
        // CREATE (POST) - match API: title, content, images as top-level fields
        const formData = new FormData();
        formData.append('title', currentBlog.title);
        formData.append('content', currentBlog.content);
        if (currentBlog.image) {
          formData.append('images', currentBlog.image, currentBlog.image.name);
        }
        await axios.post(`${API_BASE_URL}/`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json',
            // Do NOT set Content-Type, let axios set it for multipart
          },
        });
      }

      await fetchBlogs();
      resetForm();
    } catch (error) {
      console.error('Error submitting blog:', error.response?.data || error.message);
      alert('Failed to submit blog. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentBlog({
      id: null,
      title: '',
      content: '',
      image: null,
      imagePreview: '',
      createdAt: null
    });
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    setPreviewMode(false);
  };

  const handleEdit = (blog) => {
    setCurrentBlog({
      ...blog,
      imagePreview: blog.image_url || '', // ensure preview is set
    });
    setIsEditing(true);
    if (editorRef.current) {
      editorRef.current.innerHTML = blog.content;
    }
    window.scrollTo(0, 0); // Scroll to top to see the editor
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }
    const token = getAuthToken();
    if (!token) {
      alert('Authentication error. Please log in again.');
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
        }
      });
      await fetchBlogs(); // Refresh list after deleting
    } catch (error) {
      console.error('Error deleting blog:', error.response?.data || error.message);
      alert('Failed to delete blog. Check the console for details.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePreview = (blog) => {
    setPreviewBlog(blog);
    setPreviewMode(true);
  };

  const closePreview = () => {
    setPreviewBlog(null);
    setPreviewMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
         
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
      {/* Blog Creation Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-blue-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Edit3 size={24} />
                  {isEditing ? 'Edit Blog' : 'Create New Blog'}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Blog Title
                  </label>
            <input
              type="text"
                    value={currentBlog.title}
                    onChange={(e) => setCurrentBlog(prev => ({...prev, title: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter your amazing blog title..."
            />
          </div>

                {/* Editor Toolbar */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Content
                  </label>
                  <div className="border border-gray-300 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b border-gray-200 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => formatText('bold')}
                        className="p-2 rounded-lg bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Bold"
                      >
                        <Bold size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText('italic')}
                        className="p-2 rounded-lg bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 italic"
                        title="Italic"
                      >
                        <Italic size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText('underline')}
                        className="p-2 rounded-lg bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Underline"
                      >
                        <Underline size={18} />
                      </button>
                      <div className="w-px bg-gray-200 mx-1"></div>
                      <button
                        type="button"
                        onClick={() => formatText('justifyLeft')}
                        className="p-2 rounded-lg bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Align Left"
                      >
                        <AlignLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText('justifyCenter')}
                        className="p-2 rounded-lg bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Align Center"
                      >
                        <AlignCenter size={18} />
                      </button>
                      <button
                  type="button"
                        onClick={() => formatText('justifyRight')}
                        className="p-2 rounded-lg bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Align Right"
                      >
                        <AlignRight size={18} />
                      </button>
                    </div>
                    
                    {previewMode ? (
                      <div className="p-4 min-h-[200px] bg-white text-gray-900">
                        <div 
                          dangerouslySetInnerHTML={{ __html: currentBlog.content || '<p class=\"text-gray-400\">Start typing to see preview...</p>' }}
                          className="prose max-w-none"
            />
          </div>
                    ) : (
                      <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleContentChange}
                        onKeyDown={handleKeyDown}
                        className="p-4 min-h-[200px] focus:outline-none bg-white text-gray-900 prose max-w-none placeholder-gray-500"
                        style={{ minHeight: '200px' }}
                        data-placeholder="Start writing your blog content here..."
                        suppressContentEditableWarning={true}
                      />
                    )}
                  </div>
          </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Featured Image
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (fileInputRef.current) fileInputRef.current.click();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-200"
                    >
                      <Image size={18} />
                      Choose Image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                 {/* Image Preview */}
                 {(currentBlog.imagePreview) && (
                   <div className="mt-4 relative w-fit">
                     <img
                       src={currentBlog.imagePreview}
                       alt="Preview"
                       className="h-24 w-24 object-cover rounded-lg border border-gray-300 shadow"
                     />
                     <button
                       type="button"
                       onClick={() => setCurrentBlog(prev => ({ ...prev, image: null, imagePreview: '' }))}
                       className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-100 text-red-600 border border-red-200"
                       title="Remove image"
                     >
                       <X size={14} />
                     </button>
                   </div>
                 )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
            <button
                    type="button"
                    onClick={handleSubmit}
                    className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={loading}
            >
                    {loading ? (
                      <span className="inline-block w-5 h-5 mr-2 align-middle border-2 border-white border-t-blue-400 rounded-full animate-spin"></span>
                    ) : (
                      <Save size={18} />
                    )}
                    {isEditing ? (loading ? 'Updating...' : 'Update Blog') : (loading ? 'Publishing...' : 'Publish Blog')}
            </button>
                  {isEditing && (
              <button
                type="button"
                onClick={() => {
                        setIsEditing(false);
                        resetForm();
                }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
              >
                      <X size={18} />
                Cancel
              </button>
            )}
          </div>
              </div>
            </div>
      </div>

      {/* Blog List */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <List size={24} />
                Published Blogs ({blogs.length})
              </h3>
              
              {blogs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Edit3 size={24} className="text-blue-300" />
                  </div>
                  <p className="text-gray-500">No blogs yet. Create your first blog!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
        {blogs.map((blog) => (
                    <div key={blog.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
                      <div className="flex gap-3">
                        {blog.image_url && (
                        <img
                            src={blog.image_url}
                          alt={blog.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-300"
                        />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate mb-1">
                            {blog.title}
                          </h4>
                          <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(blog.createdAt)}
                          </div>
                          <div 
                            className="text-sm text-gray-700 line-clamp-2"
                            dangerouslySetInnerHTML={{ 
                              __html: blog.content.replace(/<[^>]*>/g, '').substring(0, 80) + '...'
                            }}
                          />
                        </div>
            </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePreview(blog)}
                          className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                          aria-label="Preview Blog"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(blog)}
                          className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                          aria-label="Edit Blog"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          aria-label="Delete Blog"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
        ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom styles for contentEditable placeholder and lists */}
        <style jsx>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9CA3AF;
            pointer-events: none;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          [contenteditable] ul, [contenteditable] ol {
            margin: 16px 0;
            padding-left: 24px;
          }
          [contenteditable] li {
            margin: 4px 0;
            list-style-position: outside;
          }
          [contenteditable] ul li {
            list-style-type: disc;
          }
          [contenteditable] ol li {
            list-style-type: decimal;
          }
          [contenteditable] p {
            margin: 8px 0;
          }
          [contenteditable]:focus {
            outline: none;
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        {/* Preview Modal */}
        {previewBlog && previewMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
              <button onClick={closePreview} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-2">{previewBlog.title}</h2>
              <div className="mb-4 text-gray-500 text-sm flex items-center gap-2">
                <Calendar size={16} /> {formatDate(previewBlog.createdAt)}
              </div>
              {previewBlog.image_url && (
                <img src={previewBlog.image_url} alt={previewBlog.title} className="w-full h-64 object-cover rounded-xl mb-4" />
              )}
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewBlog.content }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCreator;