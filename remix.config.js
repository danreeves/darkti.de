/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	ignoredRouteFiles: ["**/.*"],
	future: {
		unstable_tailwind: true,
		unstable_postcss: true,
	},
	serverDependenciesToBundle: ["nanoid"],
}
