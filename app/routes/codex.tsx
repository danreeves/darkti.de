import { Outlet } from "@remix-run/react";
export { loader } from "./codex/index";

export default function Codex() {
	return <Outlet />;
}
