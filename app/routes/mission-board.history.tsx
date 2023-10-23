import { Link, useLoaderData, useSearchParams } from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/server-runtime"
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
import { ChevronDown } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import type { MissionInstance } from "@prisma/client"
import { isKeyOf } from "~/utils/isKeyOf"
import useLocale from "~/hooks/locale"

let FILTERS = [
	"circumstance",
	"sideMission",
	"challenge",
	"map",
] satisfies (keyof MissionInstance)[]

export async function loader({ request }: LoaderArgs) {
	let searchParams = new URL(request.url).searchParams

	let filters: Record<string, string[]> = {}
	for (let filter of FILTERS) {
		filters[filter] = searchParams.getAll(filter).filter(Boolean)
	}

	console.log(filters)

	let rawMissions = await getMissionHistory()

	let circumstances = Array.from(
		new Set(rawMissions.map((mission) => mission.circumstance)),
	)
		.map((circumstance) => {
			const template = CircumstanceTemplates[circumstance]
			if (template) {
				return {
					value: circumstance,
					label: t(template.display_name),
				}
			}
			return false
		})
		.filter(Boolean)
		.sort((a, b) => (a.label > b.label ? 1 : -1))

	let maps = Array.from(new Set(rawMissions.map((mission) => mission.map)))
		.map((map) => {
			const template = getMissionTemplate(map)
			if (template) {
				return {
					value: map,
					label: t(template.display_name),
				}
			}
			return false
		})
		.filter(Boolean)
		.sort((a, b) => (a.label > b.label ? 1 : -1))

	let filteredMissions = rawMissions.filter((mission) => {
		for (let filter in filters) {
			let selected = filters[filter]
			if (isKeyOf(mission, filter)) {
				if (selected?.length && !selected?.includes(String(mission[filter]))) {
					return false
				}
			}
		}
		return true
	})

	let missions = filteredMissions.map((mission) => {
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

	return json({ missions, circumstances, maps })
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

let columns: Column[] = [
	({ category, challenge }) => (
		<div className=" flex h-6 w-full justify-center gap-[2px]">
			{Array.from({ length: challenge }).map((_, i) => (
				<span
					key={i}
					className={cn(
						"h-full w-2 dark:bg-green-100 bg-green-500",
						category === "auric" && "dark:bg-amber-100 bg-amber-500",
					)}
				></span>
			))}
			{Array.from({ length: 5 - challenge }).map((_, i) => (
				<span
					key={i}
					className={cn(
						"h-full w-2 border dark:border-green-100 border-green-500",
						category === "auric" && "dark:border-amber-100 border-amber-500",
					)}
				></span>
			))}
		</div>
	),
	({ map }) => map,
	({ circumstance }) =>
		circumstance != null ? (
			<div className="flex items-center">
				<Img
					src={circumstance.icon}
					width={128}
					className="w-8 h-8 mr-4 invert dark:invert-0"
				/>
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
				className="invert dark:invert-0"
			/>
		) : null,
	({ start }) => {
		let locale = useLocale()
		return (
			<span suppressHydrationWarning>
				{new Date(start).toLocaleString(locale)}
			</span>
		)
	},
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

function SearchParamsDropdownMenu({
	label,
	param,
	items,
}: {
	label: string
	param: string
	items: { label: string; value: string }[]
}) {
	const [searchParams, setSearchParams] = useSearchParams()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="ml-auto">
					{label} <ChevronDown className="ml-2 h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{items.map((item) => {
					return (
						<DropdownMenuCheckboxItem
							key={item.value}
							className="capitalize"
							checked={searchParams.getAll(param).includes(item.value)}
							onCheckedChange={(checked) => {
								if (checked) {
									searchParams.append(param, item.value)
								} else {
									searchParams.delete(param, item.value)
								}
								setSearchParams(searchParams.toString())
							}}
						>
							{item.label}
						</DropdownMenuCheckboxItem>
					)
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default function MissionHistory() {
	const { missions, circumstances, maps } = useLoaderData<typeof loader>()

	let headers = [
		<SearchParamsDropdownMenu
			key="challenge"
			param="challenge"
			label="Difficulty"
			items={[
				{ label: "Damnation", value: "5" },
				{ label: "Heresy", value: "4" },
				{ label: "Malice", value: "3" },
				{ label: "Uprising", value: "2" },
				{ label: "Sedition", value: "1" },
			]}
		/>,
		<SearchParamsDropdownMenu key="map" param="map" label="Map" items={maps} />,
		<SearchParamsDropdownMenu
			key="circumstance"
			param="circumstance"
			label="Circumstance"
			items={circumstances}
		/>,
		<SearchParamsDropdownMenu
			key="sideMission"
			param="sideMission"
			label="Side objective"
			items={[
				{ label: "Scriptures", value: "side_mission_tome" },
				{ label: "Grimoire", value: "side_mission_grimoire" },
			]}
		/>,
		"Started at",
		"ID",
	]

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
							{headers.map((col, i) => (
								<TableHead key={i}>{col}</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{missions.map((mission) => (
							<TableRow key={mission.id}>
								{columns.map((Col, i) => (
									<TableCell key={i}>
										<Col {...mission} />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
