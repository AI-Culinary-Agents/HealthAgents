import NextAuth, { defaultSession } from 'next-auth/next';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
		} & defaultSession['user'];
	}
}
