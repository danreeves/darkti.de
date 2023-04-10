import { NavLink, Outlet } from "@remix-run/react"
import { classnames } from "~/utils/classnames"

export default function Character() {
  return (
    <div className="flex flex-row">
      <nav className="border-4-2 flex flex-col bg-white">
        <PageLink to="inventory">Inventory</PageLink>
        <PageLink to="crafting">Crafting</PageLink>
        <PageLink to="exchange">Armoury Exchange</PageLink>
        <PageLink to="requisitorium">Requisitorium</PageLink>
      </nav>
      <div>
        <Outlet />
      </div>
    </div>
  )
}

function PageLink({ to, children }: { to: string; children: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        classnames("border-neutral-200 p-6", isActive && "border-r-4 font-bold")
      }
    >
      {children}
    </NavLink>
  )
}
