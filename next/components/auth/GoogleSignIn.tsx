'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { handleGoogleSignIn } from '@/utils/authHelpers';

const GoogleSignIn = () => {
	const router = useRouter();

	const handleSignIn = async () => {
		await handleGoogleSignIn('/');
		setTimeout(() => {
			router.push('/');
		}, 1000);
	};

	return (
		<button
			onClick={handleSignIn}
			className='px-6 py-3 text-white transition-colors duration-300 bg-blue-500 rounded hover:bg-blue-700'>
			Sign up with Google
		</button>
	);
};

export default GoogleSignIn;
