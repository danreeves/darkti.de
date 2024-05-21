import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { getItem } from "~/data/items.server"
import { WeaponSchema } from "~/data/schemas.server"

export const loader = async ({ params }: LoaderFunctionArgs) => {
	let weapon = await getItem(WeaponSchema, params.weapon || "NO WEAPON PARAM?")
	if (!weapon) {
		throw new Response("Not Found", {
			status: 404,
		})
	}
	return json({ title: weapon.display_name, weapon })
}

export default function Weapon() {
	const { weapon } = useLoaderData<typeof loader>()

	return <pre>{JSON.stringify(weapon, null, 4)}</pre>
}
