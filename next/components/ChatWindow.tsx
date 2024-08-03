import React, { useState } from 'react';
import ChatMessage from './ChatMessage';
import sendMessageToServer from '../Utility/utils';
import Message from '../TS/types';

const ChatWindow: React.FC<{
	setIsWaiting: (waiting: boolean) => void;
	setStatus: (status: string | null) => void;
}> = ({ setIsWaiting, setStatus }) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [localIsWaiting, setLocalIsWaiting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSend = async (e: React.FormEvent) => {
		e.preventDefault();
		if (input.trim().length < 8) {
			setError('Message must be at least 8 characters long.');
			return;
		}

		setError(null); // Clear previous error
		const newMessageId = Date.now();
		const userMessage: Message = {
			id: newMessageId,
			text: input,
			sender: 'user',
		};
		setMessages((prevMessages) => [...prevMessages, userMessage]);
		setInput('');
		setLocalIsWaiting(true);
		setIsWaiting(true);
		setStatus('Processing...');

		try {
			const { generated, grading_score, hellucination_score } =
				await sendMessageToServer(input);
			const botMessageId = newMessageId + 1;

			const botMessage: Message = {
				id: botMessageId,
				text: `${generated}\n\nGrading Score: ${grading_score}%\nHellucination Score: ${Math.round(
					hellucination_score
				)}%`,
				sender: 'bot',
			};
			setMessages((prevMessages) => [...prevMessages, botMessage]);
		} catch (error) {
			console.error('Error sending data', error);
		} finally {
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
						key={message.id}
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
