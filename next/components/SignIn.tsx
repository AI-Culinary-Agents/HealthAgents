'use client';

import React, { useEffect, useState } from 'react';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';

const SignUp = () => {
	const [mounted, setMounted] = useState(false);
	const { data: session, status } = useSession();
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

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

	const handleEmailSignUp = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		setLoading(true);
		try {
			console.log('Sign up form submitted');
			console.log('Email:', email);
			console.log('Password:', password);

			const response = await axios.post('/api/register', {
				email,
				password,
			});

			console.log('Response data:', response.data);

			if (response.status === 201) {
				console.log('User registered successfully');
				// Sign in the user and redirect immediately
				await signIn('credentials', { email, password, redirect: false });
				router.push('/');
			} else {
				console.error('Error registering user:', response.data.message);
				setLoading(false); // Stop loading if there is an error
			}
		} catch (error) {
			console.error('Error during email sign-up:', error);
			setLoading(false); // Stop loading if there is an error
		}
	};

	if (status === 'loading' || loading) {
		return <div>Loading...</div>; // Replace with your custom loading component if needed
	}

	return (
		<div>
			<h1>Sign Up</h1>
			{session ? (
				<div>
					{session.user?.image && (
						<Image
							src={session.user?.image}
							alt='Profile Picture'
							width={100}
							height={100}
						/>
					)}
					<p>Signed in as {session.user?.email}</p>
					<button onClick={handleSignOut}>Sign out</button>
				</div>
			) : (
				<div>
					<button onClick={handleSignIn}>Sign up with Google</button>
					<form onSubmit={handleEmailSignUp}>
						<input
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder='Email'
							required
						/>
						<input
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder='Password'
							required
						/>
						<button type='submit'>Sign up with Email</button>
					</form>
				</div>
			)}
		</div>
	);
};

export default SignUp;
