import { createContext, useContext, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('cms_user');
    return raw ? JSON.parse(raw) : null;
  });

  function persist(token, user) {
    localStorage.setItem('cms_token', token);
    localStorage.setItem('cms_user', JSON.stringify(user));
    setUser(user);
  }

  async function login(email, password) {
    const { token, user } = await api.login(email, password);
    persist(token, user);
  }

  async function register(email, password) {
    const { token, user } = await api.register(email, password);
    persist(token, user);
  }

  function logout() {
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
