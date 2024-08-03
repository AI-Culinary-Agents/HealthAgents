// import { NextApiRequest, NextApiResponse } from "next"
// import { getSession } from "next-auth/react"
// import { prisma } from "../../../../lib/prisma"

// export async function GET(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getSession({ req })

//   if (!session) {
//     return res.status(401).json({ message: "Unauthorized" })
//   }

//   const email = session.user?.email ?? ""

//   try {
//     const user = await prisma.user.findUnique({
//       where: { email },
//     })

//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     return res.status(200).json(user)
//   } catch (error) {
//     console.error("Error fetching user:", error)
//     return res.status(500).json({ message: "Internal server error" })
//   }
// }
