import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { reverse, sortBy } from "lodash-es"
import { getMissions } from "~/services/darktide.server"
import {
	getMissionTemplate,
	CircumstanceTemplates,
	MissionTypes,
	Zones,
} from "~/data/missionTemplates.server"
import { t } from "~/data/localization.server"
import { Link, useLoaderData } from "@remix-run/react"
import { Mission, sideObjectiveToType } from "~/components/Mission"
import { isKeyOf } from "~/utils/isKeyOf"
import { Form } from "~/components/Form"
// import {
// 	Select,
// 	SelectContent,
// 	SelectGroup,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "~/components/ui/select"
import { Label } from "~/components/ui/label"
import { Button } from "~/components/ui/button"
import { AlertTriangle } from "lucide-react"

const FILTER_BY_CATEGORY: Record<
	string,
	(obj: { category: string | null }) => boolean
> = {
	regular: ({ category }) => category === null,
	auric: ({ category }) => category === "auric",
} as const

function filterByCategory(category: string | null) {
	if (isKeyOf(FILTER_BY_CATEGORY, category)) {
		let filter = FILTER_BY_CATEGORY[category]
		if (filter) {
			return filter
		}
	}
	return () => true
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const filterCat = url.searchParams.get("category")

	const auth = {
		userId: 1,
		accessToken: "1",
		refreshToken: "1",
		sub: "1",
		expiresAt: new Date(),
	}
	const data = await getMissions(auth)
	if (!data) {
		return json({ title: "Missions", missions: [] })
	}

	const { missions: rawMissions } = data
	const sortedMissions = reverse(
		sortBy(rawMissions, ["challenge", "resistance"]),
	)
	const missions = sortedMissions
		.map((mission) => {
			const template = getMissionTemplate(mission.map)
			if (!template) return undefined

			const circumstance = CircumstanceTemplates[mission.circumstance]
			const missionType = MissionTypes[template.type]
			const zone = Zones[template.zone_id]

			return {
				id: mission.id,
				texture: template.texture_medium + ".png",
				type: t(MissionTypes[template.type]?.name ?? "unknown"),
				challenge: mission.challenge,
				name: t(template.display_name),
				zone: t(zone?.name_short || zone?.name || "unknown"),
				description: t(template.description),
				circumstanceId: mission.circumstance,
				circumstance: circumstance
					? {
							name: t(circumstance.display_name),
							icon: circumstance.icon.replace("materials", "textures") + ".png", // TODO: move replace to Exporter
						}
					: null,
				credits: mission.credits,
				extraRewards: mission.extraRewards,
				xp: mission.xp,
				// TODO: parseInt on the client
				start: parseInt(mission.start, 10),
				end: parseInt(mission.expiry, 10),
				missionTypeIcon:
					missionType?.icon.replace("materials", "textures") || null, // TODO: move replace to Exporter
				sideMission: mission.sideMission ?? null,
				category: mission.category ?? null,
				flags: mission.flags,
				sideMissionDescription: mission.sideMission
					? t(
							`loc_objective_side_mission_${sideObjectiveToType(
								mission.sideMission,
							)}_header`,
						)
					: null,
				missionGiver: mission.missionGiver,
			}
		})
		.filter(Boolean)
		.filter(filterByCategory(filterCat))

	return json({ title: "Missions", missions })
}

export default function Missions() {
	const { title, missions } = useLoaderData<typeof loader>()

	return (
		<>
			<h1 className="sr-only">{title}</h1>
			<div className="justify-center overflow-y-scroll">
				<Form
					replace
					className="mx-auto max-w-7xl py-6 px-6 lg:px-8 place-content-between items-end"
				>
					<div className="grid items-center gap-1.5">
						<Label htmlFor="name">Category</Label>
						{/* <Select name="category" defaultValue="all">
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="regular">Regular</SelectItem>
									<SelectItem value="auric">Auric</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select> */}
					</div>

					<Button variant="outline">
						<Link to="history">View mission history</Link>
					</Button>
				</Form>
				<div className="m-12 mt-0 flex flex-wrap justify-evenly gap-2">
					{missions.map((mission) => (
						<Mission
							key={mission.id}
							id={mission.id}
							texture={mission.texture}
							type={mission.type}
							challenge={mission.challenge}
							name={mission.name}
							description={mission.description}
							zone={mission.zone}
							circumstance={mission.circumstance}
							credits={mission.credits}
							xp={mission.xp}
							start={mission.start}
							end={mission.end}
							extraRewards={mission.extraRewards}
							missionTypeIcon={mission.missionTypeIcon}
							sideMission={mission.sideMission}
							category={mission.category}
						/>
					))}
				</div>
			</div>
		</>
	)
}

export function ErrorBoundary() {
	return (
		<div className="mx-auto flex max-w-7xl place-content-center px-4 pb-4 pt-6 sm:px-8 lg:px-10">
			<div
				className="flex rounded-lg bg-yellow-100 p-4 text-sm text-yellow-700"
				role="alert"
			>
				<AlertTriangle className="mr-3 inline h-5 w-5" aria-hidden="true" />
				<div>
					<span className="font-medium">Sorry!</span> We're having trouble
					authenticating with the server.
				</div>
			</div>
		</div>
	)
}
