import { prisma } from '@/lib/prisma';
import { session } from '@/lib/session';
import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
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
				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
				});
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
				await prisma.user.upsert({
					where: { email: profile.email },
					create: {
						email: profile.email,
						name: profile.name,
					},
					update: {
						name: profile.name,
					},
				});
			}
			return true;
		},
		async session({ session, token }) {
			if (token && session.user) {
				(session.user as { id: string }).id = token.id as string;
			}
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
	},
};

const handler = NextAuth(authOption);
export { handler as GET, handler as POST };
