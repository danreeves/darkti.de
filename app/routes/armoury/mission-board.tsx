import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { reverse, sortBy } from "lodash-es"
import { getAuthToken } from "~/data/authtoken.server"
import { authenticator } from "~/services/auth.server"
import { getMissions } from "~/services/darktide.server"
import { MissionTimer } from "~/components/MissionTimer"
import missionLoc from "~/data/exported/mission_localization_en.json"
import missionInfo from "~/data/exported/mission_info.json"

import hunting_grounds_01 from "~/img/hunting_grounds_01.png"
import party_scripture from "~/img/party_scripture.png"
import objective_credits from "~/img/objective_credits.png"
import objective_xp from "~/img/objective_xp.png"

const img_url = (src: string): string => {
	return `https://darktide-images.vercel.app/_vercel/image?q=100&url=pngs/${src}.png&w=512`
}

const loc = (key: string): string => {
	return missionLoc[key as keyof typeof missionLoc] || ""
}

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
			<div className="w-full h-full flex justify-center px-6 xl:px-48 pt-6 overflow-y-scroll">
				<div className="w-full flex flex-wrap justify-between gap-6">
					{missions.map((mission, i) => (
						<div
							key={mission.id}
							className="relative w-96 h-56 rounded text-green-100 shadow font-montserrat"
						>
							<img
								src={img_url(
									`content/ui/textures/missions/${mission.map}_medium`
								)}
								alt=""
								className="absolute w-full h-full top-0 left-0 object-cover rounded"
							/>

							<div className="h-full hover:opacity-20 transition-opacity">
								<div
									className="relative w-full h-full pl-9 pb-2"
									style={{
										background: `linear-gradient(180deg,
											hsl(0 0% 0% / 1) 0%,
											hsl(0 0% 0% / 0.35) 80%,
											hsl(0 0% 0% / 0) 100%)`,
									}}
								>
									<div className="h-8 flex flex-row justify-between items-center text-sm">
										<div className="uppercase">
											{loc(
												`loc_mission_type_${
													missionInfo[mission.map as keyof typeof missionInfo]
														.mission_type
												}_name`
											)}
										</div>

										<div className="w-full h-6 flex justify-end gap-[2px] mt-2 mr-2">
											{Array(mission.challenge).fill(
												<span className="w-2 h-full bg-green-100"></span>
											)}
											{Array(5 - mission.challenge).fill(
												<span className="w-2 h-full border border-green-100"></span>
											)}
										</div>
									</div>

									<div className="-mt-1 pr-4">
										<h2 className="font-bold !opacity-100">
											{loc(`loc_mission_name_${mission.map}`)}
										</h2>
										<div className="-mt-1 text-xs">
											{loc(
												`loc_zone_${
													missionInfo[mission.map as keyof typeof missionInfo]
														.zone_id
												}`
											)}
										</div>

										<p className="relative mt-2 text-xs">
											{loc(
												missionInfo[mission.map as keyof typeof missionInfo]
													.mission_description
											)}
										</p>
									</div>
								</div>

								<div className="absolute left-9 top-32 text-xs">
									<p className="relative pt-[0.375rem] align-text-middle text-sm text-yellow-400">
										Hi-Intensity Shock Troop Gauntlet
										<div className="absolute w-10 h-10 -top-1 -left-12 border border-yellow-400  bg-gray-900 ">
											<div
												className="absolute w-[124px] h-[124px] top-0 left-0 bg-yellow-400"
												style={{
													WebkitMaskImage: `url(${hunting_grounds_01})`,
													maskImage: `url(${hunting_grounds_01})`,
													transformOrigin: "top left",
													transform:
														"scale(calc(40 / 124 * 0.8)) translate(10%, 10%)",
												}}
											></div>
										</div>
									</p>

									<div className="relative mt-5 text-sm">
										<ul className="mt-1 flex flex-row gap-6">
											<li>
												<span
													aria-label="Credits"
													className="absolute w-16 h-16 top-1 bg-green-100"
													style={{
														WebkitMaskImage: `url(${objective_credits})`,
														maskImage: `url(${objective_credits})`,
														transformOrigin: "top left",
														transform: "scale(calc(16 / 64))",
													}}
												/>
												<span className="inline-block ml-6">
													{mission.credits +
														(mission.extraRewards?.circumstances?.credits || 0)}
												</span>
												<span></span>
												{mission.extraRewards?.sideMission && (
													<div className="relative ml-6 -mt-1 text-xs">
														+ {mission.extraRewards.sideMission.credits}
													</div>
												)}
											</li>
											<li>
												<span
													aria-label="Experience"
													className="absolute w-16 h-16 top-1 bg-green-100"
													style={{
														WebkitMaskImage: `url(${objective_xp})`,
														maskImage: `url(${objective_xp})`,
														transformOrigin: "top left",
														transform: "scale(calc(16 / 64))",
													}}
												/>
												<span className="inline-block ml-5">
													{mission.xp +
														(mission.extraRewards?.circumstances?.xp || 0)}
												</span>
												{mission.extraRewards?.sideMission && (
													<div className="relative ml-5 -mt-1 text-xs">
														+ {mission.extraRewards.sideMission.xp}
													</div>
												)}
											</li>
										</ul>
										<div className="absolute w-10 h-10 -top-1 -left-12 p-[2px] bg-gray-900">
											<img
												src={party_scripture}
												alt=""
												className="border border-solid p-1 border-gray-300"
											/>
										</div>
									</div>
								</div>

								<MissionTimer mission={mission} />

								<div className="absolute w-10 h-10 -top-2 -left-3 p-[2px] bg-gray-900">
									<img
										src={img_url(
											`content/ui/textures/icons/mission_types/mission_type_${
												missionInfo[mission.map as keyof typeof missionInfo]
													.mission_type
											}`
										)}
										alt=""
										className="border border-solid p-1 border-gray-300"
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	)
}
