import type { AuthToken } from "@prisma/client"
import { prisma } from "~/data/db.server"

type UpdateArgs = Omit<AuthToken, "id">
export async function updateAuthToken(payload: UpdateArgs) {
  return await prisma.authToken.upsert({
    where: { userId: payload.userId },
    update: payload,
    create: payload,
  })
}

export async function deleteAuthToken(userId: number) {
  return await prisma.authToken.delete({
    where: { userId },
  })
}

export async function getAuthToken(userId: number) {
  return await prisma.authToken.findUnique({
    where: { userId },
  })
}
