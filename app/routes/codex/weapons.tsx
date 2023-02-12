import { Outlet } from "@remix-run/react"
export { loader } from "./weapons/index"

export default function Weapons() {
	return <Outlet />
}
