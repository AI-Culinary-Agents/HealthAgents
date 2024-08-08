import { prisma } from '@/lib/prisma';

// export const createMessage = async (data: User) => {
// 	return prisma.user.upsert({
// 		where: { email: data.email },
// 		update: {
// 			...data,
// 			updatedAt: new Date(),
// 		},
// 		create: data,
// 	});
// };

// export const findUserByEmail = async (email: string) => {
// 	return prisma.user.findUnique({
// 		where: {
// 			email,
// 		},
// 	});
// };
