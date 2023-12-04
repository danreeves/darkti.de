import type { ActionFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { getClientIPAddress } from "remix-utils/get-client-ip-address"

export async function action({ request }: ActionFunctionArgs) {
	throw new Response(null, {
		status: 404,
		statusText: "Not Found",
	})
}
}

export async function loader() {
	throw new Response(null, {
		status: 404,
		statusText: "Not Found",
	})
}
