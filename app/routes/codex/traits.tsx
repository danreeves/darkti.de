import { Outlet } from "@remix-run/react"
export { loader } from "./traits/index"

export default function Traits() {
  return <Outlet />
}
