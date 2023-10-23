import type { ActionArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { z } from "zod"
import { saveGameplaySession } from "~/services/db/gameplaySessions.server"

let GameplaySessionSchema = z.object({
	account_id: z.string(),
	character_id: z.string(),
	session_id: z.string(),
})

export async function action({ request }: ActionArgs) {
	let body = await request.json()
	let { account_id, character_id, session_id } =
		GameplaySessionSchema.parse(body)

	await saveGameplaySession({
		accountId: account_id,
		sessionId: session_id,
		characterId: character_id,
	})

	return json({ ok: true })
}

export async function loader() {
	throw new Response(null, {
		status: 404,
		statusText: "Not Found",
	})
}
