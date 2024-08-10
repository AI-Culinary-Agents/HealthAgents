import React from 'react';
import Message from '../TS/types';

type ChatMessageProps = {
	message: Message;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
	if (!message || !message.text) return null; // Ensure message and message.text are defined
	const formattedText = message.text.replace(/\n/g, '<br />');

	return (
		<div
			className={`flex ${
				message.sender === 'user' ? 'justify-end' : 'justify-start'
			} mb-4`}>
			<div
				className={`${
					message.sender === 'user'
						? 'bg-yellow-500 text-white mr-14'
						: 'bg-gray-300 text-gray-700'
				} p-4 rounded-lg max-w-lg`}
				dangerouslySetInnerHTML={{ __html: formattedText }}
			/>
		</div>
	);
};

export default ChatMessage;
