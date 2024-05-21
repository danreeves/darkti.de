import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { Form, useLoaderData } from "@remix-run/react"

import { Button } from "~/components/ui/button"
import { Trash2 } from "lucide-react"
import { Label, TextField } from "react-aria-components"
import { Textarea } from "~/components/ui/textarea"
import { number, object, parse, string } from "valibot"
import { refreshToken } from "~/services/darktide.server"

export async function loader({ request }: LoaderFunctionArgs) {
	return json({ title: "Settings", hasAuthToken: false })
}

const AuthDataSchema = object({
	AccessToken: string(),
	RefreshToken: string(),
	ExpiresIn: number(),
	Sub: string(),
	AccountName: string(),
	RefreshAt: number(),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.clone().formData()
	return formData.get("userdata")
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
