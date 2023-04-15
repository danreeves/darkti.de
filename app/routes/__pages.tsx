import { Link, Outlet, useMatches } from "@remix-run/react"
import { uniqBy } from "lodash"

export default function PageLayout() {
	const matches = useMatches()

	return (
		<>
			<header className="bg-white shadow">
				<Title title={matches.at(-1)?.data?.title} />
				<Breadcrumbs
					crumbs={uniqBy(matches, (match) => {
						return match.pathname.replace(/\/$/, "")
					}).map((match) => {
						return {
							to: match.pathname,
							label: match.data?.title || "Home",
						}
					})}
				/>
			</header>
			<main>
				<div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
					<Outlet />
				</div>
			</main>
		</>
	)
}

function Title({ title }: { title?: string }) {
	if (!title) {
		return null
	}
	return (
		<div className="mx-auto max-w-7xl px-4 pb-4 pt-6 sm:px-6 lg:px-8">
			<h1 className="font-heading text-4xl font-black uppercase tracking-tight text-neutral-900">
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
