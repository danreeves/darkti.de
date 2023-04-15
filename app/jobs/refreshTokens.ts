import {
	deleteAuthToken,
	getExpiringTokens,
	updateAuthToken,
} from "~/data/authtoken.server"
import { refreshToken } from "~/services/darktide.server"

export async function refreshTokens(inNext = 30) {
	console.log("Starting refresh...")
	let groupName = "Tokens refreshed in"
	console.time(groupName)
	let tokens = await getExpiringTokens(inNext)

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

	console.log({ updatedTokens, tokensToUpdate, deletedTokens })
	console.timeEnd(groupName)
}
