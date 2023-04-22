import { Checkbox, Form, FormGroup, Select, TextInput } from "~/components/Form"
import { useLoaderData } from "@remix-run/react"
import {
	ChevronDoubleUpIcon,
	CircleStackIcon,
	Square3Stack3DIcon,
} from "@heroicons/react/24/outline"
import { LoaderArgs, redirect } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { z } from "zod"
import { zx } from "zodix"
import { getAuthToken } from "~/data/authtoken.server"
import { getItems } from "~/data/items.server"
import {
	BlessingSchema,
	CurioSchema,
	PerkSchema,
	WeaponSchema,
} from "~/data/schemas.server"
import { replaceAll } from "~/data/utils.server"
import { authenticator } from "~/services/auth.server"
import {
	getCharacters,
	getCharacterStore,
	getCharacterWallet,
} from "~/services/darktide.server"
import { classnames } from "~/utils/classnames"
import { getSearchParam } from "~/utils/getSearchParam"

export let handle = "exchange"

let sort = function (a: number, b: number) {
	if (a > b) return -1
	if (a < b) return 1
	return 0
}

export async function loader({ request, params }: LoaderArgs) {
	const { character } = zx.parseParams(params, { character: z.string() })
	const emptyResult = { offers: [], wallet: undefined }
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	let auth = await getAuthToken(user.id)

	if (auth) {
		let characterList = await getCharacters(auth)
		if (characterList === undefined) {
			redirect("/armoury")
			return json(emptyResult)
		}
		let currentCharacter = characterList.characters.find(
			(c) => c.id == character
		)
		if (currentCharacter) {
			let currentShop = await getCharacterStore(
				auth,
				currentCharacter.archetype,
				currentCharacter.id
			)
			let url = new URL(request.url)
			let filterItemTypes = getSearchParam(url.searchParams, "type", [
				"melee",
				"ranged",
				"gadget",
			])
			let sortBy = getSearchParam(url.searchParams, "sort", "total rating")
			const weapons = await getItems(WeaponSchema)
			const curios = await getItems(CurioSchema)
			const traits = await getItems(PerkSchema)
			const blessings = await getItems(BlessingSchema)
			let wallet = await getCharacterWallet(auth, currentCharacter.id)

			if (!currentShop) return json(emptyResult)

			let offers = Object.entries(currentShop)
				.map(([id, item]) => {
					let weapon = weapons.find((wep) => wep.id === item?.description.id)
					let curio = curios.find((cur) => cur.id === item?.description.id)
					if (!weapon && !curio) return undefined
					if (!item) return undefined
					if (item.description.overrides.perks) {
						item.description.overrides.perks.forEach((perk) => {
							let trait = traits.find((trait) => trait.id === perk.id)
							if (trait && trait.description && trait.description_values) {
								let values = trait.description_values.filter(
									(value) => +value.rarity === perk.rarity
								)
								let replacement: { [key: string]: string } = {}
								values.map(
									(value) =>
										(replacement["{" + value.string_key + ":%s}"] =
											value.string_value)
								)
								perk.id = replaceAll(trait.description, replacement)
							}
						})
					}
					let blessing =
						item.description.overrides?.traits
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
					let rarity = item.description.overrides.rarity
					let shopitem = weapon || curio
					if (!shopitem) return undefined
					return {
						id,
						item,
						blessing,
						rarity,
						shopitem,
					}
				})
				.filter(Boolean)
			offers = offers
				.filter(
					(item) =>
						item &&
						item.shopitem &&
						filterItemTypes.includes(item.shopitem.item_type)
				)
				.sort((a, b) => {
					if (sortBy[0] === "Total Rating") {
						return sort(
							a.item.description.overrides.itemLevel,
							b.item.description.overrides.itemLevel
						)
					} else if (sortBy[0] === "Base Rating") {
						return sort(
							a.item.description.overrides.baseItemLevel,
							b.item.description.overrides.baseItemLevel
						)
					} else if (sortBy[0] === "Price") {
						return sort(a.item.price.amount.amount, b.item.price.amount.amount)
					}
					return 0
				})
			return json({ offers, wallet })
		}
	}
	return json(emptyResult)
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
export default function Exchange() {
	let { offers, wallet } = useLoaderData<typeof loader>()
	return (
		<>
			<div className="grid w-full grow grid-cols-2 gap-4 bg-neutral-200 p-4 shadow-inner">
				{offers.map((offer) => (
					<div
						key={offer.id}
						className={classnames(
							"border-l-3 from-1% relative border-2 border-neutral-400 bg-white bg-gradient-to-r shadow",
							rarityBorder[String(offer.rarity) ?? "0"]
						)}
					>
						<div className="flex justify-between">
							<div
								className={classnames(
									"m-2 font-bold leading-none",
									rarityColor[offer.rarity]
								)}
							>
								{offer.shopitem.display_name}
							</div>
							{offer.item.state === "completed" ? (
								<div className="z-40 bg-cyan-900 p-2">
									<p className="font-bold text-white">Purchased</p>
								</div>
							) : null}
						</div>
						<div className="">
							<span className="m-2 flex items-center font-heading font-bold leading-none">
								<ChevronDoubleUpIcon
									className="mr-0.5 h-4 w-4"
									aria-hidden="true"
								/>
								<span
									className={classnames(
										"m-2 font-bold leading-none",
										rarityColor[offer.rarity]
									)}
								>
									{offer.item.description.overrides.itemLevel}
								</span>
								[{offer.item.description.overrides.baseItemLevel}]
							</span>
						</div>
						<div>
							<div className="m-2 flex items-center font-bold leading-none text-amber-500">
								<CircleStackIcon
									className="mr-0.5 h-4 w-4"
									aria-hidden="true"
								/>
								{offer.item.price.amount.amount.toLocaleString()}
							</div>
						</div>
						{offer.item.description.overrides.perks &&
						offer.item.description.overrides.perks.length > 0 ? (
							<div>
								{offer.item.description.overrides.perks.map((perk) => (
									<div key={perk.id} className="m-2 flex items-center">
										<Square3Stack3DIcon className="mr-0.5 h-4 w-4" />
										{perk.id}
									</div>
								))}
								<span></span>
							</div>
						) : null}

						<img
							alt=""
							loading="lazy"
							className="max-w-1/2 pointer-events-none absolute right-0 top-0 h-full"
							src={`https://img.darkti.de/pngs/${offer.shopitem.preview_image}.png`}
						/>
					</div>
				))}
			</div>
			<div className="p-4">
				{wallet && wallet.credits && wallet.credits.balance ? (
					<div className="m-2 flex items-center font-bold leading-none text-amber-500">
						Wallet:{" "}
						<CircleStackIcon className="mr-0.5 h-4 w-4" aria-hidden="true" />
						{wallet.credits.balance.amount.toLocaleString()}
					</div>
				) : null}
				<Form dir="col">
					<FormGroup label="Filter Type">
						<Checkbox name="type" value="melee" label="Melee" />
						<Checkbox name="type" value="ranged" label="Ranged" />
						<Checkbox name="type" value="gadget" label="Curio" />
					</FormGroup>

					<Select label="Sort by" name="sort">
						<option value="Total Rating">Total Rating</option>
						<option value="Base Rating">Base Rating</option>
						<option value="Price">Price</option>
					</Select>
				</Form>
			</div>
		</>
	)
}
