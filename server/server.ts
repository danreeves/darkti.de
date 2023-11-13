// must come first
import "dotenv/config"

import {
	unstable_createViteServer,
	unstable_loadViteServerBuild,
} from "@remix-run/dev"
import { createRequestHandler } from "@remix-run/express"
import { installGlobals } from "@remix-run/node"
import compression from "compression"
import express from "express"
import morgan from "morgan"
import type { Output } from "valibot"
import { object, parse, string } from "valibot"

// Sets up Cron singletons to perform timed jobs on the server
import "../app/jobs/index.server"

const EnvVariables = object({
	STEAM_API_KEY: string(
		"Steam API Key from https://steamcommunity.com/dev/apikey",
	),
	SECRETSECRET: string("Random secret string for cookie encryption"),
	DATABASE_URL: string("Planetscale DB URL"),
	DEFAULT_STEAM_ID: string(
		"A default Steam ID to use the auth token for public pages like the mission board",
	),
})

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Output<typeof EnvVariables> {}
	}
}

parse(EnvVariables, process.env)

installGlobals()

let vite =
	process.env.NODE_ENV === "production"
		? undefined
		: await unstable_createViteServer()

let app = express()

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by")

app.use(morgan("tiny"))

app.use(
	compression({
		// Only compress the static assets
		filter: (req) => req.url.includes("/assets/"),
	}),
)

// handle asset requests
if (vite) {
	app.use(vite.middlewares)
} else {
	app.use(
		"/build",
		express.static("public/build", {
			immutable: true,
			maxAge: "1y",
		}),
	)
}

// handle static files
app.use(express.static("public", { maxAge: "1h" }))

// handle SSR requests
app.all(
	"*",
	createRequestHandler({
		// @ts-expect-error
		build: vite
			? () => unstable_loadViteServerBuild(vite!)
			: await import("../build/index.js"),
	}),
)

let port = 3000
app.listen(port, () => {
	console.log(
		`Listening on http://localhost:${port} in ${process.env.NODE_ENV} mode`,
	)
})
