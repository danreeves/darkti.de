import { Form, useActionData } from "@remix-run/react"
import { json } from "@remix-run/server-runtime"
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { getAuthToken } from "~/services/db/authtoken.server"
import { authenticator } from "~/services/auth.server"

export async function loader({ request }: LoaderArgs) {
	if (process.env.NODE_ENV !== "development") {
		throw new Response(null, { status: 404 })
	}

	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})
	let auth = await getAuthToken(user.id)

	if (!auth) {
		throw new Response(null, { status: 404 })
	}

	return null
}

export async function action({ request }: ActionArgs) {
	if (process.env.NODE_ENV !== "development") {
		throw new Response(null, { status: 404 })
	}

	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})
	let auth = await getAuthToken(user.id)

	if (!auth) {
		throw new Response(null, { status: 404 })
	}

	let form = await request.formData()
	let path = form.get("path")

	let url = `https://bsp-td-prod.atoma.cloud/${path}`

	let response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			authorization: `Bearer ${auth.accessToken}`,
		},
	})

	if (response.ok) {
		return json(await response.json())
	}

	return json({ error: await response.text() })
}

export default function DevTool() {
	let actionData = useActionData<typeof action>()

	return (
		<>
			<Form method="POST">
				<Input type="text" name="path" />

				<Button type="submit">Fetch</Button>
			</Form>
			<pre>{JSON.stringify(actionData, null, 4)}</pre>
		</>
	)
}
