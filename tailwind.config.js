/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{ts,tsx,js,jsx}"],
	theme: {
		fontFamily: {
			heading: ["Archivo", "sans-serif"],
			montserrat: ["Montserrat", "sans-serif"],
		},
		listStyleType: {
			none: "none",
			square: "square",
			roman: "upper-roman",
		},
		screens: {
			xs: "400px",
		},
	},
	plugins: [
		require("@tailwindcss/forms"),
		require("@thoughtbot/tailwindcss-aria-attributes"),
	],
}
