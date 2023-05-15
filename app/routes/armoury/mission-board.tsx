import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { reverse, sortBy } from "lodash-es"
import { getAuthToken } from "~/data/authtoken.server"
import { authenticator } from "~/services/auth.server"
import { getMissions } from "~/services/darktide.server"
import { MissionTimer } from "~/components/MissionTimer"
import mission_loc from "~/data/exported/mission_localization_en.json"
import mission_type_by_map from "~/data/exported/mission_type_map.json"

import mission_type_05 from "~/img/mission_type_05.png"
import hunting_grounds_01 from "~/img/hunting_grounds_01.png"
import party_scripture from "~/img/party_scripture.png"
import objective_credits from "~/img/objective_credits.png"
import objective_xp from "~/img/objective_xp.png"

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
								src={`https://darktide-images.vercel.app/_vercel/image?q=100&url=pngs/content/ui/textures/missions/${mission.map}_medium.png&w=512`}
								alt=""
								className="absolute w-full h-full top-0 left-0 object-cover rounded"
							/>

							<div
								className="relative w-full pl-9 pb-2"
								style={{
									background: `linear-gradient(180deg,
											hsl(0 0% 0% / 1) 0%,
											hsl(0 0% 0% / 0.35) 80%,
											hsl(0 0% 0% / 0) 100%)`,
								}}
							>
								<div className="h-7 flex flex-row justify-between items-center text-sm">
									<div className="uppercase">Assassination</div>

									<div className="w-full h-6 flex justify-end gap-[2px] mt-3 mr-2">
										{Array(mission.challenge).fill(
											<span className="w-2 h-full bg-green-100"></span>
										)}
										{Array(5 - mission.challenge).fill(
											<span className="w-2 h-full border border-green-100"></span>
										)}
									</div>
								</div>

								<div className="pr-4">
									<h2 className="font-bold">Chasm Transit {i}</h2>
									<div className="-mt-1 text-xs">
										Terminus Station HL-36 "The Train Place"
									</div>

									<p className="relative mt-2 text-xs">
										The Heretics are brewing a pathogen in one of the Hourglass'
										fuel refineries. Get access to said refinery and destroy the
										pathogen.
									</p>

									<p className="relative mt-2 pt-[0.375rem] align-text-middle text-sm text-yellow-400">
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
							</div>

							<MissionTimer mission={mission} />

							<div className="absolute w-10 h-10 -top-3 -left-3 p-[2px] bg-gray-900">
								<img
									src={mission_type_05}
									alt=""
									className="border border-solid p-1 border-gray-300"
								/>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	)
}
