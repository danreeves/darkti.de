import { fetchBuilder, MemoryCache } from "node-fetch-cache"

type FetchCache = ReturnType<typeof fetchBuilder.withCache>
declare global {
	var cachedFetch: FetchCache
}

global.cachedFetch =
	global.cachedFetch ??
	fetchBuilder.withCache(
		new MemoryCache({
			ttl: 100,
		})
	)

export const fetch = global.cachedFetch
