import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
	Links,
	LiveReload,
	Meta,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "@remix-run/react"
import Layout from "~/layout"

import tailwind from "~/tailwind.css"
import { authenticator } from "~/services/auth.server"

// Sets up Cron singletons to perform timed jobs on the server
import { initJobs, getTunnel } from "~/jobs/index.server"
initJobs && initJobs()
getTunnel && getTunnel()

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: tailwind },
	{
		rel: "preconnect",
		href: "https://fonts.bunny.net",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.bunny.net/css?family=archivo:900",
	},
]

export const meta: MetaFunction = () => ({
	charset: "utf-8",
	title: "Darkti.de - unofficial community tools",
	viewport: "width=device-width,initial-scale=1",
})

export let loader = async ({ request }: LoaderArgs) => {
	const user = await authenticator.isAuthenticated(request)
	return json({ user })
}

export default function App() {
	const { user } = useLoaderData<typeof loader>()

	return (
		<html lang="en" className="h-screen bg-gray-100">
			<head>
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
