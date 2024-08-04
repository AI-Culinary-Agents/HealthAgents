import { prisma } from '@/lib/prisma';
import { User } from './types';
export const createUser = async (data: User) => {
	return prisma.user.create({ data });
};
