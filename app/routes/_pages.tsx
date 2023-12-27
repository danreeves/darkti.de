import { Link, Outlet, useMatches } from "@remix-run/react"
import { uniqBy } from "lodash-es"
import { object, optional, string, parse } from "valibot"

let PageData = object({
	title: optional(string()),
})

export default function PageLayout() {
	const matches = useMatches()

	let currentPage = matches.at(-1) ?? { data: { title: "Home" } }
	let currentPageData = parse(PageData, currentPage.data)

	return (
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
							label: pageData.title || "Home",
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
