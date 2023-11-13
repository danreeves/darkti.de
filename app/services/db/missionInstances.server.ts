import type { MissionInstance } from "@prisma/client"
import { prisma } from "~/services/prisma.server"

export async function getMissionHistory() {
	let twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000
	let twelveHoursAgoString = new Date(twelveHoursAgo).toISOString()

	return await prisma.missionInstance.findMany({
		where: { start: { gte: twelveHoursAgoString } },
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
