import { useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { z } from "zod"
import { zx } from "zodix"
import { getAuthToken } from "~/data/authtoken.server"
import { authenticator } from "~/services/auth.server"
import { getCharacterStats } from "~/services/darktide.server"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table"
import { zipObjectDeep, get, orderBy } from "lodash-es"
import { isRecord } from "~/utils/isRecord"

type Stats = { typePath: string[]; value: Record<string, number> }[]
function zipStats(stats: Stats) {
	return zipObjectDeep(
		stats.map((stat) => stat.typePath.join(".")),
		stats.map((stat) => stat.value),
	)
}

function explodeKeyTable(keyTable: unknown): Record<string, unknown>[] {
	let result = []

	if (isRecord(keyTable)) {
		for (let key in keyTable) {
			let value = keyTable[key]
			let row: Record<string, unknown> = { value }

			let otherCols = key.split("|")
			if (Array.isArray(otherCols) && otherCols.length) {
				for (let col of otherCols) {
					let [key, val] = col.split(":")
					if (key) {
						row[key] = val
					}
				}
			}

			result.push(row)
		}
	}

	return result
}

export async function loader({ params, request }: LoaderArgs) {
	let { character: characterId } = zx.parseParams(params, {
		character: z.string(),
	})
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	let auth = await getAuthToken(user.id)

	let [rawKillStats = [], rawMissionStats = [], rawTeamStats = []] =
		await Promise.all([
			getCharacterStats(auth, characterId, "kill"),
			getCharacterStats(auth, characterId, "mission"),
			getCharacterStats(auth, characterId, "team"),
		])

	let kill = zipStats(rawKillStats)
	let mission = zipStats(rawMissionStats)
	let team = zipStats(rawTeamStats)

	let killMinion = explodeKeyTable(
		"kill_minion" in kill ? kill.kill_minion : {},
	)
	let m = "mission" in mission ? mission.mission : {}
	let justMissions = {}
	if (isRecord(m)) {
		justMissions = { ...m }
		if ("playtime" in justMissions) {
			delete justMissions.playtime
		}
	}
	let missions = explodeKeyTable(justMissions)

	return json({
		...kill,
		...team,
		kill_minion: orderBy(
			killMinion,
			["value", "type", "name"],
			["desc", "asc", "asc"],
		),
		missions: orderBy(
			missions,
			["value", "name", "difficulty"],
			["desc", "asc", "asc"],
		),
		playtime: get(mission, "mission.playtime"),
	})
}

export default function Statistics() {
	let stats = useLoaderData<typeof loader>()

	return (
		<div className="max-w-7xl mx-auto flex gap-4 pb-4 flex-wrap">
			<div>
				<StatsTable>
					<TableRow>
						<TableCell>Playtime</TableCell>
						<TableCell>
							{secondsToHours(get(stats, "playtime.total"))} hours
						</TableCell>
					</TableRow>

					<TableRow>
						<TableCell>Team total kills</TableCell>
						<TableCell>{formatNumber(get(stats, "team_kills.none"))}</TableCell>
					</TableRow>

					<TableRow>
						<TableCell>Team total deaths</TableCell>
						<TableCell>
							{formatNumber(get(stats, "team_deaths.none"))}
						</TableCell>
					</TableRow>

					<TableRow>
						<TableCell>Team monster kills</TableCell>
						<TableCell>{formatNumber(get(stats, "kill_boss.none"))}</TableCell>
					</TableRow>
				</StatsTable>
			</div>
			<div>
				<AutoTable
					rows={stats.kill_minion}
					cols={[
						{ label: "Kill type", key: "type" },
						{ label: "Breed", key: "name" },
						{ label: "Kills", key: "value" },
					]}
				/>
			</div>

			<div>
				<AutoTable
					rows={stats.missions}
					cols={[
						{ label: "Map", key: "name" },
						{ label: "Difficulty", key: "difficulty" },
						{ label: "Win", key: "win" },
						{ label: "Count", key: "value" },
						{ label: "Side objective", key: "side_objective_name" },
						{
							label: "Side objective complete",
							key: "side_objective_complete",
						},
					]}
				/>
			</div>
		</div>
	)
}

function secondsToHours(input: number | string | undefined): string {
	if (!input) return "0"
	return (Number(input) / 60 / 60).toFixed(1)
}

function formatNumber(num: number | string | undefined): string {
	if (num == null) return "0"
	return new Intl.NumberFormat().format(Number(num))
}

function StatsTable({ children }: { children: React.ReactNode }) {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Statistic</TableHead>
						<TableHead>Value</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>{children}</TableBody>
			</Table>
		</div>
	)
}

function AutoTable({
	rows,
	cols,
}: {
	rows: Record<string, unknown>[]
	cols: { label: string; key: string }[]
}) {
	if (!rows.length) {
		return <div className="rounded-md border ">No results</div>
	}

	return (
		<div className="rounded-md border ">
			<Table>
				<TableHeader>
					<TableRow>
						{cols.map((col) => (
							<TableHead key={col.key}>{col.label}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row, i) => (
						<TableRow key={i}>
							{cols.map((col) => (
								<TableCell key={col.key}>{row[col.key]}</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
