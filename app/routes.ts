import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes"

export default [
	index("./routes/home.tsx"),
	route("curios", "./routes/curios.tsx"),
	route("curio/:id", "./routes/curio.tsx"),
	route("weapons", "./routes/weapons.tsx"),
	route("skins", "./routes/skins.tsx"),
	route("skins/:id", "./routes/skin.tsx"),
	route("admin", "./routes/admin.tsx", [
		route("import", "./routes/import.tsx"),
	]),
] satisfies RouteConfig
