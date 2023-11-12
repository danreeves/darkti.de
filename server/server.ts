import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import * as build from "@remix-run/dev/server-build"
import { broadcastDevReady } from "@remix-run/node"
import { Hono } from "hono"
import { logger } from "hono/logger"
import { remix } from "remix-hono/handler"
import type { Output } from "valibot"
import { object, parse, string } from "valibot"

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

if (process.env.NODE_ENV === "development") broadcastDevReady(build)

const server = new Hono()

server.use("*", logger())

server.get(
	"*",
	serveStatic({
		root: "./public",
		rewriteRequestPath: (path) => path.replace(/^\/public/, "/"),
	}),
)

server.use(
	"*",
	remix({
		// @ts-expect-error -- remix-hono types out of date
		build,
		mode: process.env.NODE_ENV === "production" ? "production" : "development",
		getLoadContext(ctx) {
			return ctx.env
		},
	}),
)

serve(server, (info) => {
	console.log(
		`Listening on http://localhost:${info.port} in ${process.env.NODE_ENV} mode`,
	)
})
