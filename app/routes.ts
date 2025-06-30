import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes"

export default [
	index("./routes/home.tsx"),
	route("weapons", "./routes/weapons.tsx"),
	route("admin", "./routes/admin.tsx", [
		route("import", "./routes/import.tsx"),
	]),
] satisfies RouteConfig
