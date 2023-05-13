import { ActionArgs, json } from "@remix-run/node"
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

		let body = await request.json()

		// @ts-ignore: I don't care if this fails really...
		Object.keys(body).forEach((key) => {
			// @ts-ignore: I don't care if this fails really...
			if (typeof body[key] === "string") {
				// Replace UUIDs with :id
				// @ts-ignore: I don't care if this fails really...
				body[key] = body[key].replaceAll(
					/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g,
					":id"
				)
			}
		})

		return await fetch(forwardPath, {
			method: request.method,
			headers,
			body: JSON.stringify(body),
		})
	} catch (e) {
		console.log("event error")
		console.log(e)
		return json({ e })
	}
}
