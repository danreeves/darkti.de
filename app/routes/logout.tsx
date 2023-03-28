import type { LoaderArgs } from "@remix-run/node"
import { authenticator } from "~/services/auth.server"

export let loader = async ({ request }: LoaderArgs) => {
	await authenticator.logout(request, { redirectTo: "/" })
}
