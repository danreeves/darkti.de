import type { ActionArgs } from "@remix-run/node" // or cloudflare/deno
import { getClientIPAddress } from "remix-utils"

export const action = async ({ request }: ActionArgs) => {
  const { origin } = new URL(request.url)
  const analyticsHost = "https://plausible.io"
  const forwardPath = request.url.replace(origin, analyticsHost)

  const clientIp = getClientIPAddress(request)
  const clientUserAgent = request.headers.get("user-agent")

  if (!clientIp || !clientUserAgent) {
    return
  }

  const headers = {
    "content-type": "application/json",
    "x-forwarded-for": clientIp,
    "user-agent": clientUserAgent,
  }

  return await fetch(forwardPath, {
    method: request.method,
    headers,
    body: request.body,
  })
}
