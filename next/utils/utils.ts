import axios from 'axios';

const sendMessageToServer = async (messageData: object) => {
	console.log(messageData);
	return messageData;
	// TODO Here post to /api/messages with user message
	const response = await axios.post('http://127.0.0.1:5000/api/data', {
		text: messageData,
	});
	console.log(response.data);
	// TODO Here post to /api/messages with bot message. before doing that make sure in python server it also adds a is_bot property as true
	// ? now in the chatwindow it's possibly going to need to filter messages by id before displaying them to avoid
	//? showing duplicate after recieving the bot message
	// ! styling alternating logic might need to change
	// next step is to connect interpreter to the whole system
	// test the whole system and update the prompt for interpreter if needed
	return response.data;
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
