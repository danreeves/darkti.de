import { useLoaderData, useLocation } from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/server-runtime"
import { redirect } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { z } from "zod"
import { zx } from "zodix"
import { getAuthToken } from "~/data/authtoken.server"
import { getItems } from "~/data/items.server"
import { BlessingSchema, WeaponSchema } from "~/data/schemas.server"
import { authenticator } from "~/services/auth.server"
import { getAccountGear } from "~/services/darktide.server"
import { motion } from "framer-motion"

export let handle = "inventory"

export async function loader({ request, params }: LoaderArgs) {
	let { character: characterId, item: itemId } = zx.parseParams(params, {
		character: z.string(),
		item: z.string(),
	})

	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	let auth = await getAuthToken(user.id)

	if (auth) {
		let gear = await getAccountGear(auth)
		if (gear) {
			let [weapons, blessings] = await Promise.all([
				getItems(WeaponSchema),
				getItems(BlessingSchema),
			])

			let [, item] =
				Object.entries(gear)
					.filter(([, item]) => {
						return !item.characterId || item.characterId === characterId
					})
					.find(([id]) => {
						return id === itemId
					}) ?? []

			let weapon = weapons.find(
				(wep) => item && wep.id === item.masterDataInstance.id
			)

			if (!item || !weapon) {
				redirect(`/armoury/${characterId}/inventory`)
				return json(null)
			}

			let rarity = item.masterDataInstance.overrides?.rarity ?? 1
			let baseItemLevel = item.masterDataInstance.overrides?.baseItemLevel
			let previewImage = `${weapon.preview_image}.png`
			let displayName = weapon.display_name
			let traits =
				item.masterDataInstance.overrides?.traits
					?.map((t) => {
						let blessing = blessings.find((b) => b.id === t.id)
						if (!blessing) return undefined
						let [baseName] = t.id.match(/\w+$/) ?? []
						return {
							baseName,
							rarity: t.rarity,
							displayName: blessing.display_name,
							icon: `${blessing.icon}.png`,
						}
					})
					.filter(Boolean) ?? []

			return json({
				displayName,
				rarity,
				previewImage,
				baseItemLevel,
				traits,
			})
		}
	}
	return json(null)
}

let rarityBorder: Record<string, string> = {
	1: "border-l-neutral-600 from-neutral-100",
	2: "border-l-green-600 from-green-50",
	3: "border-l-blue-600 from-blue-50",
	4: "border-l-purple-600 from-purple-50",
	5: "border-l-orange-600 from-orange-50",
}

let rarityColor: Record<string, string> = {
	1: "text-neutral-800",
	2: "text-green-800",
	3: "text-blue-800",
	4: "text-purple-800",
	5: "text-orange-800",
}

export default function Item() {
	let item = useLoaderData<typeof loader>()
	let { pathname } = useLocation()

	if (!item) return null

	return (
		<motion.div
			key={pathname}
			className="absolute right-0 top-0 h-full w-2/3 bg-white"
			initial={{ translateX: "10%", opacity: 0 }}
			animate={{ translateX: 0, opacity: 1 }}
			exit={{ translateX: "50%", opacity: 0 }}
			transition={{ type: "easeOut", duration: 0.1 }}
		>
			<div>
				<pre>{JSON.stringify(item, null, 4)}</pre>
			</div>
		</motion.div>
	)
}
