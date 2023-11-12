import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { getAuthTokenBySteamId } from "~/services/db/authtoken.server"

export async function loader({ params }: LoaderFunctionArgs) {
	if (params.steamId) {
		try {
			await getAuthTokenBySteamId(params.steamId)
			return json({ hasToken: true })
		} catch (e) {}
	}
	return json({ hasToken: false })
}
