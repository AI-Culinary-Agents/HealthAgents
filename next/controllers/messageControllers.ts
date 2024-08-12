import { NextRequest, NextResponse } from 'next/server';
import { createMessage, getMessagesByThreadId } from '@/models/messageModel';

export const handleCreateMessage = async (req: NextRequest) => {
	try {
		const { thread_id, user_id, message, is_bot } = await req.json();
		console.log(thread_id, user_id, message, is_bot);

		if (!thread_id || !user_id || !message) {
			return NextResponse.json(
				{ message: 'thread_id, user_id, and message are required' },
				{ status: 400 }
			);
		}

		// Handle message differently based on whether it's from the bot or the user
		let processedMessage = message;

		if (is_bot) {
			// If the message is from the bot, and it's in a more complex format,
			// you might want to serialize it, extract relevant parts, or just store it as is
			if (typeof message !== 'string') {
				processedMessage = JSON.stringify(message); // Example of serializing the object
			}
		}

		const newMessage = await createMessage({
			thread_id,
			user_id,
			message: processedMessage, // Store the processed or original message
			is_bot: is_bot || false,
		});

		return NextResponse.json(newMessage, { status: 201 });
	} catch (error: any) {
		return NextResponse.json(
			{ message: 'Error creating message', error },
			{ status: 500 }
		);
	}
};

export const handleGetMessagesByThread = async (req: NextRequest) => {
	try {
		const thread_id = req.nextUrl.searchParams.get('thread_id');

		if (!thread_id) {
			return NextResponse.json(
				{ message: 'thread_id is required' },
				{ status: 400 }
			);
		}

		const messages = await getMessagesByThreadId(parseInt(thread_id));

		return NextResponse.json(messages, { status: 200 });
	} catch (error: any) {
		return NextResponse.json(
			{ message: 'Error fetching messages', error },
			{ status: 500 }
		);
	}
};
