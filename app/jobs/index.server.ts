import { Cron } from "croner"
import { refreshTokens } from "./refreshTokens"

declare global {
  var tokenRefresher: Cron
}

export function initJobs() {
  global.tokenRefresher =
    global.tokenRefresher ??
    Cron("*/5 * * * *", async () => {
      let expiringInTheNext15Minutes = 15
      await refreshTokens(expiringInTheNext15Minutes)
      console.log("Next refresh at", global.tokenRefresher.nextRun())
      return true
    })
}
