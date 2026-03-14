import { useState, useEffect, useCallback } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  const handleChange = useCallback((e: MediaQueryListEvent) => {
    setMatches(e.matches);
  }, []);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [query, handleChange]);

  return matches;
}

export function useBreakpoint() {
  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isXl = useMediaQuery('(min-width: 1280px)');
  const is2Xl = useMediaQuery('(min-width: 1536px)');

  return {
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    isMobile: !isMd,
    isTablet: isMd && !isLg,
    isDesktop: isLg,
  };
}
