import { Link, useLoaderData, useOutlet } from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { z } from "zod"
import { zx } from "zodix"
import { getAuthToken } from "~/services/db/authtoken.server"
import { authenticator } from "~/services/auth.server"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table"
import { getGameplaySessions } from "~/services/db/gameplaySessions.server"
import useLocale from "~/hooks/locale"

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
	let subpage = useOutlet()

	if (process.env.NODE_ENV !== "development") {
		return (
			<div className="max-w-7xl mx-auto flex gap-4 pb-4 flex-wrap">
				coming soon
			</div>
		)
	}

	if (subpage) {
		return subpage
	}

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
