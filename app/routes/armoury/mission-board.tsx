import type { LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { reverse, sortBy } from "lodash-es"
import { getAuthToken } from "~/data/authtoken.server"
import { authenticator } from "~/services/auth.server"
import { getMissions } from "~/services/darktide.server"
import { MissionTimer } from "~/components/MissionTimer"
import {
	getMissionTemplate,
	CircumstanceTemplates,
	MissionTypes,
	Zones,
} from "~/data/missionTemplates.server"
import { t } from "~/data/localization.server"
import { Img, imgUrl } from "~/components/Img"

function sideObjectiveToType(sideObjectiveName: string) {
	if (sideObjectiveName === "side_mission_grimoire") {
		return "grimoire"
	}

	if (sideObjectiveName === "side_mission_tome") {
		return "scripture"
		// return "tome"
	}

	if (sideObjectiveName === "side_mission_consumable") {
		return "relic"
	}

	return "unknown"
}

export async function loader({ request }: LoaderArgs) {
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	let auth = await getAuthToken(user.id)

	let data = await getMissions(auth)
	if (!data) {
		return redirect("/armoury")
	}
	let { missions: rawMissions } = data
	let sortedMissions = reverse(sortBy(rawMissions, ["challenge", "resistance"]))
	let missions = sortedMissions
		.map((mission) => {
			let template = getMissionTemplate(mission.map)
			if (!template) return undefined

			let circumstance = CircumstanceTemplates[mission.circumstance]
			let missionType = MissionTypes[template.type]
			let zone = Zones[template.zone_id]

			return {
				id: mission.id,
				texture: template.texture_medium + ".png",
				type: t(MissionTypes[template.type]?.name ?? "unknown"),
				challenge: mission.challenge,
				name: t(template.display_name),
				zone: t(zone?.name_short || zone?.name || "unknown"),
				description: t(template.description),
				circumstance: circumstance
					? {
							name: t(circumstance.display_name),
							icon: circumstance.icon.replace("materials", "textures") + ".png", // TODO: move replace to Exporter
					  }
					: null,
				credits: mission.credits,
				extraRewards: mission.extraRewards,
				xp: mission.xp,
				start: parseInt(mission.start, 10),
				end: parseInt(mission.expiry, 10),
				missionType: {
					icon: missionType?.icon.replace("materials", "textures"), // TODO: move replace to Exporter
				},
				sideMission: mission.sideMission,
			}
		})
		.filter(Boolean)

	return json({ missions })
}

export default function Missions() {
	let { missions } = useLoaderData<typeof loader>()

	return (
		<>
			<h1 className="sr-only">Missions</h1>
			<div className="xl:px-48 flex h-full w-full justify-center overflow-y-scroll p-12">
				<div className="flex w-full flex-wrap justify-evenly gap-10">
					{missions.map((mission) => (
						<div
							key={mission.id}
							className="relative h-56 w-96 rounded font-montserrat text-green-100 drop-shadow-lg"
						>
							<Img
								width={512}
								src={mission.texture}
								className="absolute left-0 top-0 h-full w-full rounded object-cover"
							/>

							<div className="h-full transition-opacity">
								<div
									className="relative h-full w-full pb-2 pl-9"
									style={{
										background: `linear-gradient(180deg,
											hsl(0 0% 0% / 1) 0%,
											hsl(0 0% 0% / 0.35) 80%,
											hsl(0 0% 0% / 0) 100%)`,
									}}
								>
									<div className="flex h-8 flex-row items-center justify-between text-sm">
										<div className="uppercase">{mission.type}</div>

										<div className="mr-2 mt-2 flex h-6 w-full justify-end gap-[2px]">
											{Array.from({ length: mission.challenge }).map((_, i) => (
												<span
													key={i}
													className="h-full w-2 bg-green-100"
												></span>
											))}
											{Array.from({ length: 5 - mission.challenge }).map(
												(_, i) => (
													<span
														key={i}
														className="h-full w-2 border border-green-100"
													></span>
												)
											)}
										</div>
									</div>

									<div className="-mt-1 pr-4">
										<h2 className="font-bold !opacity-100">{mission.name}</h2>
										<div className="-mt-1 text-xs">{mission.zone}</div>

										<p className="invisible relative mt-2 text-xs xs:visible">
											{mission.description}
										</p>
									</div>
								</div>

								<div className="absolute left-9 top-32 text-xs">
									{mission.circumstance != null ? (
										<div className="align-text-middle relative pt-[0.375rem] text-sm text-yellow-400">
											{mission.circumstance.name}
											<div className="absolute -left-12 -top-1 h-10 w-10 border border-yellow-400 bg-gray-900 ">
												<div
													className="absolute left-0 top-0 h-[124px] w-[124px] bg-yellow-400"
													style={{
														WebkitMaskImage: `url(https://darktide-images.vercel.app/_vercel/image?q=100&w=128&url=pngs/${mission.circumstance.icon})`,
														maskImage: `url(https://darktide-images.vercel.app/_vercel/image?q=100&w=128&url=pngs/${mission.circumstance.icon})`,
														transformOrigin: "top left",
														transform:
															"scale(calc(40 / 124 * 0.8)) translate(10%, 10%)",
													}}
												></div>
											</div>
										</div>
									) : (
										<div className="relative h-[1.6rem]"></div>
									)}

									<div className="relative mt-5 text-sm">
										<ul
											className="mt-1 flex flex-row gap-6"
											style={{
												textShadow: "black 0 0 3px",
											}}
										>
											<li>
												<span
													aria-label="Credits"
													className="absolute top-1 h-16 w-16 bg-green-100"
													style={{
														WebkitMaskImage: `url(${imgUrl(
															"glyphs/objective_credits.png",
															128
														)})`,
														maskImage: `url(${imgUrl(
															"glyphs/objective_credits.png",
															128
														)})`,
														transformOrigin: "top left",
														transform: "scale(calc(16 / 64))",
													}}
												/>
												<span className="ml-6 inline-block">
													{mission.credits +
														(mission.extraRewards?.circumstance?.credits || 0)}
												</span>

												{mission.extraRewards?.sideMission && (
													<div className="relative -mt-1 ml-6 text-xs">
														+ {mission.extraRewards.sideMission.credits}
													</div>
												)}
											</li>
											<li>
												<span
													aria-label="Experience"
													className="absolute top-1 h-16 w-16 bg-green-100"
													style={{
														WebkitMaskImage: `url(${imgUrl(
															"glyphs/objective_xp.png",
															128
														)})`,
														maskImage: `url(${imgUrl(
															"glyphs/objective_xp.png",
															128
														)})`,
														transformOrigin: "top left",
														transform: "scale(calc(16 / 64))",
													}}
												/>
												<span className="ml-5 inline-block">
													{mission.xp +
														(mission.extraRewards?.circumstance?.xp || 0)}
												</span>
												{mission.extraRewards?.sideMission && (
													<div className="relative -mt-1 ml-5 text-xs">
														+ {mission.extraRewards.sideMission.xp}
													</div>
												)}
											</li>
										</ul>
										{mission.sideMission ? (
											<div className="absolute -left-12 -top-1 h-10 w-10 bg-gray-900 p-[2px]">
												<Img
													src={`content/ui/textures/icons/pocketables/hud/small/party_${sideObjectiveToType(
														mission.sideMission
													)}.png`}
													width={128}
													// TODO: scripts\settings\mission_objective\templates\side_mission_objective_template.lua
													// alt={loc(
													// 	`loc_objective_side_mission_${sideObjectiveToType(
													// 		mission.sideMission
													// 	)}_header`
													// )}
													className="border border-solid border-gray-300 p-1"
												/>
											</div>
										) : null}
									</div>
								</div>
								<MissionTimer start={mission.start} end={mission.end} />
								<div className="absolute -left-3 -top-2 h-10 w-10 bg-gray-900 p-[2px]">
									{mission.missionType ? (
										<Img
											width={128}
											src={mission.missionType.icon + ".png"}
											className="border border-solid border-gray-300 p-1"
										/>
									) : null}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	)
}
