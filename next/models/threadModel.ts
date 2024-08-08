import { prisma } from '@/lib/prisma';

// find user by id ig
export const findUserById = async (id: string) => {
	return await prisma.user.findUnique({
		where: { id },
	});
};
export const createThread = async (name: string, created_by: string) => {
	return await prisma.thread.create({
		data: {
			name,
			created_by,
		},
	});
};

export const getAllThreads = async () => {
	return await prisma.thread.findMany();
};

export const getThreadsByUserId = async (userId: string) => {
	return await prisma.thread.findMany({
		where: { created_by: userId },
	});
};
