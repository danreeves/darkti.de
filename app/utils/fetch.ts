import { fetchBuilder, MemoryCache } from "node-fetch-cache"

type FetchCache = ReturnType<typeof fetchBuilder.withCache>
declare global {
	var cachedFetch: FetchCache
}

global.cachedFetch =
	global.cachedFetch ??
	fetchBuilder.withCache(
		new MemoryCache({
			ttl: process.env.NODE_ENV === "production" ? 5000 : 60000,
		})
	)

export const fetch = global.cachedFetch
