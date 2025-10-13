'use client';

import { useEffect, useState } from 'react';
import NotionStyleDashboard from '@/components/NotionStyleDashboard';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('gawin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Handle logout - simple localStorage clear
  const handleLogout = () => {
    localStorage.removeItem('gawin_user');
    window.location.href = '/';
  };

  // Handle back to landing
  const handleBackToLanding = () => {
    // Stay on dashboard since this is our main app page
  };

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-3xl font-bold">G</span>
          </div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = '/';
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-3xl font-bold">G</span>
          </div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show new dashboard interface for authenticated users
  return (
    <NotionStyleDashboard
      user={user}
      onLogout={handleLogout}
      onBackToLanding={handleBackToLanding}
    />
  );
}