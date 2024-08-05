import bcrypt from 'bcryptjs';
import { signIn, signOut } from 'next-auth/react';
import axios from 'axios';

export const hashPassword = async (password: string): Promise<string> => {
	return bcrypt.hash(password, 10);
};

export const handleGoogleSignIn = async (callbackUrl: string) => {
	try {
		await signIn('google', { callbackUrl });
	} catch (error) {
		console.error('Error during Google sign-in:', error);
	}
};

export const handleEmailSignUp = async (
	name: string,
	email: string,
	password: string,
	router: any,
	setLoading: (loading: boolean) => void
) => {
	setLoading(true);
	try {
		const response = await axios.post('/api/register', {
			name,
			email,
			password,
		});

		if (response.status === 201) {
			await signIn('credentials', { email, password, redirect: false });
			router.push('/');
		} else {
			console.error('Error registering user:', response.data.message);
		}
	} catch (error) {
		console.error('Error during email sign-up:', error);
	} finally {
		setLoading(false);
	}
};

export const handleLogin = async (
	email: string,
	password: string,
	router: any,
	setLoading: (loading: boolean) => void
) => {
	setLoading(true);
	try {
		const response = await axios.post('/api/login', { email, password });

		if (response.status === 200) {
			await signIn('credentials', { email, password, redirect: false });
			router.push('/');
		} else {
			console.error('Error logging in:', response.data.message);
		}
	} catch (error) {
		console.error('Error during login:', error);
	} finally {
		setLoading(false);
	}
};

export const handleSignOut = async (router: any) => {
	try {
		await signOut({ redirect: false });
		router.push('/signup');
	} catch (error) {
		console.error('Error during sign-out:', error);
	}
};
