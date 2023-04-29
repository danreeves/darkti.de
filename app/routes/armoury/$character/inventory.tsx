import { ChevronDoubleUpIcon } from "@heroicons/react/24/outline"
import {
	Link,
	NavLink,
	useLoaderData,
	useOutlet,
	useSearchParams,
} from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { AnimatePresence } from "framer-motion"
import { z } from "zod"
import { zx } from "zodix"
import { Checkbox, Form, FormGroup, Select, TextInput } from "~/components/Form"
import { Img } from "~/components/Img"
import { getAuthToken } from "~/data/authtoken.server"
import { getItems } from "~/data/items.server"
import { BlessingSchema, WeaponSchema } from "~/data/schemas.server"
import { authenticator } from "~/services/auth.server"
import { getAccountGear } from "~/services/darktide.server"
import { classnames } from "~/utils/classnames"
import { getSearchParam } from "~/utils/getSearchParam"

export let handle = "inventory"

export async function loader({ request, params }: LoaderArgs) {
	let { character } = zx.parseParams(params, { character: z.string() })
	let url = new URL(request.url)
	let filterItemTypes = getSearchParam(url.searchParams, "type", [
		"melee",
		"ranged",
	])
	let searchName = url.searchParams.get("name") ?? ""
	let searchBlessing = url.searchParams.get("blessing") ?? ""

	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	let auth = await getAuthToken(user.id)

	if (auth) {
		let gear = await getAccountGear(auth)
		if (gear) {
			let weapons = await getItems(WeaponSchema)
			let blessings = await getItems(BlessingSchema)
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
					return {
						id,
						rarity,
						baseItemLevel,
						itemLevel,
						previewImage,
						displayName,
						traits,
						itemType: weapon.item_type,
					}
				})
				.filter(Boolean)

			let items = characterGear.filter(
				(item) =>
					filterItemTypes.includes(item.itemType) &&
					item.displayName.toLowerCase().includes(searchName.toLowerCase()) &&
					(searchBlessing
						? item.traits.some((trait) => trait.baseName === searchBlessing)
						: true)
			)

			let traitTable: Record<string, string> = {}
			for (let item of characterGear) {
				for (let trait of item.traits) {
					traitTable[trait.baseName] = trait.displayName
				}
			}

			let traits = Object.entries(traitTable).map(
				([baseName, displayName]) => ({ baseName, displayName })
			)

			return json({ items, traits })
		}
	}

	return json({ items: [], traits: [] })
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

export default function Inventory() {
	let outlet = useOutlet()
	let { items, traits } = useLoaderData<typeof loader>()
	let [_searchParams] = useSearchParams()
	let searchParams = _searchParams.toString()
	return (
		<div className="relative flex h-full grow flex-row overflow-hidden">
			<Link
				to={`.?${searchParams}`}
				className={classnames(
					"grid h-full w-full grow auto-rows-min grid-cols-1 flex-row flex-wrap gap-4 overflow-y-scroll bg-neutral-200 p-4 shadow-inner lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
					!outlet && "cursor-default"
				)}
			>
				{items.map((item) => {
					return (
						<NavLink
							to={`${item.id}?${searchParams}`}
							key={item.id}
							className={({ isActive }) =>
								classnames(
									"from-1% relative h-full w-full basis-1/4 border-2 border-neutral-400 bg-white bg-gradient-to-r shadow transition",
									rarityBorder[item.rarity],
									outlet && !isActive && "opacity-50"
								)
							}
						>
							<Img
								className="pointer-events-none absolute bottom-0 right-0 aspect-video max-h-full scale-x-[-1]"
								src={item.previewImage}
								width="256"
							/>
							<div className="isolate flex min-h-full flex-col">
								<div
									className={classnames(
										"m-2 font-bold leading-none",
										rarityColor[item.rarity]
									)}
								>
									{item.displayName}
								</div>
								<span className="m-2 flex items-center font-heading font-bold leading-none">
									<ChevronDoubleUpIcon
										className="mr-0.5 h-4 w-4"
										aria-hidden="true"
									/>
									{item.itemLevel}
								</span>
								<div className="m-2 mt-auto flex items-center gap-2">
									{item.traits.map((trait) => (
										<Img
											className="h-10 w-10 rounded invert"
											key={trait.icon}
											alt={`Tier ${trait.rarity} ${trait.displayName}`}
											title={`Tier ${trait.rarity} ${trait.displayName}`}
											src={trait.icon}
											width="128"
										/>
									))}
								</div>
							</div>
						</NavLink>
					)
				})}
			</Link>
			<div className="w-52 p-4">
				<Form dir="col">
					<TextInput label="Search" name="name" />

					<FormGroup label="Item type">
						<Checkbox name="type" value="melee" label="Melee" />
						<Checkbox name="type" value="ranged" label="Ranged" />
					</FormGroup>

					<Select label="Blessing" name="blessing">
						<option value="">Any</option>
						{traits.map((trait) => (
							<option key={trait.baseName} value={trait.baseName}>
								{trait.displayName}
							</option>
						))}
					</Select>
				</Form>
			</div>
			<AnimatePresence initial={false}>{outlet}</AnimatePresence>
		</div>
	)
}
