import { SessionProvider } from 'next-auth/react';
import React from 'react';
import '../styles/global.css';

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<SessionProvider>
			<div className='relative flex h-screen bg-gray-100'>{children}</div>
		</SessionProvider>
	);
};

export default Layout;
