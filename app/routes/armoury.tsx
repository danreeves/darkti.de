import type { LoaderFunctionArgs } from "@remix-run/node"
import { redirect, json } from "@remix-run/node"
import {
	NavLink,
	Outlet,
	useLoaderData,
	useMatches,
	useNavigate,
} from "@remix-run/react"
import { getAuthToken } from "~/services/db/authtoken.server"
import { authenticator } from "~/services/auth.server"
import { getAccountSummary } from "~/services/darktide.server"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover"
import { Command, CommandGroup, CommandItem } from "~/components/ui/command"
import { AlertTriangle, ChevronsUpDown } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/utils/cn"
import { Separator } from "~/components/ui/separator"

let navLinks = [{ label: "Trait collection", link: "traits" }]
let charLinks = [
	{ link: "inventory", label: "Inventory" },
	{ link: "exchange", label: "Armoury Exchange" },
	{ link: "requisitorium", label: "Requisitorium" },
	{ link: "contracts", label: "Contracts" },
	{ link: "statistics", label: "Statistics" },
	{ link: "sessions", label: "History" },
]

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})
	let auth = await getAuthToken(user.id)
	let account = await getAccountSummary(auth)

	let firstCharId = account?.summary?.characters[0]?.id
	if (firstCharId && !params.character && !request.url.includes("traits")) {
		return redirect(`/armoury/${firstCharId}/inventory`)
	}

	return json({ characters: account?.summary.characters ?? [] })
}

export default function Armoury() {
	let { characters } = useLoaderData<typeof loader>()
	let navigate = useNavigate()
	let matches = useMatches()
	let currentPage = matches.at(-1)
	let currentRoute =
		currentPage?.id.replace("routes", "").replaceAll(".", "/") ?? ""
	let currentRouteParams = currentPage?.params

	let currentChar = characters.find(
		(char) => char.id === currentRouteParams?.character,
	)
	let currentNavLink = navLinks.find(
		(nav) => nav.link === currentRoute.replace("/armoury/", ""),
	)

	return (
		<>
			<div className="w-full relative">
				<div className="w-full mx-auto max-w-7xl flex flex-grow h-16 items-center px-4 lg:px-0 gap-4 ">
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								className={cn(
									"w-[200px] justify-between",
									!true && "text-muted-foreground",
								)}
							>
								{currentChar?.name ||
									currentNavLink?.label ||
									"Select character"}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[200px] p-0">
							<Command>
								<CommandGroup>
									{characters.map((char) => {
										let route = currentRoute
										let params = { ...currentRouteParams, character: char.id }

										for (const [key, value] of Object.entries(params)) {
											route = route.replace(`$${key}`, value)
										}

										if (!route.includes(char.id)) {
											route = `/armoury/${char.id}/inventory`
										}

										return (
											<CommandItem
												value={char.name}
												key={char.id}
												onSelect={() => {
													navigate(route)
												}}
												className={cn(
													currentChar?.id === char.id && "font-medium",
												)}
											>
												{/* TODO: Add archetype icon */}
												{char.name}
											</CommandItem>
										)
									})}
								</CommandGroup>
								<Separator />
								<CommandGroup>
									{navLinks.map((link) => (
										<CommandItem
											key={link.link}
											onSelect={() => {
												navigate(link.link)
											}}
											className={cn(
												currentNavLink?.link === link.link && "font-medium",
											)}
										>
											{link.label}
										</CommandItem>
									))}
								</CommandGroup>
							</Command>
						</PopoverContent>
					</Popover>

					<nav className="flex gap-4">
						{currentChar &&
							charLinks.map((item) => (
								<NavLink
									key={item.link}
									to={`${currentChar?.id}/${item.link}`}
									className="aria-[current=page]:text-foreground aria-[current=page]:font-bold text-foreground/60 text-base"
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

export function ErrorBoundary() {
	return (
		<div className="mx-auto flex max-w-7xl place-content-center px-4 pb-4 pt-6 sm:px-8 lg:px-10">
			<div
				className="flex rounded-lg bg-yellow-100 p-4 text-sm text-yellow-700"
				role="alert"
			>
				<AlertTriangle className="mr-3 inline h-5 w-5" aria-hidden="true" />
				<div>
					<span className="font-medium">No Auth Token Found!</span> You need to
					authorise your account with the game before you can access this
					interface.
				</div>
			</div>
		</div>
	)
}
