
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  avatar?: string;
  provider?: 'email' | 'google';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo users for authentication
const demoUsers: User[] = [
  {
    id: '1',
    email: 'admin@company.com',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://static.vecteezy.com/system/resources/previews/045/647/937/non_2x/3d-character-people-close-up-portrait-smiling-nice-3d-avartar-or-icon-free-png.png',
    provider: 'email'
  },
  {
    id: '2',
    email: 'employee@company.com',
    name: 'John Doe',
    role: 'employee',
    avatar: 'https://static.vecteezy.com/system/resources/previews/045/647/937/non_2x/3d-character-people-close-up-portrait-smiling-nice-3d-avartar-or-icon-free-png.png',
    provider: 'email'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('arbrion_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = demoUsers.find(u => u.email === email);
    
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('arbrion_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate Google OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, create a random Google user
    const googleUser: User = {
      id: 'google_' + Date.now(),
      email: 'demo.google@gmail.com',
      name: 'Google Demo User',
      role: 'employee',
      avatar: 'https://static.vecteezy.com/system/resources/previews/045/647/937/non_2x/3d-character-people-close-up-portrait-smiling-nice-3d-avartar-or-icon-free-png.png',
      provider: 'google'
    };
    
    setUser(googleUser);
    localStorage.setItem('arbrion_user', JSON.stringify(googleUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('arbrion_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
