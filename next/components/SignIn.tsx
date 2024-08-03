"use client"

import React, { useEffect, useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const SignUp = () => {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignIn = async () => {
    try {
      const result = await signIn("google", { callbackUrl: "/profile" })
      console.log("signIn result:", result)

      const session = await getSession()
      console.log("session after signIn:", session)

      if (session) {
        router.push("/profile") // Redirect to profile page after sign-in
      }
    } catch (error) {
      console.error("Error during sign-in:", error)
    }
  }

  if (!mounted) {
    return null // Or a loading indicator
  }

  return (
    <div>
      <h1>Sign Up</h1>
      <button onClick={handleSignIn}>Sign up with Google</button>
    </div>
  )
}

export default SignUp
