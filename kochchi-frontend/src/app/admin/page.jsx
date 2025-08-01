'use client'
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCog, FaUsers, FaHourglassHalf, FaCheckCircle, FaBlog, FaTrophy, FaBell, FaAd, FaPlus, FaTrash, FaDownload, FaBold, FaListUl, FaListOl, FaUnderline, FaItalic, FaAlignLeft, FaAlignCenter, FaAlignRight, FaEdit, FaImage, FaSignOutAlt, FaUtensils } from 'react-icons/fa';
import * as Toolbar from '@radix-ui/react-toolbar';
import * as XLSX from 'xlsx';
import BlogManagement from './components/BlogManagement';
import AdminPriceManagement from './components/AdminPriceManagement';
import UserManagement from './components/UserManagement';
import PendingAds from './components/PendingAds';
import ApprovedAds from './components/ApprovedAds';
import CompetitionManagement from './components/CompetitionManagement';
import NotificationManagement from './components/NotificationManagement';
import PopupAdsManagement from './components/PopupAdsManagement';
import DansalManagement from './components/DansalManagement';
import { useRouter } from "next/navigation";

// Define tabs based on user role
const getTabsForRole = (userRole) => {
  const allTabs = [
    { id: 'admin', label: 'Admin & Price', icon: <FaUserCog />, roles: ['super_admin'] },
    { id: 'users', label: 'Users', icon: <FaUsers />, roles: ['super_admin', 'sub_admin'] },
    { id: 'pending', label: 'Pending Ads', icon: <FaHourglassHalf />, roles: ['super_admin', 'sub_admin'] },
    { id: 'approved', label: 'Approved Ads', icon: <FaCheckCircle />, roles: ['super_admin', 'sub_admin'] },
    { id: 'blog', label: 'Blog', icon: <FaBlog />, roles: ['super_admin', 'sub_admin'] },
    { id: 'competition', label: 'Competition', icon: <FaTrophy />, roles: ['super_admin', 'sub_admin'] },
    { id: 'notifications', label: 'Notifications', icon: <FaBell />, roles: ['super_admin', 'sub_admin'] },
    { id: 'popup', label: 'Popup Ads', icon: <FaAd />, roles: ['super_admin', 'sub_admin'] },
    { id: 'dansal', label: 'Dansal Management', icon: <FaUtensils />, roles: ['super_admin', 'sub_admin'] },
  ];

  return allTabs.filter(tab => tab.roles.includes(userRole));
};

// Utility function to check permissions
const hasPermission = (userRole, requiredRoles) => {
  return requiredRoles.includes(userRole);
};

function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('sub_admin'); // Default role
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const role = localStorage.getItem('admin_user_role') || 'sub_admin';
    const email = localStorage.getItem('admin_user_email') || '';
    
    console.log('Admin page loaded with:', { token: !!token, role, email });
    
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/admin/login');
    } else {
      console.log('Token found, setting user role:', role);
      setUserRole(role);
      setUserEmail(email);
      setLoading(false);
    }
  }, [router]);

  // Temporary function to switch roles for testing (remove this in production)
  const switchRole = (newRole) => {
    localStorage.setItem('admin_user_role', newRole);
    setUserRole(newRole);
    // Force re-render of tabs
    const newTabs = getTabsForRole(newRole);
    if (newTabs.length > 0 && !newTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(newTabs[0].id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user_role');
    localStorage.removeItem('admin_user_id');
    localStorage.removeItem('admin_user_email');
    router.push('/admin/login');
  };

  // Get tabs based on user role
  const TABS = getTabsForRole(userRole);

  // Placeholder data
  const [users, setUsers] = useState([]);
  const [pendingAds, setPendingAds] = useState([
    { id: 1, shop: 'Shop A', phone: '111222333', email: 'shopa@example.com' },
    { id: 2, shop: 'Shop B', phone: '444555666', email: 'shopb@example.com' },
  ]);
  const [approvedAds, setApprovedAds] = useState([]);

  const fetchApprovedAds = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ads/filter`, {
        headers: { 'accept': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch approved ads');
      const data = await res.json();
      // If the response is an array, filter for approval_status = 'approved'
      const approved = Array.isArray(data)
        ? data.filter(ad => ad.approval_status === 'approved')
        : (Array.isArray(data.results) ? data.results.filter(ad => ad.approval_status === 'approved') : []);
      setApprovedAds(approved);
    } catch (error) {
      setApprovedAds([]);
      console.error('Error fetching approved ads:', error);
    }
  };

  useEffect(() => {
    fetchApprovedAds();
  }, []);

  const [popupAds, setPopupAds] = useState([]);

  const fetchPopupAds = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/popup-ads/`);
      if (!res.ok) throw new Error('Failed to fetch popup ads');
      const data = await res.json();
      setPopupAds(data);
    } catch (error) {
      console.error(error);
      // Handle error fetching popup ads, maybe show a notification
    }
  };

  useEffect(() => {
    fetchPopupAds();
  }, []);

  // Admin & price management states
  const [newSubAdmin, setNewSubAdmin] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
  });
  const [prices, setPrices] = useState({
    base_price: { price: '', discount_applied: { value_percent: '', start_date: '', end_date: '' } },
    top_add_price: { price: '', discount_applied: { value_percent: '', start_date: '', end_date: '' } },
    carosal_add_price: { price: '', discount_applied: { value_percent: '', start_date: '', end_date: '' } },
  });

  // Tab state - set initial tab based on available tabs
  const [activeTab, setActiveTab] = useState(TABS.length > 0 ? TABS[0].id : 'users');
  const tabRefs = useRef([]);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  // Update active tab when tabs change
  useEffect(() => {
    if (TABS.length > 0 && !TABS.find(tab => tab.id === activeTab)) {
      setActiveTab(TABS[0].id);
    }
  }, [TABS, activeTab]);

  // Blog state for demo
  const initialBlogs = [
    {
      id: 1,
      title: 'Welcome to the Blog!',
      content: '<p>This is a <b>sample</b> blog post.</p>',
      image: '',
    },
  ];

  // Blog management states
  const [blogs, setBlogs] = useState(initialBlogs);
  const [blogForm, setBlogForm] = useState({ title: '', content: '', image: '' });
  const [blogImageFile, setBlogImageFile] = useState(null);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const textareaRef = useRef(null);

  // Admins list state
  const [adminList, setAdminList] = useState([]);

  // Fetch admins - only for super admin
  const fetchAdminList = async () => {
    if (userRole !== 'super_admin') return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/users/last-logins`, {
        headers: { 'accept': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch admin list');
      const data = await response.json();
      setAdminList(data);
    } catch (error) {
      setAdminList([]);
      console.error('Error fetching admin list:', error);
    }
  };

  useEffect(() => {
    fetchAdminList();
  }, [userRole]);

  // Add fetchUsers function
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/users/last-logins`, {
        headers: { 'accept': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setUsers([]);
      console.error('Error fetching users:', error);
    }
  };

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handlers
  const handleAddSubAdmin = async () => {
    if (userRole !== 'super_admin') {
      return;
    }
    
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
        },
        body: JSON.stringify({
          username: newSubAdmin.username.trim(),
          email: newSubAdmin.email.trim(),
          first_name: newSubAdmin.first_name?.trim() || '',
          last_name: newSubAdmin.last_name?.trim() || '',
          phone_number: newSubAdmin.phone_number?.trim() || '',
          password: newSubAdmin.password,
          profile_pic: 'string', // Placeholder as requested
        }),
      });

      if (response.ok) {
        // Reset form
        setNewSubAdmin({
          username: '',
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
          password: '',
        });
        // Refresh admin list after creation
        await fetchAdminList();
        return { success: true, message: 'Sub-admin created successfully!' };
      } else {
        return { success: false, message: 'Failed to create sub-admin' };
      }
    } catch (error) {
      console.error('Failed to create sub-admin', error);
      return { success: false, message: 'An error occurred' };
    }
  };
  const handleRemoveUser = (email) => {
    setUsers(users.filter((u) => u.email !== email));
  };
  const handleExportUsers = () => {
    if (!users || users.length === 0) {
      alert('No users data to export');
      return;
    }

    try {
      // Prepare data for Excel export
      const exportData = users.map(user => ({
        'Name': user.name || user.first_name + ' ' + (user.last_name || '') || 'N/A',
        'First Name': user.first_name || 'N/A',
        'Last Name': user.last_name || 'N/A',
        'Email': user.email || 'N/A',
        'Phone': user.phone_number || user.phone || 'N/A',
        'Username': user.username || 'N/A',
        'Last Login': user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A',
        'Created At': user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = [
        { wch: 20 }, // Name
        { wch: 15 }, // First Name
        { wch: 15 }, // Last Name
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 15 }, // Username
        { wch: 20 }, // Last Login
        { wch: 20 }  // Created At
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `users_export_${date}.xlsx`;

      // Export the file
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error exporting users to Excel:', error);
      alert('Error exporting users data. Please try again.');
    }
  };
  const handleRemovePendingAd = (id) => {
    setPendingAds(pendingAds.filter((ad) => ad.id !== id));
  };
  const handleRemoveApprovedAd = (id) => {
    setApprovedAds(approvedAds.filter((ad) => ad.id !== id));
  };
  const handleDeletePopupAd = async (id) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/popup-ads/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete popup ad');
      fetchPopupAds(); // Refresh the list
    } catch (error) {
      console.error(error);
      // Handle error deleting popup ad
    }
  };

  // Tab underline animation
  useEffect(() => {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    const tab = tabRefs.current[idx];
    if (tab) {
      setUnderline({ left: tab.offsetLeft, width: tab.clientWidth });
    }
  }, [activeTab, TABS]);

  // Section animation
  const sectionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  // Blog formatting controls for textarea
  const insertAtCursor = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const newValue = value.slice(0, start) + before + value.slice(start, end) + after + value.slice(end);
    setBlogForm((prev) => ({ ...prev, content: newValue }));
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + before.length + (end - start) + after.length;
    }, 0);
  };
  const handleFormat = (type) => {
    switch (type) {
      case 'bold':
        insertAtCursor('<b>', '</b>');
        break;
      case 'italic':
        insertAtCursor('<i>', '</i>');
        break;
      case 'underline':
        insertAtCursor('<u>', '</u>');
        break;
      case 'ul':
        insertAtCursor('<ul>\n  <li>', '</li>\n</ul>');
        break;
      case 'ol':
        insertAtCursor('<ol>\n  <li>', '</li>\n</ol>');
        break;
      case 'left':
        insertAtCursor('<div style="text-align:left;">', '</div>');
        break;
      case 'center':
        insertAtCursor('<div style="text-align:center;">', '</div>');
        break;
      case 'right':
        insertAtCursor('<div style="text-align:right;">', '</div>');
        break;
      default:
        break;
    }
  };

  const handleBlogImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setBlogImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBlogForm((prev) => ({ ...prev, image: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBlogFormChange = (e) => {
    setBlogForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBlogSubmit = (e) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.content) return;
    if (editingBlogId) {
      setBlogs((prev) => prev.map((b) => b.id === editingBlogId ? { ...b, ...blogForm } : b));
      setEditingBlogId(null);
    } else {
      setBlogs((prev) => [
        { ...blogForm, id: Date.now() },
        ...prev,
      ]);
    }
    setBlogForm({ title: '', content: '', image: '' });
    setBlogImageFile(null);
    if (textareaRef.current) textareaRef.current.value = '';
  };

  const handleEditBlog = (blog) => {
    setBlogForm({ title: blog.title, content: blog.content, image: blog.image });
    setEditingBlogId(blog.id);
    setTimeout(() => {
      if (textareaRef.current) textareaRef.current.value = blog.content;
    }, 0);
  };

  const handleDeleteBlog = (id) => {
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    if (editingBlogId === id) {
      setEditingBlogId(null);
      setBlogForm({ title: '', content: '', image: '' });
      if (textareaRef.current) textareaRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mt-20 min-h-screen bg-gray-100 font-sans">
      <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with user info */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-blue-100 text-sm">
                  Welcome, {userEmail} ({userRole === 'super_admin' ? 'Super Admin' : 'Sub Admin'})
                </p>
              </div>
              
            </div>
          </div>

          {/* Tab Bar */}
          <div className="relative border-b border-gray-200 bg-gray-50 z-10">
            <div className="flex overflow-x-auto scrollbar-hide">
              {TABS.map((tab, idx) => (
                <button
                  key={tab.id}
                  ref={el => tabRefs.current[idx] = el}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none text-sm sm:text-base
                    ${activeTab === tab.id 
                      ? 'text-blue-700 bg-white border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ minWidth: 110 }}
                >
                  <span className="text-base sm:text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="p-2 sm:p-4 md:p-8 min-h-[400px] md:min-h-[600px] mt-0">
            <AnimatePresence mode="wait">
              {activeTab === 'admin' && userRole === 'super_admin' && (
                <motion.div key="admin" {...sectionVariants}>
                  <AdminPriceManagement
                    newSubAdmin={newSubAdmin}
                    prices={prices}
                    handleAddSubAdmin={handleAddSubAdmin}
                    setNewSubAdmin={setNewSubAdmin}
                    setPrices={setPrices}
                    adminList={adminList}
                    userRole={userRole}
                  />
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div key="users" {...sectionVariants}>
                  <UserManagement
                    users={users}
                    handleRemoveUser={handleRemoveUser}
                    handleExportUsers={handleExportUsers}
                  />
                </motion.div>
              )}

              {activeTab === 'pending' && (
                <motion.div key="pending" {...sectionVariants}>
                  <PendingAds
                    pendingAds={pendingAds}
                    handleRemovePendingAd={handleRemovePendingAd}
                  />
                </motion.div>
              )}

              {activeTab === 'approved' && (
                <motion.div key="approved" {...sectionVariants}>
                  <ApprovedAds
                    approvedAds={approvedAds}
                    handleRemoveApprovedAd={handleRemoveApprovedAd}
                  />
                </motion.div>
              )}

              {activeTab === 'blog' && (
                <motion.div key="blog" {...sectionVariants}>
                  <BlogManagement
                    blogForm={blogForm}
                    blogs={blogs}
                    editingBlogId={editingBlogId}
                    textareaRef={textareaRef}
                    handleBlogFormChange={handleBlogFormChange}
                    handleBlogSubmit={handleBlogSubmit}
                    handleFormat={handleFormat}
                    handleBlogImageChange={handleBlogImageChange}
                    handleEditBlog={handleEditBlog}
                    handleDeleteBlog={handleDeleteBlog}
                    setEditingBlogId={setEditingBlogId}
                    setBlogForm={setBlogForm}
                  />
                </motion.div>
              )}

              {activeTab === 'competition' && (
                <motion.div key="competition" {...sectionVariants}>
                  <CompetitionManagement />
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div key="notifications" {...sectionVariants}>
                  <NotificationManagement />
                </motion.div>
              )}

              {activeTab === 'popup' && (
                <motion.div key="popup" {...sectionVariants}>
                  <PopupAdsManagement
                    popupAds={popupAds}
                    handleDeletePopupAd={handleDeletePopupAd}
                    onPopupAdAdded={fetchPopupAds}
                  />
                </motion.div>
              )}

              {activeTab === 'dansal' && (
                <motion.div key="dansal" {...sectionVariants}>
                  <DansalManagement />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;