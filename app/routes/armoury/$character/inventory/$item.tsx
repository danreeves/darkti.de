import { useLoaderData, useLocation } from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/node"
import { redirect, json } from "@remix-run/node"
import { z } from "zod"
import { zx } from "zodix"
import { getAuthToken } from "~/data/authtoken.server"
import { getItems } from "~/data/items.server"
import { BlessingSchema, WeaponSchema } from "~/data/schemas.server"
import { authenticator } from "~/services/auth.server"
import { getAccountGear } from "~/services/darktide.server"
import { motion } from "framer-motion"
import { classnames } from "~/utils/classnames"
import { Img } from "~/components/Img"
import { ChevronDoubleUpIcon } from "@heroicons/react/24/outline"
import { t } from "~/data/localization.server"
import { getWeaponTemplate } from "~/data/weaponTemplates.server"

export async function loader({ request, params }: LoaderArgs) {
	let { character: characterId, item: itemId } = zx.parseParams(params, {
		character: z.string(),
		item: z.string(),
	})

	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})
	let auth = await getAuthToken(user.id)
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

		let weaponTemplate = getWeaponTemplate(weapon?.baseName ?? "unknown")

		if (!item || !weapon || !weaponTemplate) {
			return redirect(`/armoury/${characterId}/inventory`)
		}

		let description = weapon.description
		let rarity = item.masterDataInstance.overrides?.rarity ?? 1
		let baseItemLevel = item.masterDataInstance.overrides?.baseItemLevel
		let itemLevel = item.masterDataInstance.overrides?.itemLevel
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
		let baseStats = (item.masterDataInstance.overrides?.base_stats ?? [])
			.map((baseStat) => {
				if (weaponTemplate) {
					let baseStatConfig = weaponTemplate.base_stats[baseStat.name]
					return {
						displayName: t(baseStatConfig?.display_name ?? "unknown"),
						value: baseStat.value,
					}
				}
				return undefined
			})
			.filter(Boolean)

		return json({
			displayName,
			rarity,
			previewImage,
			baseItemLevel,
			traits,
			baseStats,
			itemLevel,
			description,
		})
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
			className={classnames(
				"absolute right-0 top-0 flex h-full w-2/3 flex-col border-l-4 bg-white",
				rarityBorder[item.rarity]
			)}
			initial={{ translateX: "10%", opacity: 0 }}
			animate={{ translateX: 0, opacity: 1 }}
			exit={{ translateX: "50%", opacity: 0 }}
			transition={{ type: "easeOut", duration: 0.1 }}
		>
			<div className="flex flex-row">
				<div className="w-1/2">
					<h2
						className={classnames(
							"m-6 mb-1 font-heading text-xl",
							rarityColor[item.rarity]
						)}
					>
						{item.displayName}
					</h2>
					<span
						className={classnames(
							"m-6 mt-0 flex items-center font-heading text-lg font-bold leading-none",
							rarityColor[item.rarity]
						)}
						title="Item level"
					>
						<ChevronDoubleUpIcon
							className="mr-0.5 h-5 w-5"
							aria-hidden="true"
						/>
						{item.itemLevel}
					</span>

					<style>{`
.stat:nth-child(1) {
  grid-area: 1 / 1 / 2 / 2;
}
.stat:nth-child(2) {
  grid-area: 2 / 1 / 3 / 2;
}
.stat:nth-child(3) {
  grid-area: 2 / 3 / 3 / 4;
}
.stat:nth-child(4) {
  grid-area: 1 / 2 / 2 / 3;
}
.stat:nth-child(5) {
  grid-area: 2 / 2 / 3 / 3;
}
`}</style>
					<div className="relative m-6 mt-0">
						<span
							className={
								"absolute right-0 top-0 flex items-center font-heading text-lg text-sm font-bold"
							}
							title="Base item level"
						>
							<ChevronDoubleUpIcon
								className="mr-0.5 h-3 w-3"
								aria-hidden="true"
							/>
							{item.baseItemLevel}
						</span>
						<div
							data-section="base-stats"
							className="grid grid-cols-3 grid-rows-2 gap-2"
						>
							{item.baseStats.map((stat) => {
								return (
									<div key={stat.displayName} className="stat">
										<div className="font-heading">{stat.displayName}</div>
										<div className="flex flex-row">
											<div className="relative w-full border border-amber-400 p-px">
												<div
													style={{ width: stat.value * 100 + "%" }}
													className="z-2 absolute left-0 top-0 h-full border border-white bg-amber-400"
												/>
												<div className="z-1 isolate m-px mx-1 font-heading text-xs leading-none text-white">
													{Math.round(stat.value * 100)}%
												</div>
											</div>
										</div>
									</div>
								)
							})}
						</div>
					</div>
					<p className="m-6">{item.description}</p>
				</div>
				<Img
					src={item.previewImage}
					width="720"
					className="w-1/2 scale-x-[-1]"
				/>
			</div>
		</motion.div>
	)
}
