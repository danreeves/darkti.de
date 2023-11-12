import type { ActionFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { getClientIPAddress } from "remix-utils/get-client-ip-address"

export async function action({ request }: ActionFunctionArgs) {
	try {
		const { origin } = new URL(request.url)
		const analyticsHost = "https://plausible.io"
		const forwardPath = request.url.replace(origin, analyticsHost)

		const clientIp = getClientIPAddress(request)
		const clientUserAgent = request.headers.get("user-agent")

		if (!clientIp || !clientUserAgent) {
			return null
		}

		const headers = {
			"content-type": "application/json",
			"x-forwarded-for": clientIp,
			"user-agent": clientUserAgent,
		}

		let body = await request.text()

		body = body.replaceAll(
			/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g,
			":id",
		)

		return await fetch(forwardPath, {
			method: request.method,
			headers,
			body: body,
		})
	} catch (e) {
		console.log("event error")
		console.log(e)
		return json({ e })
	}
}

export async function loader() {
	throw new Response(null, {
		status: 404,
		statusText: "Not Found",
	})
}
