import { prisma } from '@/lib/prisma';
import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { upsertUser, findUserByEmail } from '@/models/userModel';
import bcrypt from 'bcryptjs';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

const authOption: NextAuthOptions = {
	session: {
		strategy: 'jwt',
	},
	providers: [
		GoogleProvider({
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET,
			authorization: {
				params: {
					prompt: 'consent',
					access_type: 'offline',
					response_type: 'code',
				},
			},
		}),
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials.password) {
					throw new Error('Email and password are required');
				}
				const user = await findUserByEmail(credentials.email);
				if (!user || !user.password) {
					throw new Error('No user found or password not set');
				}
				const isValid = await bcrypt.compare(
					credentials.password,
					user.password
				);
				if (!isValid) {
					throw new Error('Invalid password');
				}
				return user;
			},
		}),
	],
	callbacks: {
		async signIn({ account, profile }) {
			if (account && account.provider === 'google') {
				if (!profile?.email) {
					throw new Error('No profile');
				}

				const existingUser = await findUserByEmail(profile.email);
				const userId = existingUser?.id ?? '';

				await upsertUser({
					id: userId,
					email: profile.email,
					name: profile.name || '',
					password: 'google',
				});
			}
			return true;
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id;
			}
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id; // Store the database user ID in the token
			}
			return token;
		},
	},
};

const handler = NextAuth(authOption);
export { handler as GET, handler as POST };
