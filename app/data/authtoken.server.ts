import type { AuthToken } from "@prisma/client"
import { prisma } from "~/data/db.server"

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
	} catch (e) {}
}

export async function getAuthToken(userId: number) {
	let auth = await prisma.authToken.findUnique({
		where: { userId },
	})

	if (!auth) return null

	if (auth.expiresAt <= new Date()) {
		await prisma.authToken.delete({
			where: { userId },
		})
		return null
	}

	return auth
}

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
