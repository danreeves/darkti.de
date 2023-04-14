/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	ignoredRouteFiles: ["**/.*", '**/__tests__/**'],
	future: {
		unstable_tailwind: true,
	},
	serverDependenciesToBundle: ["nanoid"],
}
