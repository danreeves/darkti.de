import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { updateAuthToken } from "~/data/authtoken.server"
import { getUserBySteamId } from "~/data/user.server"
import { checkToken, joinQueue } from "~/services/darktide.server"

export let loader = async ({ request, params }: LoaderArgs) => {
  let steamSessionTicket = request.headers.get("steam-auth-session-ticket")
  if (!params.steamId || !steamSessionTicket) {
    return json({ error: "Invalid request" }, { status: 400 })
  }

  let user = await getUserBySteamId(params.steamId)
  if (!user) {
    return json(
      { error: "User not found. Sign up at https://darkti.de first." },
      { status: 404 }
    )
  }

  let join = await joinQueue(steamSessionTicket)

  if (!join) {
    return json({ error: "Failed to join auth queue" }, { status: 400 })
  }

  let auth = await checkToken(join.queueTicket)

  if (!auth) {
    return json({ error: "Failed to get auth token" }, { status: 400 })
  }

  await updateAuthToken({ userId: user.id, ...auth })

  return json({ ok: true })
}
