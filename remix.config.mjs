/** @type {import('@remix-run/dev').AppConfig} */
export default {
	future: {
		v2_dev: true,
		v2_headers: true,
		v2_meta: true,
		v2_errorBoundary: true,
		v2_normalizeFormMethod: true,
		v2_routeConvention: true,
	},

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
