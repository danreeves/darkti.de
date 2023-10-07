import { broadcastDevReady } from "@remix-run/node"
import { Hono } from "hono"
import { logger } from "hono/logger"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
// @ts-expect-error - no types come through?
import { remix } from "remix-hono/handler"
import * as build from "@remix-run/dev/server-build"

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
		build,
		mode: process.env.NODE_ENV,
		getLoadContext(ctx: { env: unknown }) {
			return ctx.env
		},
	}),
)

serve(server, (info) => {
	console.log(
		`Listening on http://localhost:${info.port} in ${process.env.NODE_ENV} mode`,
	)
})
