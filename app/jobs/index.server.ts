import { Cron } from "croner"
import { refreshTokens } from "./refreshTokens"
import { fetchMissions } from "./fetchMissions"

declare global {
	var tokenRefresher: Cron
	var missionFetcher: Cron
}

export function initJobs() {
	global.tokenRefresher =
		global.tokenRefresher ??
		Cron("*/5 * * * *", async () => {
			let expiringInTheNext10Minutes = 10
			await refreshTokens(expiringInTheNext10Minutes)
			console.log("Next token refresh at", global.tokenRefresher.nextRun())
			return true
		})

	global.missionFetcher =
		global.missionFetcher ??
		Cron("*/5 * * * *", async () => {
			await fetchMissions()
			console.log("Next mission refresh at", global.missionFetcher.nextRun())
			return true
		})
}
