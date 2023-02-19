import { Outlet } from "@remix-run/react"
export { loader } from "./skins/index"

export default function Skins() {
	return <Outlet />
}
