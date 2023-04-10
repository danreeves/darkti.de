import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { reverse, sortBy } from "lodash"
import { getAuthToken } from "~/data/authtoken.server"
import { authenticator } from "~/services/auth.server"
import { getMissions } from "~/services/darktide.server"

export let loader = async ({ request }: LoaderArgs) => {
  let user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  })

  let auth = await getAuthToken(user.id)
  if (auth) {
    let { missions } = (await getMissions(auth)) || { missions: [] }
    let sortedMissions = reverse(sortBy(missions, ["challenge", "resistance"]))
    return json({ missions: sortedMissions })
  }

  return json({ missions: [] })
}

export default function Missions() {
  let { missions } = useLoaderData<typeof loader>()
  return (
    <>
      <h1 className="sr-only">Missions</h1>
      <div className="mx-auto my-6 grid w-2/3 grid-cols-4 gap-4">
        {missions.map((mission) => (
          <div key={mission.id} className="h-64 w-64 rounded bg-white shadow">
            <div>Map: {mission.map}</div>
            <div>Difficulty: {mission.challenge}</div>
            <div>Circumstance: {mission.circumstance}</div>
            <div>Credits: {mission.credits}</div>
            <div>XP: {mission.xp}</div>
            <div>Giver: {mission.missionGiver}</div>
            <div>Start: {mission.start}</div>
            <div>End: {mission.expiry}</div>
            <div>
              Extra rewards: {JSON.stringify(mission.extraRewards ?? {})}
            </div>
          </div>
        ))}
      </div>
      <pre>{JSON.stringify(missions, null, 4)}</pre>
    </>
  )
}
