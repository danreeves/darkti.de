import { json } from "@remix-run/node"
import {
  deleteAuthToken,
  getExpiringTokens,
  updateAuthToken,
} from "~/data/authtoken.server"
import { refreshToken } from "~/services/darktide.server"

export let loader = async () => {
  let inNext30Minutes = 30
  let tokens = await getExpiringTokens(inNext30Minutes)

  let tokensToUpdate = tokens.length
  let updatedTokens = 0
  let deletedTokens = 0

  for (let token of tokens) {
    let newToken = await refreshToken(token.refreshToken)

    if (newToken) {
      let expiresAt = new Date()
      expiresAt.setSeconds(expiresAt.getSeconds() + newToken.ExpiresIn)

      await updateAuthToken({
        userId: token.userId,
        expiresAt: expiresAt,
        sub: newToken.Sub,
        accessToken: newToken.AccessToken,
        refreshToken: newToken.RefreshToken,
      })
      updatedTokens++
    } else {
      console.warn(`Token for ${token.sub} failed to refresh`)
      await deleteAuthToken(token.userId)
      deletedTokens++
    }
  }

  return json({ updatedTokens, tokensToUpdate, deletedTokens })
}
