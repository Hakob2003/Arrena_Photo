import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function useIdleLogout() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only track if user is logged in
    if (!user) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const resetTimeout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        logout();
        toast.error('Вы были отключены из-за неактивности (30 минут)');
        router.push('/');
      }, TIMEOUT_MS);
    };

    // Initialize timeout
    resetTimeout();

    // Events to track user activity
    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll'
    ];

    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, logout, router]);
}
