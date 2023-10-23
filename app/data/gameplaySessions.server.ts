import type { GameplaySession } from "@prisma/client"
import { prisma } from "~/data/db.server"

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
