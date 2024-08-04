import { prisma } from '@/lib/prisma';
import { User } from './types';
export const createUser = async (data: User) => {
	return prisma.user.create({ data });
};

export const findUserByEmail = async (email: string) => {
	return prisma.user.findUnique({
		where: {
			email,
		},
	});
};
