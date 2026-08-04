import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('auralis_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.name && u.name.toLowerCase().includes('priya')) {
          u.name = 'Sriram';
          u.email = 'sriram@auralis.in';
        }
        return u;
      }
    } catch {
      // ignore JSON parse error
    }
    return {
      id: 'user_aur_91001',
      name: 'Sriram',
      email: 'sriram@auralis.in',
      phone: '+91 98765 43210',
      primaryContactName: 'Venkatesan Ramanujam',
      primaryContactPhone: '+91 99404 10516',
      primaryContactRelation: 'Primary Contact (ICE)',
      bloodGroup: 'O+',
      medicalNotes: 'Keep emergency notes handy',
      city: 'Local Area',
      pincode: '560038',
      safetyScore: 96,
      isVerified: true
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auralis_logged_in') === 'true';
  });

  useEffect(() => {
    if (isAuthenticated) {
      api.getProfile().then(data => {
        if (data?.user) {
          setUser(data.user);
          try {
            localStorage.setItem('auralis_user', JSON.stringify(data.user));
          } catch {
            // ignore
          }
        }
      });
    }
  }, [isAuthenticated]);

  const login = async (email: string, _password?: string) => {
    const res = await api.login(email);
    const currentUser = res?.user || {
      id: 'user_aur_91001',
      name: 'Sriram',
      email: email || 'sriram@auralis.in',
      phone: '+91 98765 43210',
      bloodGroup: 'O+',
      medicalNotes: 'Keep emergency notes handy',
      city: 'Bengaluru',
      pincode: '560038',
      safetyScore: 96,
      isVerified: true
    };
    setUser(currentUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('auralis_logged_in', 'true');
      localStorage.setItem('auralis_user', JSON.stringify(currentUser));
    } catch {
      // ignore
    }
  };

  const signup = async (userData: Partial<User>) => {
    const newUser: User = {
      id: `user_aur_${Date.now()}`,
      name: userData.name || 'Sriram',
      email: userData.email || 'sriram@auralis.in',
      phone: userData.phone || '+91 98765 43210',
      bloodGroup: userData.bloodGroup || 'O+',
      medicalNotes: userData.medicalNotes || 'No known severe drug allergies.',
      city: userData.city || 'Bengaluru',
      pincode: '560038',
      safetyScore: 98,
      isVerified: true,
      ...userData
    };
    setUser(newUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('auralis_logged_in', 'true');
      localStorage.setItem('auralis_user', JSON.stringify(newUser));
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auralis_logged_in');
    localStorage.removeItem('auralis_user');
  };

  const updateUser = async (data: Partial<User>) => {
    const res = await api.updateProfile(data);
    if (res?.user) {
      setUser(res.user);
      try {
        localStorage.setItem('auralis_user', JSON.stringify(res.user));
      } catch {
        // ignore
      }
    } else {
      setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, ...data };
        try {
          localStorage.setItem('auralis_user', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
