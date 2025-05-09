'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Updated import

type UserRole = 'ROLE_ADMIN' | 'ROLE_STUDENT' | 'ROLE_TEACHER' | null;

interface AuthState {
  isAuthenticated: boolean;
  userRole: UserRole;
  username: string | null;
  userId: number | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userRole: null,
    username: null,
    userId: null,
    isLoading: true,
    error: null
  });

  const router = useRouter();

  // Função para verificar autenticação
  const checkAuth = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const meResponse = await fetch('/api/user/me', {
        method: 'GET',
        credentials: 'include'
      });

      if (!meResponse.ok) {
        throw new Error('Not authenticated');
      }

      const username = await meResponse.text();
      const userResponse = await fetch(`/api/user/name/${username}`, {
        credentials: 'include'
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user details');
      }

      const userData = await userResponse.json();

      let userRole: UserRole = null;
      if (userData.authorities.includes('ROLE_ADMIN')) {
        userRole = 'ROLE_ADMIN';
      } else if (userData.authorities.includes('ROLE_STUDENT')) {
        userRole = 'ROLE_STUDENT';
      } else if (userData.authorities.includes('ROLE_TEACHER')) {
        userRole = 'ROLE_TEACHER';
      }

      setAuthState({
        isAuthenticated: true,
        userRole,
        username: userData.username,
        userId: userData.id,
        isLoading: false,
        error: null
      });

    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        userRole: null,
        username: null,
        userId: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/authentication/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const userData = await response.json();

      let userRole: UserRole = null;
      if (userData.authorities.includes('ROLE_ADMIN')) {
        userRole = 'ROLE_ADMIN';
      } else if (userData.authorities.includes('ROLE_STUDENT')) {
        userRole = 'ROLE_STUDENT';
      } else if (userData.authorities.includes('ROLE_TEACHER')) {
        userRole = 'ROLE_TEACHER';
      }

      setAuthState({
        isAuthenticated: true,
        userRole,
        username: userData.username,
        userId: userData.id,
        isLoading: false,
        error: null
      });

      // Updated navigation
      if (userRole === 'ROLE_ADMIN') {
        router.push('/admin/dashboard');
      } else if (userRole === 'ROLE_STUDENT') {
        router.push('/student/dashboard');
      } else if (userRole === 'ROLE_TEACHER') {
        router.push('/teacher/dashboard');
      }

    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/authentication/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      setAuthState({
        isAuthenticated: false,
        userRole: null,
        username: null,
        userId: null,
        isLoading: false,
        error: null
      });
      router.push('/auth');
    }
  };

  return {
    ...authState,
    login,
    logout,
    checkAuth
  };
};
