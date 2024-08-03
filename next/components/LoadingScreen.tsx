import React from "react"

const LoadingScreen: React.FC<{ status: string | null }> = ({ status }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="bg-white p-6 rounded shadow-md text-center">
        <div className="flex justify-center mb-4">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-10 w-10"></div>
        </div>
        <p>{status}</p>
        <p className="mt-2 text-sm text-gray-500">
          Do not reload the page, or you will lose the conversation.
        </p>
      </div>
    </div>
  )
}

export default LoadingScreen
