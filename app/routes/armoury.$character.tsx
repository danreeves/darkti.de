import { Outlet } from "@remix-run/react"

export default function Character() {
	return (
		<div className="flex h-full flex-row overflow-hidden">
			<Outlet />
		</div>
	)
}
