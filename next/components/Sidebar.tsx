import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import Link from "next/link"

const Sidebar = () => {
  // storing threads in state
  const [threads, setThreads] = useState([
    { id: uuidv4(), name: "Thread 1" },
    { id: uuidv4(), name: "Thread 2" },
  ])
  //  storing new thread name in state
  const [newThreadName, setNewThreadName] = useState("")

  // spreads prev threads and adds new thread
  const handleAddThread = () => {
    if (newThreadName.trim() !== "") {
      setThreads([...threads, { id: uuidv4(), name: newThreadName }])
      setNewThreadName("")
    }
  }

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col p-4">
      <h2 className="text-2xl font-bold mb-4">Threads</h2>
      <ul>
        {threads.map((thread) => (
          <ol
            key={thread.id}
            className="mb-2"
          >
            {/* Links for each thread that route dynamically by threadID to app/thread/[id] */}
            <Link href={`/thread/${thread.id}`}>
              <li className="hover:underline">{thread.name}</li>
            </Link>
          </ol>
        ))}
        <li className="mt-4">
          <input
            type="text"
            value={newThreadName}
            onChange={(e) => setNewThreadName(e.target.value)}
            placeholder="New thread name"
            className="w-full p-2 rounded mb-2 text-gray-700"
          />
          <button
            onClick={handleAddThread}
            className="bg-yellow-500 text-white font-bold py-2 px-4 rounded w-full"
          >
            + Add Thread
          </button>
        </li>
      </ul>
    </aside>
  )
}

export default Sidebar
