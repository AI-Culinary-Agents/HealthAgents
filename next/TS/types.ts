type Message = {
	messageId: number;
	text: string;
	threadid: number;
	sender: 'user' | 'bot';
	userId: string;
};
export default Message;
