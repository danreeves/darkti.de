import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
	deleteAuthToken,
	getAuthToken,
	updateAuthToken,
} from "~/services/db/authtoken.server"
import type { User } from "~/services/auth.server"
import { authenticator } from "~/services/auth.server"
import { Form, useLoaderData } from "@remix-run/react"

import { Button } from "~/components/ui/button"
import { Trash2 } from "lucide-react"
import { Label, TextField } from "react-aria-components"
import { Textarea } from "~/components/ui/textarea"
import { number, object, parse, string } from "valibot"
import { refreshToken } from "~/services/darktide.server"

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

const AuthDataSchema = object({
	AccessToken: string(),
	RefreshToken: string(),
	ExpiresIn: number(),
	Sub: string(),
	AccountName: string(),
	RefreshAt: number(),
})

async function authoriseUser(userdata: string, user: User) {
	let json: unknown

	try {
		json = JSON.parse(userdata)
	} catch (e) {
		throw new Error("Invalid JSON")
	}

	let data = parse(AuthDataSchema, json)

	let newToken = await refreshToken(data.RefreshToken)

	if (newToken) {
		let expiresAt = new Date()
		expiresAt.setSeconds(expiresAt.getSeconds() + newToken.ExpiresIn)

		await updateAuthToken({
			userId: user.id,
			expiresAt: expiresAt,
			sub: newToken.Sub,
			accessToken: newToken.AccessToken,
			refreshToken: newToken.RefreshToken,
		})
	}
}

export async function action({ request }: ActionFunctionArgs) {
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	const formData = await request.clone().formData()
	const action = formData.get("_action")

	if (action === "DELETE_AUTH") {
		await deleteAuthToken(user.id)
	}

	if (action === "ADD_AUTH") {
		authoriseUser(String(formData.get("userdata")), user)
	}

	return true
}

export default function Settings() {
	let { hasAuthToken } = useLoaderData<typeof loader>()

	return (
		<>
			<div className="p-4 mb-4 rounded-lg border bg-card text-card-foreground shadow-smw">
				<Form method="post" className="flex flex-row items-center gap-6">
					<input type="hidden" name="_action" value="DELETE_AUTH" />

					<Button variant="destructive" type="submit" disabled={!hasAuthToken}>
						<Trash2 className="block h-4 w-4 mr-1" aria-hidden="true" />
						Delete authentication token
					</Button>

					<p>
						Delete your authentication token? You'll no longer be able to use
						the Armoury features of this site.
					</p>
				</Form>
			</div>

			<div className="p-4 rounded-lg border bg-card text-card-foreground shadow-smw">
				<Form method="post" className="flex flex-col items-center gap-6">
					<input type="hidden" name="_action" value="ADD_AUTH" />

					<TextField className="grid w-full gap-1.5">
						<Label>Paste user json here:</Label>
						<Textarea name="userdata" />
					</TextField>

					<Button type="submit">Authorise</Button>
				</Form>
			</div>
		</>
	)
}
