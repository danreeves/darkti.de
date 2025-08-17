import { Outlet } from "react-router"
import { Book } from "~/components/Book"
import type { Route } from "./+types/site"

export default function SiteLayout({ matches }: Route.ComponentProps) {
	const currentRoute = matches.at(-1)
	// @ts-expect-error -- We don't know the type of loaderData for every page but we expect a page title
	const pageTitle = currentRoute?.loaderData?.title || "[UNKNOWN LOCATION]"
	return (
		<div className="container mx-auto min-h-screen p-6">
			<div className="mb-4 flex flex-row items-center border-b border-green-500 pb-4">
				<Book className="" />
				<h1 className="font-machine flex-1 text-center text-5xl font-extrabold tracking-widest text-green-500">
					+++ {pageTitle} +++
				</h1>
			</div>

			<Outlet />

			<footer className="mt-8 text-center text-sm text-green-600 uppercase">
				<p>++++ For the Emperor ++++</p>
			</footer>
		</div>
	)
}
