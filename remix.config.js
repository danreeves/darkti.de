/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	future: {
		unstable_tailwind: true,
		unstable_dev: true,
	},
	appDirectory: "app",
	assetsBuildDirectory: "public/build",
	ignoredRouteFiles: ["**/.*", "**/__tests__/**"],
	serverBuildPath: "build/index.mjs",
	serverDependenciesToBundle: ["nanoid", "lodash-es"],
	serverModuleFormat: "esm",
}
