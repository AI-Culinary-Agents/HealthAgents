import { prisma } from '@/lib/prisma';
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

				let user = await prisma.user.findUnique({
					where: { email: profile.email },
				});

				if (!user) {
					user = await prisma.user.create({
						data: {
							email: profile.email,
							name: profile.name || '',
							password: 'google', // Or any placeholder since Google users won't have a password
						},
					});
				}

				// Attach the database user ID to the account
				account.id = user.id;
			}
			return true;
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id; // Use the database user ID
			}
			return session;
		},
		async jwt({ token, user, account }) {
			if (user) {
				token.id = user.id; // Store the database user ID in the token
			}
			if (account && account.id) {
				token.id = account.id; // Ensure to store the ID from account during Google sign-in
			}
			return token;
		},
	},
};

const handler = NextAuth(authOption);
export { handler as GET, handler as POST };
