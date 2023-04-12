import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { getAuthToken } from "~/data/authtoken.server"
import { authenticator } from "~/services/auth.server"
import { getAccountSummary } from "~/services/darktide.server"

export let loader = async ({ request }: LoaderArgs) => {
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	let auth = await getAuthToken(user.id)
	if (auth) {
		let account = await getAccountSummary(auth)
		let firstCharId = account?.summary.characters[0].id
		if (firstCharId) {
			return redirect(`/armoury/${firstCharId}/inventory`)
		}
	}

	// return redirect("/login")
}
