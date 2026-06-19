import { useEffect } from 'react';
import { useUIStore } from '../store';

export function useIsMobile(breakpoint = 768) {
  const isMobile = useUIStore((state) => state.isMobile);
  const setIsMobile = useUIStore((state) => state.setIsMobile);

  useEffect(() => {
    let prevIsMobile = window.innerWidth < breakpoint;

    const check = () => {
      const currentIsMobile = window.innerWidth < breakpoint;
      setIsMobile(currentIsMobile);
      
      if (currentIsMobile !== prevIsMobile) {
        useUIStore.getState().setSidebarOpen(!currentIsMobile);
        prevIsMobile = currentIsMobile;
      }
    };
    
    // Initial setup
    setIsMobile(prevIsMobile);
    useUIStore.getState().setSidebarOpen(!prevIsMobile);

    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint, setIsMobile]);

  return isMobile;
}
