// App.tsx
import { useEffect, useState } from "react"
import Sidebar from "./components/Sidebar"
import ChatWindow from "./components/ChatWindow"
import LoadingScreen from "./components/LoadingScreen"
import { initializeEventSource } from "./Utility/utils"

const App = () => {
  const [isWaiting, setIsWaiting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const cleanupEventSource = initializeEventSource(
      "http://127.0.0.1:5000/api/updates",
      // @ts-expect-error not sure yet
      (data: { status: string }): void => {
        setStatus(data.status + "...")
      }
    )

    return () => {
      cleanupEventSource()
    }
  }, [])

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar />
      <main className="flex-1 p-4 flex flex-col">
        <div className="flex flex-col items-center justify-center h-full w-full relative">
          <h1 className="text-4xl font-bold text-yellow-500 mb-8">
            Recipe Agents
          </h1>
          <div className="w-full flex flex-col">
            <ChatWindow
              setIsWaiting={setIsWaiting}
              setStatus={setStatus}
            />
          </div>
          <p className="text-center text-gray-600 mt-4">
            Enter your dietary preferences and available ingredients, goals and
            or any useful information to get personalized 7 day meal plan by our
            5 agent team !!!
          </p>
          <p className="text-center text-gray-600 mt-4">
            Refresh to start a new conversation
          </p>
        </div>
        {isWaiting && <LoadingScreen status={status} />}
      </main>
    </div>
  )
}

export default App
