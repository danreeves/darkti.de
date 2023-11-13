import type { MissionInstance } from "@prisma/client"
import { prisma } from "~/services/prisma.server"

export async function getMissionHistory() {
	let timeLimit = Date.now() - 24 * 60 * 60 * 1000
	let timeLimitString = new Date(timeLimit).toISOString()

	return await prisma.missionInstance.findMany({
		where: { start: { gte: timeLimitString } },
		orderBy: {
			start: "desc",
		},
	})
}

export async function saveMissions(missions: MissionInstance[]) {
	return await prisma.missionInstance.createMany({
		data: missions,
		skipDuplicates: true,
	})
}
