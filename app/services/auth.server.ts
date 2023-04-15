import { Authenticator } from "remix-auth"
import { SteamStrategy } from "remix-auth-steam"
import { sessionStorage } from "~/services/session.server"
import { getOrCreateSteamUser } from "~/data/user.server"

let domain =
  process.env.NODE_ENV === "production"
    ? "https://darkti.de"
    : "http://localhost:3000"

export type User = {
  id: number
  publicId: string
  avatar: string
  accountType: "steam"
}

export let authenticator = new Authenticator<User>(sessionStorage)

authenticator.use(
  new SteamStrategy(
    {
      returnURL: `${domain}/auth/steam/callback`,
      apiKey: process.env.STEAM_API_KEY!,
    },
    async (steamUser) => {
      let user = await getOrCreateSteamUser(steamUser.steamID)

      if (!user) {
        throw new Error("Could not find user")
      }

      return {
        id: user.id,
        publicId: user.publicId,
        avatar: steamUser.avatar.medium,
        accountType: "steam",
      }
    }
  )
)




