'use client';

import React, { useEffect, useState } from 'react';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const SignUp = () => {
	const [mounted, setMounted] = useState(false);
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleSignIn = async () => {
		try {
			await signIn('google', { callbackUrl: '/' });

			// Adding a delay to ensure session is updated
			setTimeout(() => {
				if (session) {
					console.log('Session after signIn:', session);
					router.push('/'); // Redirect after sign-in
				}
			}, 1000);
		} catch (error) {
			console.error('Error during sign-in:', error);
		}
	};

	const handleSignOut = async () => {
		try {
			await signOut({ redirect: false });
			router.push('/signup');
		} catch (error) {
			console.error('Error during sign-out:', error);
		}
	};

	if (status === 'loading') {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h1>Sign Up</h1>
			{session ? (
				<div>
					<Image
						src={session.user?.image ?? ''}
						alt='Landscape picture'
						width={100}
						height={100}
					/>
					<p>Signed in as {session.user?.email}</p>
					<button onClick={handleSignOut}>Sign out</button>
				</div>
			) : (
				<button onClick={handleSignIn}>Sign up with Google</button>
			)}
		</div>
	);
};

export default SignUp;
