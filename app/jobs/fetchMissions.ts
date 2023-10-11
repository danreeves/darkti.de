import { getMissions } from "~/services/darktide.server"
import { saveMissions } from "~/data/missionInstances.server"
import { getAuthTokenBySteamId } from "~/data/authtoken.server"

export async function fetchMissions() {
	console.log("Starting mission refresh...")
	let groupName = "Missions refreshed in"
	console.time(groupName)

	try {
		let auth = await getAuthTokenBySteamId(process.env.DEFAULT_STEAM_ID!)
		let data = await getMissions(auth)
		if (data && data.missions.length) {
			let missions = data.missions.map((mission) => {
				return {
					id: mission.id,
					map: mission.map,
					category: mission.category ?? null,
					circumstance: mission.circumstance,
					maelstrom: Boolean(mission.flags?.flash),
					challenge: mission.challenge,
					resistance: mission.resistance,
					start: new Date(parseInt(mission.start, 10)),
					expiry: new Date(parseInt(mission.expiry, 10)),
					sideMission: mission.sideMission ?? null,
				}
			})
			let { count } = await saveMissions(missions)
			console.log(`Inserted ${count} missions`)
		}
	} catch (e) {
		console.log("Failed to fetch missions")
	}

	console.timeEnd(groupName)
}
