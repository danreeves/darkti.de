import { Link, useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/server-runtime"
import { getMissionHistory } from "~/data/missionInstances.server"

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table"
import { cn } from "~/lib/utils"
import type { ReactNode } from "react"
import {
	CircumstanceTemplates,
	getMissionTemplate,
} from "~/data/missionTemplates.server"
import { t } from "~/data/localization.server"
import { Img } from "~/components/Img"
import { Button } from "~/components/ui/button"
import { sideObjectiveToType } from "~/components/Mission"

export async function loader() {
	let rawMissions = await getMissionHistory()

	let missions = rawMissions.map((mission) => {
		const circumstance = CircumstanceTemplates[mission.circumstance]
		const template = getMissionTemplate(mission.map)

		return {
			id: mission.id,
			challenge: mission.challenge,
			map: template ? t(template.display_name) : "<unknown>",
			circumstance: circumstance
				? {
						name: t(circumstance.display_name),
						icon: circumstance.icon.replace("materials", "textures") + ".png", // TODO: move replace to Exporter
				  }
				: null,
			start: mission.start,
			expires: mission.expiry,
			category: mission.category,
			sideMission: mission.sideMission,
		}
	})

	return json({ missions })
}

type Column = (data: {
	id: string
	challenge: number
	map: string
	circumstance: { name: string; icon: string } | null
	start: string
	expires: string
	category: string | null
	sideMission: string | null
}) => ReactNode

let headers = [
	"Difficulty",
	"Map",
	"Circumstance",
	"Side objective",
	"Started at",
	"ID",
]

let columns: Column[] = [
	({ category, challenge }) => (
		<div className=" flex h-6 w-full justify-center gap-[2px]">
			{Array.from({ length: challenge }).map((_, i) => (
				<span
					key={i}
					className={cn(
						"h-full w-2 bg-green-100",
						category === "auric" && "bg-amber-100",
					)}
				></span>
			))}
			{Array.from({ length: 5 - challenge }).map((_, i) => (
				<span
					key={i}
					className={cn(
						"h-full w-2 border border-green-100",
						category === "auric" && "border-amber-100",
					)}
				></span>
			))}
		</div>
	),
	({ map }) => map,
	({ circumstance }) =>
		circumstance != null ? (
			<div className="flex items-center">
				<Img src={circumstance.icon} width={128} className="w-8 h-8 mr-4" />
				{circumstance.name}
			</div>
		) : null,
	({ sideMission }) =>
		sideMission ? (
			<Img
				src={`content/ui/textures/icons/pocketables/hud/small/party_${sideObjectiveToType(
					sideMission,
				)}.png`}
				width={128}
				// TODO: scripts\settings\mission_objective\templates\side_mission_objective_template.lua
				alt={""}
				className="border border-solid border-gray-300 p-1"
			/>
		) : null,
	({ start }) => (
		<span suppressHydrationWarning>{new Date(start).toLocaleString()}</span>
	),
	({ id }) => (
		<Button
			onClick={() => {
				navigator.permissions
					// @ts-expect-error - clipboard-write is not in the types?
					.query({ name: "clipboard-write" })
					.then((result) => {
						if (result.state === "granted" || result.state === "prompt") {
							navigator.clipboard.writeText(id).then(
								() => {
									/* clipboard successfully set */
								},
								() => {
									/* clipboard write failed */
								},
							)
						}
					})
			}}
		>
			Copy ID
		</Button>
	),
]

export default function MissionHistory() {
	const { missions } = useLoaderData<typeof loader>()
	return (
		<div className="p-4 overflow-y-scroll">
			<div className="max-w-7xl mx-auto mb-4 flex flex-row-reverse p-6">
				<Button variant="outline" asChild>
					<Link to="/mission-board">Back to Mission Board</Link>
				</Button>
			</div>
			<div className="rounded-md border ">
				<Table>
					<TableHeader>
						<TableRow>
							{headers.map((col) => (
								<TableHead key={col}>{col}</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{missions.map((mission) => (
							<TableRow key={mission.id}>
								{columns.map((col, i) => (
									<TableCell key={i}>{col(mission)}</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
