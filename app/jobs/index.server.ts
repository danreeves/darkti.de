import { Cron } from "croner"
import { refreshTokens } from "./refreshTokens"
import { fetchMissions } from "./fetchMissions"

let tokenRefresher = Cron("*/5 * * * *", async () => {
	let expiringInTheNext10Minutes = 10
	await refreshTokens(expiringInTheNext10Minutes)
	console.log("Next token refresh at", tokenRefresher.nextRun())
	return true
})

let missionFetcher = Cron("*/5 * * * *", async () => {
	await fetchMissions()
	console.log("Next mission refresh at", missionFetcher.nextRun())
	return true
})
