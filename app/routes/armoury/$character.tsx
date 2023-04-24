import { NavLink, Outlet } from "@remix-run/react"
import { classnames } from "~/utils/classnames"

export default function Character() {
	return (
		<div className="flex flex-row">
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
				classnames("border-neutral-400 p-6", isActive && "border-r-4 font-bold")
			}
		>
			{children}
		</NavLink>
	)
}
