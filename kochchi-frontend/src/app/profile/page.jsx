"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiLogOut,
  FiEdit,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiList,
} from "react-icons/fi";
import AdvertisementCard from "../(components)/AdvertisementCard";
import { useAuth } from "../(components)/AuthContext";
import Toast from "../(components)/Toast";

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const fileInputRef = useRef(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [userAds, setUserAds] = useState([]);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'ads'
  const { logout } = useAuth();
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
        const token =
          localStorage.getItem("access_token") ||
          localStorage.getItem("user_token") ||
          localStorage.getItem("admin_token");
        if (!token) {
          setError("Not logged in.");
          setLoading(false);
          return;
        }
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) {
          let errMsg = "Failed to fetch user info";
          try {
            const errData = await res.json();
            if (errData && errData.detail) errMsg = errData.detail;
          } catch (e) {}
          throw new Error(errMsg);
        }
        const data = await res.json();
        setUserData({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          phone: data.phone_number || "",
          profile_pic: data.profile_pic || "/assets/discount.jpg",
          joinDate: data.created_at
            ? new Date(data.created_at).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })
            : "",
        });
        setEditValues({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          phone: data.phone_number || "",
        });

        const adsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/ads/my`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (adsRes.ok) {
          const adsData = await adsRes.json();
          setUserAds(Array.isArray(adsData) ? adsData : [adsData]);
        } else {
          setUserAds([]);
        }
      } catch (err) {
        setError(err.message || "Error loading profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleEdit = () => {
    setEditValues({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
    });
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("user_token") ||
        localStorage.getItem("admin_token");
      if (!token) {
        setError("Not logged in.");
        setLoading(false);
        return;
      }

      console.log(
        "API URL:",
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`
      );
      console.log("Token:", token ? "Present" : "Missing");
      console.log("Edit values:", editValues);

      const formData = new FormData();
      formData.append("first_name", editValues.firstName);
      formData.append("last_name", editValues.lastName);
      formData.append("phone_number", editValues.phone);
      if (selectedPhotoFile) {
        formData.append("profile_pic", selectedPhotoFile);
        console.log("Photo file included");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      console.log("Response status:", res.status);
      console.log(
        "Response headers:",
        Object.fromEntries(res.headers.entries())
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("API Error:", errData);
        throw new Error(
          errData.detail || errData.message || "Failed to update profile"
        );
      }
      const data = await res.json();
      console.log("API Response:", data);
      setUserData((prev) => ({
        ...prev,
        firstName: data.first_name || editValues.firstName,
        lastName: data.last_name || editValues.lastName,
        email: data.email || prev.email,
        phone: data.phone_number || editValues.phone,
        profile_pic: data.profile_pic || prev.profile_pic,
      }));
      setSelectedPhotoFile(null);
      setEditMode(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handlePhotoEdit = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(Math.PI);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          canvas.toBlob((blob) => {
            if (blob) {
              const rotatedFile = new File([blob], file.name, {
                type: file.type,
              });
              setSelectedPhotoFile(rotatedFile);
              const previewReader = new FileReader();
              previewReader.onload = (previewEv) => {
                setUserData((prev) => ({
                  ...prev,
                  profile_pic: previewEv.target.result,
                }));
              };
              previewReader.readAsDataURL(rotatedFile);
            }
          }, file.type);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    setShowLogoutToast(true);
    setTimeout(() => {
      logout(); // This clears storage and reloads, but we'll redirect to home instead
      window.location.href = "/";
    }, 1500);
  };

  const getStatusColor = (status) => {
    return status === "completed" ? "text-green-600" : "text-yellow-600";
  };

  const getStatusIcon = (status) => {
    return status === "completed" ? (
      <FiCheckCircle className="w-4 h-4" />
    ) : (
      <FiClock className="w-4 h-4" />
    );
  };

  const getStatusBg = (status) => {
    return status === "completed" ? "bg-green-100" : "bg-yellow-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading profile...
      </div>
    );
  }

  if (error === "Not logged in.") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white/90 p-10 rounded-3xl shadow-2xl border border-blue-100 flex flex-col items-center gap-6 max-w-md">
          <FiUser className="w-16 h-16 text-blue-500 mb-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            You are not logged in
          </h2>
          <p className="text-gray-600 text-center">
            Please log in to view your profile and manage your advertisements.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl flex items-center justify-center gap-2 text-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        {error}
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-2 sm:px-6 lg:px-12 mt-20">
      {/* Tab Bar */}
      <div className="w-full max-w-4xl mx-auto mb-8 flex justify-center">
        <div className="flex rounded-xl bg-white/80 shadow border border-blue-100 overflow-hidden">
          <button
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-base transition focus:outline-none ${
              activeTab === "profile"
                ? "bg-blue-600 text-white"
                : "text-blue-700 hover:bg-blue-100"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <FiUser className="w-5 h-5" /> Profile
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-base transition focus:outline-none ${
              activeTab === "ads"
                ? "bg-blue-600 text-white"
                : "text-blue-700 hover:bg-blue-100"
            }`}
            onClick={() => setActiveTab("ads")}
          >
            <FiList className="w-5 h-5" /> My Ads
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100 p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row items-center gap-4 w-full max-w-4xl mx-auto mb-8 max-h-[60vh] overflow-y-auto md:max-h-none md:overflow-visible"
        >
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-2 border-blue-200 shadow-md">
              <img
                src={userData.profile_pic}
                alt={userData.firstName}
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors border-2 border-white"
              onClick={handlePhotoEdit}
              aria-label="Edit Profile Picture"
            >
              <FiEdit className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 w-full">
            {!editMode ? (
              // Read-only view
              <>
                <div className="flex flex-col md:flex-row md:items-center md:gap-6 w-full">
                  <div className="flex-1 space-y-1">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                      {userData.firstName} {userData.lastName}
                    </h2>
                    <p className="text-gray-500 text-sm lg:text-base">
                      Member since {userData.joinDate}
                    </p>
                  </div>
                  <button
                    onClick={handleEdit}
                    className="mt-2 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg flex items-center justify-center gap-2 text-base transition"
                  >
                    <FiEdit className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  <div className="flex items-center bg-white rounded-xl px-4 py-2 text-base border border-gray-200">
                    <FiUser className="w-5 h-5 text-gray-500 mr-2" />
                    <div className="flex-1">
                      <span className="text-gray-500 text-xs">First Name</span>
                      <div className="text-gray-800 font-semibold">
                        {userData.firstName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center bg-white rounded-xl px-4 py-2 text-base border border-gray-200">
                    <FiUser className="w-5 h-5 text-gray-500 mr-2" />
                    <div className="flex-1">
                      <span className="text-gray-500 text-xs">Last Name</span>
                      <div className="text-gray-800 font-semibold">
                        {userData.lastName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center bg-white rounded-xl px-4 py-2 text-base border border-gray-200">
                    <FiMail className="w-5 h-5 text-gray-500 mr-2" />
                    <div className="flex-1">
                      <span className="text-gray-500 text-xs">Email</span>
                      <div className="text-gray-800 font-semibold">
                        {userData.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center bg-white rounded-xl px-4 py-2 text-base border border-gray-200">
                    <FiPhone className="w-5 h-5 text-gray-500 mr-2" />
                    <div className="flex-1">
                      <span className="text-gray-500 text-xs">
                        Phone Number
                      </span>
                      <div className="text-gray-800 font-semibold">
                        {userData.phone}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Edit form
              <>
                <div className="flex flex-col md:flex-row md:items-center md:gap-6 w-full">
                  <div className="flex-1 space-y-1">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                      Edit Profile
                    </h2>
                    <p className="text-gray-500 text-sm lg:text-base">
                      Update your information
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-5 rounded-lg flex items-center justify-center gap-2 text-base transition"
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-semibold py-2 px-5 rounded-lg flex items-center justify-center gap-2 text-base transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-gray-500 text-xs font-medium">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={editValues.firstName}
                      onChange={handleChange}
                      className="w-full bg-white rounded-xl px-4 py-3 text-base border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-500 text-xs font-medium">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={editValues.lastName}
                      onChange={handleChange}
                      className="w-full bg-white rounded-xl px-4 py-3 text-base border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-500 text-xs font-medium flex items-center gap-1">
                      Email
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline w-3 h-3 text-gray-400 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m0 0h4m-4 0H8"
                        />
                      </svg>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editValues.email}
                      onChange={handleChange}
                      className="w-full bg-gray-100 rounded-xl px-4 py-3 text-base border border-gray-200 text-black cursor-not-allowed"
                      placeholder="Enter email"
                      disabled
                    />
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m0 0h4m-4 0H8"
                        />
                      </svg>{" "}
                      Email cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-500 text-xs font-medium">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={editValues.phone}
                      onChange={handleChange}
                      className="w-full bg-white rounded-xl px-4 py-3 text-base border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 bg-gradient-to-r from-red-500 to-red-700 text-white py-3 px-6 rounded-xl font-bold shadow-md hover:from-red-600 hover:to-red-800 transition-colors flex items-center justify-center gap-2 text-lg"
              onClick={handleLogout}
            >
              <FiLogOut className="w-6 h-6" />
              Logout
            </motion.button>
          </div>
        </motion.div>
      )}

      {activeTab === "ads" && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-5xl mx-auto flex flex-col gap-6"
        >
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-blue-900 mb-1">
              My Advertisements
            </h2>
            <p className="text-gray-600">
              Track the status and performance of your posted ads
            </p>
          </div>
          <div className="max-h-[50vh] overflow-y-auto">
            {userAds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <span className="text-2xl text-gray-400 mb-2">🗒️</span>
                <p className="text-base text-gray-500 font-medium">
                  No advertisements here which you posted yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {userAds.map((ad, index) => (
                  <AdvertisementCard key={ad.id || index} ad={ad} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
      {showLogoutToast && <Toast message="You are logged out" />}
      {showSuccessToast && <Toast message="Profile updated successfully!" />}
    </div>
  );
}
