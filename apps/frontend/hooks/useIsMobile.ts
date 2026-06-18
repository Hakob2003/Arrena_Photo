import { useEffect } from 'react';
import { useUIStore } from '../store';

export function useIsMobile(breakpoint = 768) {
  const isMobile = useUIStore((state) => state.isMobile);
  const setIsMobile = useUIStore((state) => state.setIsMobile);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint, setIsMobile]);

  return isMobile;
}
