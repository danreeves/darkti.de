import fastify from "fastify"
// import { remixFastifyPlugin } from "@mcansh/remix-fastify"
import { remixFastifyPlugin } from "./remix-fastify.js"
import { installGlobals } from "@remix-run/node"

installGlobals()

import * as serverBuild from "./build/index.mjs"

let MODE = process.env.NODE_ENV

console.log(MODE)

let app = fastify({
	logger: {
		level: "info",
		transport: {
			target: "@fastify/one-line-logger",
		},
	},
})

// TODO: Figure out cors for images
// await app.register(import("@fastify/helmet"), { global: true })

// BLOCKED: https://github.com/mcansh/remix-fastify/pull/100
// await app.register(import("@fastify/compress"), { global: true })

await app.register(remixFastifyPlugin, {
	build: serverBuild,
	mode: MODE,
	getLoadContext: () => ({}),
	purgeRequireCacheInDevelopment: false,
})

let port = process.env.PORT ? Number(process.env.PORT) || 3000 : 3000

let address = await app.listen({ port, host: "0.0.0.0" })

if (MODE === "development") {
	let { broadcastDevReady } = await import("@remix-run/node")
	broadcastDevReady(serverBuild)
}

console.log(`App server running on ${address}`)
