import { Link, useLoaderData } from "@remix-run/react"
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
import { is, record, string } from "valibot"
import { getGameplaySessions } from "~/data/gameplaySessions.server"
import useLocale from "~/hooks/locale"

type Stats = { typePath: string[]; value: Record<string, number> }[]
function zipStats(stats: Stats) {
	return zipObjectDeep(
		stats.map((stat) => stat.typePath.join(".")),
		stats.map((stat) => stat.value),
	)
}

function explodeKeyTable(keyTable: unknown): Record<string, unknown>[] {
	let result = []

	if (is(record(string()), keyTable)) {
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

	let gameplaySessions = await getGameplaySessions({
		accountId: auth.sub,
		characterId,
	})

	return json({
		sessions: gameplaySessions.map((s) => {
			return { id: s.sessionId, createdAt: s.createdAt }
		}),
	})
}

export default function Statistics() {
	let { sessions } = useLoaderData<typeof loader>()
	let locale = useLocale()

	return (
		<div className="max-w-7xl mx-auto flex gap-4 pb-4 flex-wrap">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Ended at</TableHead>
							<TableHead>Session</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sessions.map((session) => {
							return (
								<TableRow key={session.id}>
									<TableCell className="p-0">
										<Link className="p-4 flex object-cover" to={session.id}>
											{new Date(session.createdAt).toLocaleString(locale)}
										</Link>
									</TableCell>
									<TableCell className="p-0">
										<Link className="p-4 flex object-cover" to={session.id}>
											{session.id}
										</Link>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
