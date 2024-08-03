import axios from "axios"

const sendMessageToServer = async (input: string) => {
  const response = await axios.post("http://127.0.0.1:5000/api/data", {
    text: input,
  })
  return response.data
}
export default sendMessageToServer

export const initializeEventSource = (
  url: string,
  onMessage: (data: unknown) => void
) => {
  const eventSource = new EventSource(url)

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)
    onMessage(data)
  }

  return () => {
    eventSource.close()
  }
}
