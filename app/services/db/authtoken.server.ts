import type { AuthToken } from "@prisma/client"
import memoizee from "memoizee"
import { json } from "@remix-run/node"
import { prisma } from "~/services/prisma.server"

type UpdateArgs = Omit<AuthToken, "id">
export async function updateAuthToken(payload: UpdateArgs) {
	return await prisma.authToken.upsert({
		where: { userId: payload.userId },
		update: payload,
		create: payload,
	})
}

export async function deleteAuthToken(userId: number) {
	try {
		return await prisma.authToken.delete({
			where: { userId },
		})
	} catch (e) {
	} finally {
		getAuthToken.clear()
	}
}

async function _getAuthToken(userId: number) {
	try {
		let auth = await prisma.authToken.findUniqueOrThrow({
			where: { userId },
		})

		if (auth.expiresAt <= new Date()) {
			await prisma.authToken.delete({
				where: { userId },
			})
			throw json({ error: "No auth token" })
		}

		return auth
	} catch (e) {
		throw json({ error: "No auth token" })
	}
}

export const getAuthToken = memoizee(_getAuthToken, { maxAge: 5000 })

export async function getExpiringTokens(inNextMinutes: number) {
	let inXMinutes = new Date()
	inXMinutes.setMinutes(inXMinutes.getMinutes() + inNextMinutes)

	return await prisma.authToken.findMany({
		where: {
			expiresAt: {
				lte: inXMinutes,
			},
		},
	})
}

export async function getAuthTokenBySteamId(steamId: string) {
	let user = await prisma.user.findUnique({
		where: { steamId },
	})
	if (!user) {
		throw json({ error: "User not found" })
	}
	let auth = await prisma.authToken.findUnique({
		where: { userId: user.id },
	})
	if (!auth) {
		throw json({ error: "Auth token not found" })
	}
	return auth
}
