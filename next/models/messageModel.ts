import { prisma } from '@/lib/prisma';

export const createMessage = async (messageData: {
	thread_id: number;
	user_id: string;
	message: string;
	is_bot: boolean;
}) => {
	return await prisma.message.create({
		data: messageData,
	});
};

export const getMessagesByThreadId = async (thread_id: number) => {
	return await prisma.message.findMany({
		where: { thread_id },
		orderBy: { created_at: 'asc' }, // Order messages by creation time
	});
};
