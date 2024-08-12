import axios from 'axios';

const sendMessageToServer = async (messageData: {
	messageId: number;
	text: string;
	sender: string;
	userId: string;
	threadid: number;
}) => {
	console.log(messageData);

	// TODO: Here post to /api/messages with user message
	try {
		// Send the original user message to the backend
		await axios.post('/api/message', {
			thread_id: messageData.threadid,
			user_id: messageData.userId,
			message: messageData.text,
			is_bot: false,
		});

		// Send the message data to the external API
		const response = await axios.post('http://127.0.0.1:5000/api/data', {
			message: messageData,
		});

		console.log(response.data);

		// TODO: Here post to /api/messages with bot message and a value for is_bot true
		await axios.post('/api/message', {
			thread_id: messageData.threadid,
			user_id: messageData.userId,
			message: response.data,
			is_bot: true,
		});

		// Return the bot's response data
		console.log(response.data);
		return response.data;
	} catch (error) {
		console.error('Error sending messages:', error);
		return null;
	}

	// ? Now in the chat window, it's possibly going to need to filter messages by id before displaying them to avoid
	// ? showing duplicate after receiving the bot message

	// ! Styling alternating logic might need to change

	// Next step is to connect interpreter to the whole system
	// Test the whole system and update the prompt for the interpreter if needed
};

export default sendMessageToServer;

export const initializeEventSource = (
	url: string,
	onMessage: (data: unknown) => void
) => {
	const eventSource = new EventSource(url);

	eventSource.onmessage = (event) => {
		const data = JSON.parse(event.data);
		onMessage(data);
	};

	return () => {
		eventSource.close();
	};
};
