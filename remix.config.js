/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	future: {
    v2_dev: true,
		// TODO:
		// v2_headers: true,
    // v2_errorBoundary: true,
    // v2_meta: true,
    // v2_normalizeFormMethod: true,
    // v2_routeConvention: true,
	},
	appDirectory: "app",
	assetsBuildDirectory: "public/build",
	ignoredRouteFiles: ["**/.*", "**/__tests__/**"],
	serverBuildPath: "build/index.mjs",
	serverDependenciesToBundle: ["nanoid", "lodash-es"],
	serverModuleFormat: "esm",
	tailwind: true,
}
