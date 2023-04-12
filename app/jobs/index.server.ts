import { Cron } from "croner"
import { refreshTokens } from "./refreshTokens"

declare global {
  var tokenRefresher: Cron
}

export function initJobs() {
  global.tokenRefresher =
    global.tokenRefresher ??
    Cron("?/5 * * * *", { protect: true }, async () => {
      let expiringInTheNext10Minutes = 30
      await refreshTokens(expiringInTheNext10Minutes)
    })
}
