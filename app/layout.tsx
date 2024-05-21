import { Disclosure } from "@headlessui/react"
import { Link, NavLink, Outlet, useMatches } from "@remix-run/react"
import { ThemeToggle } from "~/components/ThemeToggle"
import { buttonVariants } from "~/components/ui/button"
import { cn } from "~/utils/cn"
import { X, Menu } from "lucide-react"
import { object, optional, parse, string } from "valibot"
import uniqBy from "lodash-es/uniqBy"

const navigation = [
	{ name: "Mission Board", href: "/mission-board" },
	{ name: "Codex", href: "/codex" },
	{ name: "Extension", href: "/extension" },
	{ name: "Modding", href: "/modding" },
] as const

let PageData = object({
	title: optional(string()),
})

export default function Layout() {
	const matches = useMatches()

	let currentPage = matches.at(-1) ?? { data: { title: "Home" } }
	let currentPageData = parse(PageData, currentPage.data)

	return (
		<>
			<div className="flex h-screen flex-col bg-background">
				<Disclosure
					as="nav"
					className="border-b sticky top-0 z-50 bg-background"
				>
					{({ open }) => (
						<>
							<div className="mx-auto max-w-7xl px-4 xl:p-0">
								<div className="flex h-12 items-center justify-between">
									<div className="flex items-center">
										<Link to="/" className="flex items-center mr-4">
											<div className="flex-shrink-0">
												<img
													className="h-8 w-8 dark:invert"
													src="/favicon-32x32.png"
													alt=""
												/>
											</div>
											<span className="mx-2 font-heading uppercase text-foreground font-black text-lg">
												Darkti.de
											</span>
										</Link>
										<div className="hidden md:block">
											<div className="flex items-baseline gap-4">
												{navigation.map((item) => (
													<NavLink
														key={item.name}
														to={item.href}
														className="aria-[current=page]:text-foreground aria-[current=page]:font-bold text-foreground/60 block text-base"
													>
														{item.name}
													</NavLink>
												))}
											</div>
										</div>
									</div>
									<div className="flex gap-1">
										<ThemeToggle />
										<div className="-mr-2 flex md:hidden">
											{/* Mobile menu button */}
											<Disclosure.Button
												className={cn(
													buttonVariants({ variant: "outline", size: "icon" }),
												)}
											>
												<span className="sr-only">Open main menu</span>
												{open ? (
													<X className="block h-6 w-6" aria-hidden="true" />
												) : (
													<Menu className="block h-6 w-6" aria-hidden="true" />
												)}
											</Disclosure.Button>
										</div>
									</div>
								</div>
							</div>

							{/* The small screen menu */}
							<Disclosure.Panel className="md:hidden">
								<div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
									{navigation.map((item) => (
										<NavLink
											key={item.name}
											to={item.href}
											className="aria-[current=page]:text-foreground text-foreground/60 block rounded-md px-3 py-2 text-base font-medium"
										>
											{item.name}
										</NavLink>
									))}
								</div>
							</Disclosure.Panel>
						</>
					)}
				</Disclosure>
				<div className="h-full w-full overflow-scroll pb-16">
					<header className="bg-background ">
						<Title title={currentPageData.title} />
						<Breadcrumbs
							crumbs={uniqBy(matches, (match) => {
								return match.pathname.replace(/\/$/, "")
							}).map((match) => {
								let pageData = parse(PageData, match.data)
								return {
									to: match.pathname,
									label: pageData.title ?? "hh",
								}
							})}
						/>
					</header>
					<main>
						<div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
							<Outlet />
						</div>
					</main>

					<footer className="mx-auto max-w-7xl px-4 pb-4 pt-6 sm:px-8 lg:px-10">
						<div className="flex items-center justify-center gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
							{/* <a href="#TODO">Site Analytics</a> */}
							<span className="text-foreground/50">
								Build{" "}
								<a
									className="underline"
									href={`https://github.com/danreeves/darkti.de/tree/${GIT_SHA}`}
								>
									{GIT_SHA}
								</a>{" "}
								deployed at {BUILD_TIME}
							</span>
						</div>
					</footer>
				</div>
			</div>
		</>
	)
}

function Title({ title }: { title?: string }) {
	if (!title) {
		return null
	}
	return (
		<div className="mx-auto max-w-7xl px-4 pb-4 pt-6 sm:px-6 lg:px-8">
			<h1 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground">
				{title}
			</h1>
		</div>
	)
}

function Breadcrumbs({ crumbs }: { crumbs: { to: string; label: string }[] }) {
	if (crumbs.length < 2) {
		return null
	}
	return (
		<div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
			<ul className="flex items-center">
				{crumbs.map((crumb, i) => (
					<Breadcrumb
						key={crumb.to}
						{...crumb}
						last={i === crumbs.length - 1}
					/>
				))}
			</ul>
		</div>
	)
}

function Breadcrumb({
	to,
	label,
	last,
}: {
	to: string
	label: string
	last?: boolean
}) {
	return (
		<li className="flex items-center">
			<Link
				to={to}
				className="text-body-color hover:text-primary text-base font-semibold"
			>
				{label}
			</Link>
			{last ? null : <span className="px-3">{"/"}</span>}
		</li>
	)
}
