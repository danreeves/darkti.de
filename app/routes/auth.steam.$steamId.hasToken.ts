import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { getAuthTokenBySteamId } from "~/data/authtoken.server"

export async function loader({ params }: LoaderArgs) {
	if (params.steamId) {
		try {
			await getAuthTokenBySteamId(params.steamId)
			return json({ hasToken: true })
		} catch (e) {}
	}
	return json({ hasToken: false })
}
