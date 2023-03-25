import type { LinksFunction, MetaFunction } from "@remix-run/node"
import {
	Links,
	LiveReload,
	Meta,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react"
import Layout from "./layout"

import tailwind from "~/tailwind.css"

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
	title: "Darkti.de - A community resource site",
	viewport: "width=device-width,initial-scale=1",
})

export default function App() {
	return (
		<html lang="en" className="h-full bg-gray-100">
			<head>
				<Meta />
				<Links />
			</head>
			<body className="h-full">
				<Layout />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
