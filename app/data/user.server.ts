import { prisma } from "~/data/db.server"
import { nanoid } from "~/utils/nanoid"

export async function getUserBySteamId(steamId: string) {
  return await prisma.user.findUnique({ where: { steam_id: steamId } })
}

export async function createSteamUser(steamId: string) {
  let publicId = nanoid()

  let user = await prisma.user.create({
    data: {
      public_id: publicId,
      steam_id: steamId,
    },
  })

  return user
}

export async function getOrCreateSteamUser(steamId: string) {
  let user = await getUserBySteamId(steamId)

  if (!user) {
    user = await createSteamUser(steamId)
  }

  return user
}
