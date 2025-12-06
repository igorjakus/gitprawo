'use client';

import Link from 'next/link';
import { useLayoutEffect, useState } from 'react';

interface UserSession {
  id: number;
  login: string;
  isAdmin: boolean;
  isExpert: boolean;
}

export default function AuthStatus() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useLayoutEffect(() => {
    // Load user on mount
    loadUser();

    // Listen for storage changes (from other tabs/windows)
    const handleStorageChange = () => {
      loadUser();
    };

    // Listen for custom events from login page
    const handleUserLogin = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-login', handleUserLogin);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-login', handleUserLogin);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      // Clear localStorage
      localStorage.removeItem('user');
      
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Link 
        href="/login" 
        className="bg-white text-[#1e3a8a] px-4 py-2 rounded-md hover:bg-blue-50 transition-colors font-medium text-sm"
      >
        Zaloguj się
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-100">
        Zalogowany jako: <strong>{user.login}</strong>
      </span>
      <button
        onClick={handleLogout}
        className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors font-medium text-sm"
      >
        Wyloguj się
      </button>
    </div>
  );
}
