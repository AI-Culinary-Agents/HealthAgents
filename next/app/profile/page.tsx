import React from "react"
import { getUserSession } from "@/lib/session"

export default async function ProfilePage() {
  const user = await getUserSession()
  return (
    <main>
      <h1>Profile</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </main>
  )
}
