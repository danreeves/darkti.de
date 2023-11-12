import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { deleteAuthToken, getAuthToken } from "~/services/db/authtoken.server"
import { authenticator } from "~/services/auth.server"
import { Form, useLoaderData } from "@remix-run/react"

import { TrashIcon } from "@heroicons/react/24/outline"
import { Button } from "~/components/ui/button"

export async function loader({ request }: LoaderFunctionArgs) {
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	let hasAuthToken = false

	try {
		await getAuthToken(user.id)
		hasAuthToken = true
	} catch (e) {
		hasAuthToken = false
	}

	return json({ title: "Settings", hasAuthToken })
}

export async function action({ request }: ActionFunctionArgs) {
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})
	await deleteAuthToken(user.id)
	return true
}

export default function Settings() {
	let { hasAuthToken } = useLoaderData<typeof loader>()

	return (
		<div className="p-4 rounded-lg border bg-card text-card-foreground shadow-smw">
			<Form method="post" className="flex flex-row items-center gap-6">
				<Button variant="destructive" type="submit" disabled={!hasAuthToken}>
					<TrashIcon className="block h-6 w-6" aria-hidden="true" />
					Delete authentication token
				</Button>

				<p>
					Delete your authentication token? You'll no longer be able to use the
					Armoury features of this site.
				</p>
			</Form>
		</div>
	)
}
