import { Outlet } from "@remix-run/react"
export { loader } from "./curios/index"

export default function Curios() {
	return <Outlet />
}
