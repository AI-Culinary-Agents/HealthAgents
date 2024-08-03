// src/components/Layout.tsx
import React from 'react';
import '../styles/global.css';
const Layout = ({ children }: { children: React.ReactNode }) => {
	return <div className='flex h-screen bg-gray-100 relative'>{children}</div>;
};

export default Layout;
