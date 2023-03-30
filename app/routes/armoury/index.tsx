import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import { getAuthToken } from "~/data/authtoken.server"
import { authenticator } from "~/services/auth.server"
import { getCharacters } from "~/services/darktide.server"

export let loader = async ({ request }: LoaderArgs) => {
	let user = await authenticator.isAuthenticated(request)
	if (!user) return
	let auth = await getAuthToken(user.id)
	if (!auth) return
	let characters = await getCharacters(auth)
	return json({ characters })
}
export default function Codex() {
	const { characters } = useLoaderData<typeof loader>()
	return (
		<div className="bg-red-100">
			hello hello 🐌
			<pre>{JSON.stringify(characters, null, 4)}</pre>
			<Outlet />
		</div>
	)
}
