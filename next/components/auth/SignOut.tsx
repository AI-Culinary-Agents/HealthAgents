'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { handleSignOut } from '@/utils/authHelpers';

const SignOut = () => {
	const router = useRouter();

	const handleSignOutClick = async () => {
		await handleSignOut(router);
	};

	return (
		<button
			onClick={handleSignOutClick}
			className='px-6 py-3 text-white transition-colors duration-300 bg-red-500 rounded hover:bg-red-700'>
			Sign out
		</button>
	);
};

export default SignOut;
