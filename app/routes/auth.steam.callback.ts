import type { LoaderArgs } from "@remix-run/node"
import { authenticator } from "~/services/auth.server"

export let loader = ({ request }: LoaderArgs) => {
	return authenticator.authenticate("steam", request, {
		successRedirect: "/armoury",
		failureRedirect: "/login",
	})
}
