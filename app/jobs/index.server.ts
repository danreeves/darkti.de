import { Cron } from "croner"
import { refreshTokens } from "./refreshTokens"
import localtunnel, { Tunnel, TunnelCallback } from "localtunnel"
import { replaceInFile } from "replace-in-file"
declare global {
  var tokenRefresher: Cron, onceOff: Cron
}

export function initJobs() {
  global.tokenRefresher =
    global.tokenRefresher ??
    Cron("*/5 * * * *", async () => {
      let expiringInTheNext10Minutes = 10
      await refreshTokens(expiringInTheNext10Minutes)
      console.log("Next refresh at", global.tokenRefresher.nextRun())
      return true
    })
}

export async function getTunnel(){
  let soon = new Date()
  soon.setSeconds(soon.getSeconds() + 1)
  global.onceOff = global.onceOff ??
  Cron(soon.toISOString(), { maxRuns: 1 }, async () => {
    let tunnel = await localtunnel( {port: 3000})
    console.log("new tunnel at " + tunnel?.url)
    await replaceInFile({files : process.env.DTAUTHDATA_PATH, from : /local domain =.*/g, to : 'local domain = "' + tunnel.url + '"', allowEmptyPaths: true})          
  })
}