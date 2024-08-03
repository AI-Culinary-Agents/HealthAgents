import { prisma } from '@/lib/prisma';

export const upsertUser = async (email: string, name: string) => {
	return prisma.user.upsert({
		where: {
			email,
		},
		create: {
			email,
			name,
		},
		update: {
			name,
		},
	});
};

export const findUserByEmail = async (email: string) => {
	return prisma.user.findUnique({
		where: {
			email,
		},
	});
};
