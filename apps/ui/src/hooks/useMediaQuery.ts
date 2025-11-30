import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
	const [matches, setMatches] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		if (typeof window === 'undefined') return;
		const mq = window.matchMedia(query);
		setMatches(mq.matches);
		const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	}, [query]);

	return mounted ? matches : false;
};

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
