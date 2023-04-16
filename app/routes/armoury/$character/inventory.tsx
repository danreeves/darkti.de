import { ChevronDoubleUpIcon } from "@heroicons/react/24/outline"
import { useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { z } from "zod"
import { zx } from "zodix"
import { getAuthToken } from "~/data/authtoken.server"
import { getItems } from "~/data/items.server"
import { BlessingSchema, WeaponSchema } from "~/data/schemas.server"
import { authenticator } from "~/services/auth.server"
import { getAccountGear } from "~/services/darktide.server"
import { classnames } from "~/utils/classnames"

export let handle = "inventory"

export async function loader({ request, params }: LoaderArgs) {
	const { character } = zx.parseParams(params, { character: z.string() })
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	let auth = await getAuthToken(user.id)

	if (auth) {
		let gear = await getAccountGear(auth)
		if (gear) {
			const weapons = await getItems(WeaponSchema)
			const blessings = await getItems(BlessingSchema)
			let characterGear = Object.entries(gear)
				.filter(([, item]) => {
					return !item.characterId || item.characterId === character
				})
				.map(([id, item]) => {
					let weapon = weapons.find(
						(wep) => wep.id === item.masterDataInstance.id
					)
					if (!weapon) return undefined

					let rarity = item.masterDataInstance.overrides?.rarity ?? 1
					let baseItemLevel = item.masterDataInstance.overrides?.baseItemLevel
					let previewImage = `https://img.darkti.de/pngs/${weapon.preview_image}.png`
					let displayName = weapon.display_name
					let traits =
						item.masterDataInstance.overrides?.traits
							?.map((t) => {
								let blessing = blessings.find((b) => b.id === t.id)
								if (!blessing) return undefined
								return {
									rarity: t.rarity,
									displayName: blessing.display_name,
									icon: `https://img.darkti.de/pngs/${blessing.icon}.png`,
								}
							})
							.filter(Boolean) ?? []
					return {
						id,
						rarity,
						baseItemLevel,
						previewImage,
						displayName,
						traits,
					}
				})
				.filter(Boolean)
			return json({ items: characterGear })
		}
	}
	return json({ items: [] })
}

let rarityBorder: Record<string, string> = {
	1: "border-l-neutral-600 from-neutral-50",
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

export default function Inventory() {
	let { items } = useLoaderData<typeof loader>()
	return (
		<>
			<div className="grid w-full grow grid-cols-4 gap-4 bg-neutral-200 p-4 shadow-inner">
				{items.map((item) => {
					return (
						<div
							key={item.id}
							className={classnames(
								"border-l-3 from-1% relative border-2 border-neutral-400 bg-white bg-gradient-to-r shadow",
								rarityBorder[item.rarity]
							)}
						>
							<img
								alt=""
								loading="lazy"
								className="pointer-events-none absolute right-0 top-0 h-full"
								src={item.previewImage}
							/>
							<div className="isolate">
								<div
									className={classnames(
										"m-2 font-bold leading-none",
										rarityColor[item.rarity]
									)}
								>
									{item.displayName}
								</div>
								<span className="m-2 flex items-center font-bold leading-none">
									<ChevronDoubleUpIcon
										className="mr-0.5 h-4 w-4"
										aria-hidden="true"
									/>
									{item.baseItemLevel}
								</span>
								<div className="m-2 flex items-center gap-2">
									{item.traits.map((trait) => (
										<img
											className="h-10 w-10 rounded invert"
											key={trait.icon}
											alt={`Rarity ${trait.rarity} ${trait.displayName}`}
											title={`Rarity ${trait.rarity} ${trait.displayName}`}
											src={trait.icon}
										/>
									))}
								</div>
							</div>
						</div>
					)
				})}
			</div>
			<div>filters</div>
		</>
	)
}
