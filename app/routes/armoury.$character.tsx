import { NavLink, Outlet } from "@remix-run/react"
import { twMerge } from "tailwind-merge"

export default function Character() {
	return (
		<div className="flex h-full flex-row overflow-hidden">
			<nav className="border-4-2 flex shrink-0 flex-col bg-white">
				<PageLink to="inventory">Inventory</PageLink>
				<PageLink to="exchange">Armoury Exchange</PageLink>
				<PageLink to="requisitorium">Requisitorium</PageLink>
				<PageLink to="contracts">Contracts</PageLink>
			</nav>
			<Outlet />
		</div>
	)
}

function PageLink({ to, children }: { to: string; children: string }) {
	return (
		<NavLink
			to={to}
			className={({ isActive }) =>
				twMerge("border-neutral-400 p-6", isActive && "border-r-4 font-bold")
			}
		>
			{children}
		</NavLink>
	)
}
