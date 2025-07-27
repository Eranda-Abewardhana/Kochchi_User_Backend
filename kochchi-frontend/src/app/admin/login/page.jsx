"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://api.kochchibazaar.lk/api/auth/login", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!res.ok) {
        throw new Error("Invalid username or password");
      }
      
      const data = await res.json();
      
      // Store token
      const token = data.access_token || data.token || "";
      if (!token) {
        throw new Error("No authentication token received");
      }
      localStorage.setItem("admin_token", token);
      localStorage.setItem("access_token", token); // For consistency across app
      
      // For now, set a default role - you can modify this based on your API response
      // If your API returns role information, you can use that instead
      let userRole = data.role === 'super_admin' ? 'super_admin' : 'sub_admin';
      let userEmail = data.username || username;
      let userId = data.id || "";
      
      // Store user information
      localStorage.setItem("admin_user_role", userRole);
      localStorage.setItem("admin_user_id", userId);
      localStorage.setItem("admin_user_email", userEmail);
      
      console.log("Login successful:", { userRole, userEmail, userId });
      
      router.push("/admin");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 pt-28 h-full max-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6 h-full max-h-screen overflow-y-auto"
      >
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-900">Admin Login</h1>
        {error && <div className="text-red-600 text-center">{error}</div>}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default AdminLoginPage; 