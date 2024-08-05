import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
	return <div className='relative flex h-screen bg-gray-100'>{children}</div>;
};

export default Layout;
