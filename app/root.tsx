import type { LinksFunction, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
	Links,
	LiveReload,
	Meta,
	Scripts,
	useLoaderData,
} from "@remix-run/react"
import Layout from "~/layout"

import tailwind from "~/tailwind.css"
import { authenticator } from "~/services/auth.server"

import { initJobs } from "~/jobs/index.server"
import { useRevalidateOnFocus } from "~/hooks/revalidateOnFocus"

// Sets up Cron singletons to perform timed jobs on the server
initJobs && initJobs()

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: tailwind },
	{
		rel: "preconnect",
		href: "https://fonts.bunny.net",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.bunny.net/css?family=archivo:900|montserrat:600,700",
	},
]

export function meta() {
	return [{ title: "Darkti.de - unofficial community tools" }]
}

export let loader = async ({ request }: LoaderArgs) => {
	const user = await authenticator.isAuthenticated(request)
	return json({ user })
}

export default function App() {
	const { user } = useLoaderData<typeof loader>()

	useRevalidateOnFocus()

	return (
		<html lang="en" className="h-screen bg-gray-100">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="h-screen">
				<Layout user={user} />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
