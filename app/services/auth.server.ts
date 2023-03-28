import { Authenticator } from "remix-auth"
import { sessionStorage } from "~/services/session.server"
import { SteamStrategy } from "remix-auth-steam"
import type { SteamStrategyVerifyParams } from "remix-auth-steam"

export type User = SteamStrategyVerifyParams

export let authenticator = new Authenticator<User>(sessionStorage)

authenticator.use(
	new SteamStrategy(
		{
			returnURL: "http://localhost:3000/auth/steam/callback",
			apiKey: process.env.STEAM_API_KEY!,
		},
		async (user) => user // perform additional checks for user here, I just leave this to SteamStrategyVerifyParams value
	)
)
