import type { GameplaySession } from "@prisma/client"
import { prisma } from "~/services/prisma.server"

export async function saveGameplaySession(
	session: Omit<GameplaySession, "createdAt">,
) {
	return await prisma.gameplaySession.create({ data: session })
}

export async function getGameplaySessions({
	accountId,
	characterId,
}: {
	accountId: string
	characterId: string
}) {
	return await prisma.gameplaySession.findMany({
		where: {
			accountId,
			characterId,
		},
		orderBy: [{ createdAt: "desc" }],
	})
}

export async function getGameplaySession({
	accountId,
	characterId,
	sessionId,
}: {
	accountId: string
	characterId: string
	sessionId: string
}) {
	return await prisma.gameplaySession.findFirstOrThrow({
		where: {
			accountId,
			characterId,
			sessionId,
		},
		orderBy: [{ createdAt: "desc" }],
	})
}
