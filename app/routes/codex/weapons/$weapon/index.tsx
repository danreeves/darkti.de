import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { getLocalization } from "~/data/localization.server"
import { getWeapon } from "~/data/weapons.server"

export const loader = async ({ params }: LoaderArgs) => {
	let weapon = await getWeapon(params.weapon)
	let localizationData = getLocalization()
	return json({ title: localizationData[weapon.display_name], weapon })
}

export default function Weapon() {
	const { weapon } = useLoaderData<typeof loader>()

	return <pre>{JSON.stringify(weapon, null, 4)}</pre>
}
