import React from 'react';
import { GrUserSettings } from 'react-icons/gr';
import Link from 'next/link';
const SettingsButton = ({ currentThread }: { currentThread: any }) => {
	currentThread = currentThread;
	return (
		<div>
			<Link href='/profile'>
				<button className='flex items-center p-2 text-white bg-gray-800 rounded'>
					<GrUserSettings
						size={24}
						color='#FFFFFF'
					/>
					<span className='ml-2'>Settings</span>
				</button>
			</Link>
		</div>
	);
};

export default SettingsButton;
