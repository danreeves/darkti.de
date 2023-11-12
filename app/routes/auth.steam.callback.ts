import type { LoaderFunctionArgs } from "@remix-run/node"
import { authenticator } from "~/services/auth.server"

export let loader = ({ request }: LoaderFunctionArgs) => {
	return authenticator.authenticate("steam", request, {
		successRedirect: "/armoury",
		failureRedirect: "/login",
	})
}
