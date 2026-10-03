'use client';

import { useState, useEffect } from 'react';
import { UserSession } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setUser({
              id: data.data.id,
              email: data.data.email,
              name: data.data.name,
              role: data.data.role,
              studentId: data.data.student?.id,
              teacherId: data.data.teacher?.id,
            });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  return { user, isLoading };
}
