/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{ts,tsx,js,jsx}"],
	theme: {
		fontFamily: {
			heading: ["Archivo", "sans-serif"],
		},
	},
	plugins: [require("@tailwindcss/forms")],
}
