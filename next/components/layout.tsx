// src/components/Layout.tsx
import React from "react"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex h-screen bg-gray-100 relative">{children}</div>
}

export default Layout
