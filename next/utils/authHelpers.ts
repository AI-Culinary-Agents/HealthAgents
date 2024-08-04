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
		console.log('Sign up form submitted');
		console.log('Name:', name);
		console.log('Email:', email);
		console.log('Password:', password);

		const response = await axios.post('/api/register', {
			name,
			email,
			password,
		});

		console.log('Response data:', response.data);

		if (response.status === 201) {
			console.log('User registered successfully');
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

export const handleSignOut = async (router: any) => {
	try {
		await signOut({ redirect: false });
		router.push('/signup');
	} catch (error) {
		console.error('Error during sign-out:', error);
	}
};
