import type { LoaderFunctionArgs } from "@remix-run/node"
import { authenticator } from "~/services/auth.server"

export let loader = async ({ request }: LoaderFunctionArgs) => {
	await authenticator.logout(request, { redirectTo: "/" })
}
