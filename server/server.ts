import { broadcastDevReady } from "@remix-run/node"
import { Hono } from "hono"
import { logger } from 'hono/logger'
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import * as rh from "remix-hono/handler"
import * as build from "@remix-run/dev/server-build"

if (process.env.NODE_ENV === "development") broadcastDevReady(build)

const server = new Hono()

server.use('*', logger())

server.get(
	"*",
	serveStatic({
		root: "./public",
		rewriteRequestPath: (path) => path.replace(/^\/public/, "/"),
	}),
)

server.use(
	"*",
	rh.remix({
		build,
		mode: process.env.NODE_ENV,
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
