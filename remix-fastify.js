"use strict"
var __create = Object.create
var __defProp = Object.defineProperty
var __getOwnPropDesc = Object.getOwnPropertyDescriptor
var __getOwnPropNames = Object.getOwnPropertyNames
var __getProtoOf = Object.getPrototypeOf
var __hasOwnProp = Object.prototype.hasOwnProperty
var __export = (target, all) => {
	for (var name in all)
		__defProp(target, name, { get: all[name], enumerable: true })
}
var __copyProps = (to, from, except, desc) => {
	if ((from && typeof from === "object") || typeof from === "function") {
		for (let key of __getOwnPropNames(from))
			if (!__hasOwnProp.call(to, key) && key !== except)
				__defProp(to, key, {
					get: () => from[key],
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
				})
	}
	return to
}
var __toESM = (mod, isNodeMode, target) => (
	(target = mod != null ? __create(__getProtoOf(mod)) : {}),
	__copyProps(
		// If the importer is in node compatibility mode or this is not an ESM
		// file that has been converted to a CommonJS file using a Babel-
		// compatible transform (i.e. "__esModule" has not been set), then set
		// "default" to the CommonJS "module.exports" for node compatibility.
		isNodeMode || !mod || !mod.__esModule
			? __defProp(target, "default", { value: mod, enumerable: true })
			: target,
		mod
	)
)
var __toCommonJS = (mod) =>
	__copyProps(__defProp({}, "__esModule", { value: true }), mod)

// src/index.ts
var src_exports = {}
__export(src_exports, {
	createRequestHandler: () => createRequestHandler,
	getStaticFiles: () => getStaticFiles,
	purgeRequireCache: () => purgeRequireCache,
	remixFastifyPlugin: () => remixFastifyPlugin,
})
module.exports = __toCommonJS(src_exports)

// src/globals.ts
var import_node = require("@remix-run/node")
;(0, import_node.installGlobals)()

// src/server.ts
var import_node_stream = require("stream")
var import_node2 = require("@remix-run/node")
function createRequestHandler({
	build,
	getLoadContext,
	mode = process.env.NODE_ENV,
}) {
	let handleRequest = (0, import_node2.createRequestHandler)(build, mode)
	return async (request, reply) => {
		let remixRequest = createRemixRequest(request, reply)
		let loadContext =
			typeof getLoadContext === "function"
				? getLoadContext(request, reply)
				: void 0
		let response = await handleRequest(remixRequest, loadContext)
		return await sendRemixResponse(reply, response)
	}
}
function createRemixHeaders(requestHeaders) {
	let headers = new import_node2.Headers()
	for (let [header, values] of Object.entries(requestHeaders)) {
		if (!values) continue
		if (Array.isArray(values)) {
			for (let value of values) {
				headers.append(header, value)
			}
		} else {
			headers.set(header, values)
		}
	}
	return headers
}
function createRemixRequest(request, reply) {
	let origin = `${request.protocol}://${request.hostname}`
	let url = `${origin}${request.url}`
	let controller = new import_node2.AbortController()
	reply.raw.on("close", () => controller.abort())
	let init = {
		method: request.method,
		headers: createRemixHeaders(request.headers),
		signal: controller.signal,
	}
	if (request.method !== "GET" && request.method !== "HEAD") {
		init.body = request.body
	}
	return new import_node2.Request(url, init)
}
async function sendRemixResponse(reply, nodeResponse) {
	reply.status(nodeResponse.status)
	for (let [key, values] of Object.entries(nodeResponse.headers.raw())) {
		for (let value of values) {
			reply.header(key, value)
		}
	}
	if (nodeResponse.body) {
		let stream = new import_node_stream.PassThrough()
		reply.send(stream)
		await (0, import_node2.writeReadableStreamToWritable)(
			nodeResponse.body,
			stream
		)
	} else {
		reply.send()
	}
	return reply
}

// src/plugin.ts
var path = __toESM(require("path"))
var import_node_url = require("url")
var import_static = __toESM(require("@fastify/static"))
var import_early_hints = __toESM(require("@fastify/early-hints"))
var import_fastify_plugin = __toESM(require("fastify-plugin"))
var import_fastify_racing = __toESM(require("fastify-racing"))
var import_tiny_invariant = __toESM(require("tiny-invariant"))

// src/utils.ts
var import_router = require("@remix-run/router")
var import_glob = require("glob")
function getStaticFiles({ assetsBuildDirectory, publicPath, rootDir }) {
	let staticFilePaths = (0, import_glob.sync)(`public/**/*`, {
		dot: true,
		nodir: true,
		cwd: rootDir,
	})
	return staticFilePaths.map((filePublicPath) => {
		let normalized = filePublicPath.replace(/\\/g, "/")
		let isBuildAsset = normalized.startsWith(assetsBuildDirectory)
		let browserAssetUrl = "/"
		if (isBuildAsset) {
			browserAssetUrl += normalized.replace(
				assetsBuildDirectory,
				publicPath.split("/").filter(Boolean).join("/")
			)
		} else {
			browserAssetUrl += normalized.replace("public/", "")
		}
		return {
			isBuildAsset,
			filePublicPath,
			browserAssetUrl,
		}
	})
}
function purgeRequireCache(BUILD_DIR) {
	for (let key in require.cache) {
		if (key.startsWith(BUILD_DIR)) {
			delete require.cache[key]
		}
	}
}
function getEarlyHintLinks(request, serverBuild) {
	let origin = `${request.protocol}://${request.hostname}`
	let url = new URL(`${origin}${request.url}`)
	let routes = Object.values(serverBuild.assets.routes)
	let matches = (0, import_router.matchRoutes)(routes, url.pathname)
	if (!matches || matches.length === 0) return []
	let links = matches.flatMap((match) => {
		let routeImports = match.route.imports || []
		let imports = [
			match.route.module,
			...routeImports,
			serverBuild.assets.url,
			serverBuild.assets.entry.module,
			...serverBuild.assets.entry.imports,
		]
		return imports
	})
	return links.map((link) => {
		return { href: link, as: "script", rel: "preload" }
	})
}

// src/plugin.ts
async function loadBuild(build) {
	if (typeof build === "string") {
		if (!build.endsWith(".js")) {
			build = path.join(build, "index.js")
		}
		let fileURL = (0, import_node_url.pathToFileURL)(build)
		fileURL.searchParams.set("ts", Date.now().toString())
		let module2 = await import(fileURL.toString())
		return module2.default
	}
	return build
}
var remixFastify = async (fastify, options = {}) => {
	var _a
	let {
		build,
		mode = process.env.NODE_ENV,
		rootDir = process.cwd(),
		purgeRequireCacheInDevelopment = process.env.NODE_ENV === "development",
		unstable_earlyHints: earlyHints,
	} = options
	;(0, import_tiny_invariant.default)(build, "You must provide a build")
	let serverBuild = await loadBuild(build)
	if (
		mode === "development" &&
		!!((_a = serverBuild == null ? void 0 : serverBuild.future) == null
			? void 0
			: _a.unstable_dev)
	) {
		purgeRequireCacheInDevelopment = false
	}
	if (!fastify.hasContentTypeParser("*")) {
		fastify.addContentTypeParser("*", (_request, payload, done) => {
			done(null, payload)
		})
	}
	if (earlyHints) {
		await fastify.register(import_early_hints.default, { warn: true })
	}
	await fastify.register(import_fastify_racing.default, { handleError: true })
	let PUBLIC_DIR = path.join(rootDir, "public")
	fastify.register(import_static.default, {
		root: PUBLIC_DIR,
		// this needs to be false so our regular requests can still be served
		wildcard: false,
		// we handle serving the files ourselves as you cant stack roots (public/build, public)
		// and it won't pick up new files in dev
		serve: false,
	})
	function sendAsset(reply, file) {
		return reply.sendFile(file.filePublicPath, rootDir, {
			maxAge: file.isBuildAsset ? "1y" : "1h",
			immutable: file.isBuildAsset,
		})
	}
	if (mode === "development") {
		fastify.addHook("onRequest", (request, reply, done) => {
			let staticFiles = getStaticFiles({
				assetsBuildDirectory: serverBuild.assetsBuildDirectory,
				publicPath: serverBuild.publicPath,
				rootDir,
			})
			let origin = `${request.protocol}://${request.hostname}`
			let url = new import_node_url.URL(`${origin}${request.url}`)
			let staticFile = staticFiles.find((file) => {
				return url.pathname === file.browserAssetUrl
			})
			if (staticFile) {
				return sendAsset(reply, staticFile)
			}
			done()
		})
	} else {
		let staticFiles = getStaticFiles({
			assetsBuildDirectory: serverBuild.assetsBuildDirectory,
			publicPath: serverBuild.publicPath,
			rootDir,
		})
		for (let staticFile of staticFiles) {
			fastify.get(staticFile.browserAssetUrl, (_request, reply) => {
				return sendAsset(reply, staticFile)
			})
		}
	}
	if (mode === "development" && typeof build === "string") {
		fastify.all("*", async (request, reply) => {
			;(0, import_tiny_invariant.default)(build, "we lost the build")
			;(0, import_tiny_invariant.default)(
				typeof build === "string",
				`to support "HMR" you must pass a path to the build`
			)
			if (purgeRequireCacheInDevelopment) {
				purgeRequireCache(build)
			}
			let loaded = await loadBuild(build)
			if (earlyHints) {
				let links = getEarlyHintLinks(request, loaded)
				await reply.writeEarlyHintsLinks(links)
			}
			return createRequestHandler({
				build: loaded,
				mode,
				getLoadContext: options.getLoadContext,
			})(request, reply)
		})
	} else {
		fastify.all("*", async (request, reply) => {
			if (earlyHints) {
				let links = getEarlyHintLinks(request, serverBuild)
				await reply.writeEarlyHintsLinks(links)
			}
			return createRequestHandler({
				build: serverBuild,
				mode,
				getLoadContext: options.getLoadContext,
			})(request, reply)
		})
	}
}
var remixFastifyPlugin = (0, import_fastify_plugin.default)(remixFastify, {
	name: "@mcansh/remix-fastify",
	fastify: "^3.29.0 || ^4.0.0",
})
// Annotate the CommonJS export names for ESM import in node:
0 &&
	(module.exports = {
		createRequestHandler,
		getStaticFiles,
		purgeRequireCache,
		remixFastifyPlugin,
	})
//# sourceMappingURL=index.js.map
