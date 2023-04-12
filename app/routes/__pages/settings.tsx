import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { deleteAuthToken, getAuthToken } from "~/data/authtoken.server"
import { authenticator } from "~/services/auth.server"
import { Form, useLoaderData } from "@remix-run/react"

import { TrashIcon } from "@heroicons/react/24/outline"

export async function loader({ request }: LoaderArgs) {
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	let auth = await getAuthToken(user.id)

	let hasAuthToken = !!auth

	return json({ title: "Settings", hasAuthToken })
}

export async function action({ request }: ActionArgs) {
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})
	await deleteAuthToken(user.id)
	return true
}

export default function Settings() {
	let { hasAuthToken } = useLoaderData<typeof loader>()

	return (
		<div className="rounded bg-white p-4 shadow">
			<Form method="post" className="flex flex-row items-center gap-6">
				<button
					type="submit"
					disabled={!hasAuthToken}
					className="flex cursor-pointer flex-row items-center gap-2 rounded bg-red-600 p-4 text-white disabled:cursor-not-allowed disabled:bg-neutral-400"
				>
					<TrashIcon className="block h-6 w-6" aria-hidden="true" />
					Delete authentication token
				</button>

				<p>
					Delete your authentication token? You'll no longer be able to use the
					Armoury features of this site.
				</p>
			</Form>
		</div>
	)
}
