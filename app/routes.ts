import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
	index("./routes/home.tsx"),
	route("weapons", "./routes/weapons.tsx"),
	route("admin/import", "./routes/import.tsx"),
] satisfies RouteConfig
