// // components/NavEvents.js
// 'use client';

// import { useEffect, useState } from 'react';
// import { usePathname, useSearchParams } from 'next/navigation';
// import React from 'react';
// import Loading from './auth/Load';

// export function NavigationEvents() {
// 	const [loading, setLoading] = useState(false);
// 	const pathname = usePathname();
// 	const searchParams = useSearchParams();

// 	useEffect(() => {
// 		setLoading(true);

// 		const handleRouteChangeComplete = () => {
// 			setLoading(false);
// 		};

// 		// Simulate load time or handle data fetching here
// 		const timeout = setTimeout(handleRouteChangeComplete, 1000); // Adjust time as needed

// 		return () => {
// 			clearTimeout(timeout);
// 		};
// 	}, [pathname, searchParams]);

// 	return loading ? <Loading /> : null;
// }
