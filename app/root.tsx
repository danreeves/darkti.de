import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router"

import type { Route } from "./+types/root"
import "./app.css"

export function meta() {
	return [{ title: "Darkti.de" }]
}

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
]

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning={true}>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark" ||
	(!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches),
);`,
					}}
				/>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default function App() {
	return (
		<>
			{/* Keyframe animations for CRT effects */}
			<style>{`
		
				
				@keyframes flicker {
					0%, 100% { opacity: 1; }
					50% { opacity: 0.98; }
					51% { opacity: 0.99; }
					52% { opacity: 0.9; }
				}
				
				@keyframes glitchShift {
					0%, 95%, 100% { transform: translate(0); }
					95.5% { transform: translate(-2px, 1px); }
					96% { transform: translate(1px, -1px); }
					97.5% { transform: translate(-1px, 2px); }
					98% { transform: translate(2px, -2px); }
				}
				
				@keyframes staticNoise {
					0%, 100% { opacity: 0.05; }
					25% { opacity: 0.08; }
					50% { opacity: 0.03; }
					75% { opacity: 0.07; }
				}
			`}</style>

			{/* SVG Filter Definitions */}
			<svg width="0" height="0" style={{ position: "absolute" }}>
				<defs>
					{/* Additional CRT glow effect */}
					<filter
						id="crtGlow"
						x="-20%"
						y="-20%"
						width="140%"
						height="140%"
					>
						<feGaussianBlur stdDeviation="3" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>
			</svg>

			{/* Main App Content with CRT Effect */}
			<div
				className="relative min-h-screen"
				style={{
					filter: " url(#crtGlow)",
					animation: "flicker 3s infinite ease-in-out",
				}}
			>
				{/* Static Scanlines */}
				<div
					className="pointer-events-none fixed inset-0 z-50"
					style={{
						backgroundImage: `repeating-linear-gradient(
							0deg,
							transparent 0px,
							transparent 1px,
							rgba(0, 0, 0, 0.3) 1px,
							rgba(0, 0, 0, 0.3) 2px
						)`,
						opacity: 0.5,
						mixBlendMode: "multiply",
					}}
				/>

				{/* Animated Static Noise */}
				<div
					className="pointer-events-none fixed inset-0 z-45"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`,
						animation: "staticNoise 0.1s infinite",
						mixBlendMode: "multiply",
					}}
				/>

				{/* Content with Glitch Effect */}
				<div
					className="relative z-10"
					style={{
						animation: "glitchShift 8s infinite",
					}}
				>
					<Outlet />
				</div>
			</div>
		</>
	)
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!"
	let details = "An unexpected error occurred."
	let stack: string | undefined

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error"
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message
		stack = error.stack
	}

	return (
		<main className="container mx-auto p-4 pt-16">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full overflow-x-auto p-4">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	)
}
