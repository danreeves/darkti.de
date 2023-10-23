import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { updateAuthToken } from "~/services/db/authtoken.server"
import { getUserBySteamId } from "~/services/db/user.server"
import { checkToken, joinQueue } from "~/services/darktide.server"
import { sleep } from "~/utils/sleep"

export let loader = async ({ request, params }: LoaderArgs) => {
	let steamSessionTicket = request.headers.get("steam-auth-session-ticket")
	if (!params.steamId || !steamSessionTicket) {
		return json({ error: "Invalid request" }, { status: 400 })
	}

	let user = await getUserBySteamId(params.steamId)
	if (!user) {
		return json(
			{ error: "User not found. Sign up at https://darkti.de first." },
			{ status: 404 },
		)
	}

	let join = await joinQueue(steamSessionTicket)

	if (!join) {
		return json({ error: "Failed to join auth queue" }, { status: 400 })
	}

	let auth = await checkToken(join.queueTicket)

	let checks = 0
	let maxChecks = join.queuePosition + 1
	while (!auth && checks <= maxChecks) {
		console.log("Checking auth queue", checks, "times")
		await sleep(Math.max(1000, join.retrySuggestion))
		auth = await checkToken(join.queueTicket)
		checks++
	}

	if (!auth) {
		return json({ error: "Failed to get auth token" }, { status: 400 })
	}

	let expiresAt = new Date()
	expiresAt.setSeconds(expiresAt.getSeconds() + auth.ExpiresIn)

	await updateAuthToken({
		userId: user.id,
		expiresAt: expiresAt,
		sub: auth.Sub,
		accessToken: auth.AccessToken,
		refreshToken: auth.RefreshToken,
	})

	return json({ ok: true })
}
