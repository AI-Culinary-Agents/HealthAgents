import React, { useState, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import sendMessageToServer from '../utils/utils';
import Message from '../TS/types';
import axios from 'axios';

const ChatWindow: React.FC<{
	setIsWaiting: (waiting: boolean) => void;
	setStatus: (status: string | null) => void;
	currentThread: number;
	userId: string;
}> = ({ setIsWaiting, setStatus, currentThread, userId }) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [localIsWaiting, setLocalIsWaiting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch messages from the database when the component mounts
	useEffect(() => {
		const fetchMessages = async () => {
			try {
				const response = await axios.get(
					`/api/message?thread_id=${currentThread}`
				);
				console.log('🚀 ~ fetchMessages ~ response:', response);

				const fetchedMessages = response.data.map((msg: any) => {
					let formattedMessage = msg.message;

					if (msg.is_bot) {
						try {
							// Parse and format the bot message if it's in JSON format
							const parsedMessage = JSON.parse(formattedMessage);
							formattedMessage = `${
								parsedMessage.generated
							}\n\nGrading Score: ${
								parsedMessage.grading_score
							}%\nHellucination Score: ${Math.round(
								parsedMessage.hellucination_score
							)}%`;
						} catch (e) {
							console.warn('Failed to parse bot message JSON', e);
						}
					}

					return {
						messageId: msg.id,
						text: formattedMessage,
						sender: msg.is_bot ? 'bot' : 'user',
						userId: msg.user_id,
						threadid: msg.thread_id,
					};
				});
				setMessages(fetchedMessages);
			} catch (error) {
				console.error('Error fetching messages:', error);
			}
		};

		fetchMessages();
	}, [currentThread]);

	const handleSend = async (e: React.FormEvent) => {
		e.preventDefault();

		setError(null); // Clear previous error
		setLocalIsWaiting(true);
		setIsWaiting(true);
		setStatus('Processing...');

		const newMessageId = Date.now();
		const userMessage: Message = {
			messageId: newMessageId,
			text: input,
			sender: 'user',
			userId: userId,
			threadid: currentThread,
		};

		// Optimistically update the UI with the user message
		setMessages((prevMessages) => [...prevMessages, userMessage]);
		setInput('');

		try {
			// Send the user message to the server
			const data = await sendMessageToServer(userMessage);
			console.log('🚀 ~ handleSend ~ data:', data);

			if (data && typeof data === 'object' && data.generated) {
				const { generated, grading_score, hellucination_score } = data;

				const botMessageId = newMessageId + 1;

				const botMessage: Message = {
					messageId: botMessageId,
					text: `${generated}\n\nGrading Score: ${grading_score}%\nHellucination Score: ${Math.round(
						hellucination_score
					)}%`,
					sender: 'bot',
					threadid: currentThread,
					userId: userId,
				};

				// Update the messages state with the bot message
				setMessages((prevMessages) => [...prevMessages, botMessage]);
			} else {
				console.error('Unexpected bot response format', data);
			}
		} catch (error) {
			console.error('Error sending data', error);
		} finally {
			// Reset loading states
			setLocalIsWaiting(false);
			setIsWaiting(false);
			setStatus(null);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput(e.target.value);
	};

	return (
		<div className='flex flex-col w-[70%] max-w-6xl mx-auto relative h-[70vh]'>
			<div className='flex-grow overflow-auto p-6 max-h=[55vh] overflow-y-auto'>
				{messages.map((message) => (
					<ChatMessage
						key={message.messageId}
						message={message}
					/>
				))}
			</div>
			<form
				onSubmit={handleSend}
				className='flex items-center mt-auto space-x-2'>
				<textarea
					value={input}
					onChange={handleChange}
					placeholder='Type your message here...'
					className='p-3 border rounded-md resize-none w-full h-[70px] flex-1'
					disabled={localIsWaiting}
				/>
				<button
					type='submit'
					className='px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-700 h-[70px]'
					disabled={localIsWaiting}>
					Send
				</button>
			</form>
			{error && (
				<div className='absolute p-3 text-white transform -translate-x-1/2 bg-red-500 rounded-md bottom-20 left-1/2'>
					{error}
				</div>
			)}
		</div>
	);
};

export default ChatWindow;
