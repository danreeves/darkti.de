import { useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { z } from "zod"
import { zx } from "zodix"
import { getAuthToken } from "~/services/db/authtoken.server"
import { authenticator } from "~/services/auth.server"
import { getGameplaySession } from "~/services/db/gameplaySessions.server"

export async function loader({ params, request }: LoaderArgs) {
	let { character: characterId, sessionId } = zx.parseParams(params, {
		character: z.string(),
		sessionId: z.string(),
	})
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	let auth = await getAuthToken(user.id)

	let gameplaySession = await getGameplaySession({
		accountId: auth.sub,
		characterId,
		sessionId,
	})

	return json({
		session: gameplaySession,
	})
}

export default function Statistics() {
	let { session } = useLoaderData<typeof loader>()

	return (
		<div className="max-w-7xl mx-auto flex gap-4 pb-4 flex-wrap">
			{JSON.stringify(session)}
		</div>
	)
}
