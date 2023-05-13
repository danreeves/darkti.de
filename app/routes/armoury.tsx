import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { NavLink, Outlet, useLoaderData, useMatches } from "@remix-run/react"
import { getAuthToken } from "~/data/authtoken.server"
import { authenticator } from "~/services/auth.server"
import { ExclamationCircleIcon } from "@heroicons/react/24/outline"
import { classnames } from "~/utils/classnames"
import { getAccountSummary } from "~/services/darktide.server"

let navLinks = [
	{ label: "Trait collection", link: "traits" },
	{ label: "Mission board", link: "mission-board" },
	{ label: "Server Ping", link: "latencies" },
]

export let loader = async ({ request }: LoaderArgs) => {
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	let auth = await getAuthToken(user.id)
	if (!auth) {
		return json({ noAuth: true, characters: [] })
	}

	let account = await getAccountSummary(auth)
	return json({ noAuth: false, characters: account?.summary.characters ?? [] })
}
export default function Codex() {
	let { noAuth, characters } = useLoaderData<typeof loader>()

	let matches = useMatches()
	let pageHandle = matches.at(-1)?.handle ?? "inventory"

	if (noAuth) {
		return (
			<div className="mx-auto flex max-w-7xl place-content-center px-4 pb-4 pt-6 sm:px-8 lg:px-10">
				<div
					className="flex rounded-lg bg-yellow-100 p-4 text-sm text-yellow-700"
					role="alert"
				>
					<ExclamationCircleIcon
						className="mr-3 inline h-5 w-5"
						aria-hidden="true"
					/>
					<div>
						<span className="font-medium">No Auth Token Found!</span> You need
						to authorise your account with the game before you can access this
						interface.
					</div>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className="relative z-40 w-full bg-white p-4 shadow">
				<div className="mx-auto flex max-w-7xl justify-between">
					<nav>
						{characters.map((char) => (
							<NavLink
								key={char.id}
								to={`${char.id}/${pageHandle}`}
								className={({ isActive }) =>
									classnames("p-4 ", isActive ? "font-bold" : "")
								}
							>
								{char.name}
							</NavLink>
						))}
					</nav>

					<nav>
						{navLinks.map((item) => (
							<NavLink
								key={item.link}
								to={item.link}
								className={({ isActive }) =>
									classnames("p-4 ", isActive ? "font-bold" : "")
								}
							>
								{item.label}
							</NavLink>
						))}
					</nav>
				</div>
			</div>
			<Outlet />
		</>
	)
}
