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
import { PerkSchema, WeaponSchema } from "~/data/schemas.server"
import { replaceAll } from "~/data/utils.server"
import { authenticator } from "~/services/auth.server"
import { getCharacters, getCharacterStore } from "~/services/darktide.server"
import { classnames } from "~/utils/classnames"

export let handle = "exchange"

export async function loader({ request, params }: LoaderArgs) {
	const { character } = zx.parseParams(params, { character: z.string() })
	const emptyResult = { offers: [], wallet: null }
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
			const weapons = await getItems(WeaponSchema)
			const traits = await getItems(PerkSchema)
			if (!currentShop) return json({ offers: [] })

			let offers = Object.entries(currentShop)
				.map(([id, item]) => {
					let weapon = weapons.find((wep) => wep.id === item?.description.id)
					if (!weapon) return undefined
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
					let rarity = item.description.overrides.rarity
					return {
						id,
						item,
						rarity,
						weapon,
					}
				})
				.filter(Boolean)
			return json({ offers: offers, wallet: null })
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
	let { offers } = useLoaderData<typeof loader>()
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
						<div
							className={classnames(
								"m-2 font-bold leading-none",
								rarityColor[offer.rarity]
							)}
						>
							{offer.weapon.display_name}
						</div>
						<div className="">
							<span className="m-2 flex items-center font-bold leading-none">
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
								{offer.item.price.amount.amount}
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
							src={`https://img.darkti.de/pngs/${offer.weapon.preview_image}.png`}
						/>
					</div>
				))}
			</div>
			<div className="p-4">
				<Form dir="col">
					<TextInput label="Search" name="name" />

					<FormGroup label="Item type">
						<Checkbox name="type" value="melee" label="Melee" />
						<Checkbox name="type" value="ranged" label="Ranged" />
					</FormGroup>

					<Select label="Blessing" name="blessing">
						<option value="TotalRating">Total Raing</option>
						<option value="Base Rating">Base Rating</option>
						<option value="Price">Price</option>
					</Select>
				</Form>
			</div>
		</>
	)
}
