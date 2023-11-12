/** @type {import('@remix-run/dev').AppConfig} */
export default {
	tailwind: true,
	postcss: true,

	server: "./server/server.ts",
	serverDependenciesToBundle: "all",
	serverBuildPath: "build/server.js",
	serverMainFields: ["main", "module"],
	serverMinify: false,
	serverModuleFormat: "cjs",
	serverPlatform: "node",

	watchPaths: ["./server/**/*.ts"],

	ignoredRouteFiles: ["**/.*", "**/__tests__/**"],
}
