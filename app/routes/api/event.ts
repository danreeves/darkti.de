import type { ActionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { getClientIPAddress } from "remix-utils"

export const action = async ({ request }: ActionArgs) => {
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
			":id"
		)

		console.log({ body })

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
