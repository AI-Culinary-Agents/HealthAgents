"use client"

import React from "react"
import "../styles/global.css" // Importing global CSS
// import Sidebar from "../components/Sidebar"

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/vite.svg"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>Vite + React + TS</title>
      </head>
      <body className="flex h-screen bg-gray-100 relative">
        {/* <Sidebar /> */}
        <main className="flex-1 p-4 flex flex-col">{children}</main>
      </body>
    </html>
  )
}

export default RootLayout
