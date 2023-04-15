import { Outlet } from "@remix-run/react"
export { loader } from "./blessings/index"

export default function Traits() {
	return <Outlet />
}
