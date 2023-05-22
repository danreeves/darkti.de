/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{ts,tsx,js,jsx}"],
	theme: {
		fontFamily: {
			heading: ["Archivo", "sans-serif"],
		},
		listStyleType: {
			none: "none",
			square: "square",
			roman: "upper-roman",
		},
	},
	plugins: [
		require("@tailwindcss/forms"),
		require("@thoughtbot/tailwindcss-aria-attributes"),
	],
}
