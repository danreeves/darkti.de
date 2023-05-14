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
	},
	plugins: [require("@tailwindcss/forms")],
}
