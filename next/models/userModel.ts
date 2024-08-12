import { prisma } from '@/lib/prisma';
import { User } from './types';

export const upsertUser = async (data: User) => {
	return prisma.user.upsert({
		where: { email: data.email },
		update: {
			...data,
			updatedAt: new Date(),
		},
		create: data,
	});
};

export const findUserByEmail = async (email: string) => {
	return prisma.user.findUnique({
		where: {
			email,
		},
	});
};
