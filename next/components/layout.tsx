import React from 'react';
import Sidebar from './Sidebar';
import SettingsButton from './Settings'; 

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className='relative flex h-screen bg-gray-100'>
			<Sidebar />
			<div className='relative flex-1 p-4'>
				<div className='absolute z-10 top-4 right-4'>
					<SettingsButton currentThread={undefined} />
				</div>
				{children}
			</div>
		</div>
	);
};

export default Layout;
