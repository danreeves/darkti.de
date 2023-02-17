import type { ActionArgs } from "@remix-run/node"; // or cloudflare/deno

export const action = async ({ request }: ActionArgs) => {
	const { origin } = new URL(request.url)
	const analyticsHost = 'https://plausible.io'
	const forwardPath = request.url.replace(origin, analyticsHost)

	return await fetch(forwardPath, { method: request.method, headers: request.headers, body: request.body })
};
