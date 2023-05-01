import { Checkbox, Form, FormGroup, Select } from "~/components/Form"
import {
	Form as RemixForm,
	useActionData,
	useLoaderData,
	useNavigation,
} from "@remix-run/react"
import {
	ChevronDoubleUpIcon,
	CircleStackIcon,
} from "@heroicons/react/24/outline"
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime"
import { redirect } from "@remix-run/server-runtime"
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
	getAccountSummary,
	getCharacterStore,
	getCharacterWallet,
	purchaseItem,
} from "~/services/darktide.server"
import { classnames } from "~/utils/classnames"
import { getSearchParam } from "~/utils/getSearchParam"
import { Img } from "~/components/Img"
import { t } from "~/data/localization.server"
import { getWeaponTemplate } from "~/data/weaponTemplates.server"

export let handle = "exchange"

export async function action({ params, request }: ActionArgs) {
	let { character: characterId } = zx.parseParams(params, {
		character: z.string(),
	})
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	let auth = await getAuthToken(user.id)
	if (!auth) return json({ error: "No auth" })

	let accountSummary = await getAccountSummary(auth)
	if (!accountSummary) {
		return json({ error: "Couldn't fetch account" })
	}
	let currentCharacter = accountSummary.summary.characters.find(
		(c) => c.id == characterId
	)
	if (!currentCharacter) {
		return json({ error: "Couldn't find current character" })
	}

	let store = await getCharacterStore(
		auth,
		currentCharacter.archetype,
		currentCharacter.id
	)
	if (!store) {
		return json({ error: "Couldn't fetch store" })
	}

	let wallet = await getCharacterWallet(auth, currentCharacter.id)
	if (!wallet) {
		return json({ error: "Couldn't fetch wallet" })
	}

	let formData = await request.formData()
	let itemId = formData.get("buy-item")?.toString()

	let offer = store.personal.find((offer) => offer?.offerId === itemId)
	if (!offer) {
		return json({ error: "Couldn't find offer" })
	}

	let result = await purchaseItem(auth, {
		catalogId: store.catalog.id,
		storeName: store.name,
		characterId: currentCharacter.id,
		lastTransactionId: (wallet.credits?.lastTransactionId ?? 0) + 1,
		offerId: offer.offerId,
		ownedSkus: [],
	})

	return json({ result })
}

let sort = function (a: number, b: number) {
	if (a > b) return -1
	if (a < b) return 1
	return 0
}

let EMPTY_RESULT = { offers: [], wallet: undefined }

export async function loader({ request, params }: LoaderArgs) {
	let { character } = zx.parseParams(params, { character: z.string() })
	let url = new URL(request.url)
	let filterItemTypes = getSearchParam(url.searchParams, "type", [
		"melee",
		"ranged",
		"gadget",
	])
	let sortBy = url.searchParams.get("sort") ?? "baseItemLevel"

	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})
	let auth = await getAuthToken(user.id)

	if (auth) {
		let accountSummary = await getAccountSummary(auth)
		if (!accountSummary) {
			redirect("/armoury")
			return json(EMPTY_RESULT)
		}
		let currentCharacter = accountSummary.summary.characters.find(
			(c) => c.id == character
		)
		if (!currentCharacter) {
			redirect("/armoury")
			return json(EMPTY_RESULT)
		}

		let [currentShop, weapons, curios, allPerks, allBlessings, wallet] =
			await Promise.all([
				getCharacterStore(
					auth,
					currentCharacter.archetype,
					currentCharacter.id
				),
				getItems(WeaponSchema),
				getItems(CurioSchema),
				getItems(PerkSchema),
				getItems(BlessingSchema),
				getCharacterWallet(auth, currentCharacter.id),
			])

		if (!currentShop) {
			return json(EMPTY_RESULT)
		}

		let offers = currentShop.personal
			.map((item) => {
				let weapon = weapons.find((wep) => wep.id === item?.description.id)
				let curio = curios.find((cur) => cur.id === item?.description.id)
				let shopItem = weapon || curio

				if (!weapon && !curio) return undefined
				if (!item) return undefined
				if (!shopItem) return undefined

				let perks =
					item.description.overrides?.perks
						?.map((perk) => {
							let trait = allPerks.find((trait) => trait.id === perk.id)

							if (!trait) {
								return undefined
							}

							let description = "<No description>"
							if (trait.description && trait.description_values) {
								let values = trait.description_values.filter(
									(value) => +value.rarity === perk.rarity
								)
								let replacement: { [key: string]: string } = {}
								values.forEach(
									(value) =>
										(replacement["{" + value.string_key + ":%s}"] =
											value.string_value)
								)
								description = replaceAll(trait.description, replacement)
							} else if (trait.description) {
								description = trait.description
							}
							return {
								id: perk.id,
								rarity: perk.rarity,
								description,
							}
						})
						.filter(Boolean) ?? []

				let traits =
					item.description.overrides?.traits
						?.map((t) => {
							let blessing = allBlessings.find((b) => b.id === t.id)
							if (!blessing) return undefined
							let [baseName] = t.id.match(/\w+$/) ?? []

							let description = "<No description>"
							if (blessing.description && blessing.description_values) {
								let values = blessing.description_values.filter(
									(value) => +value.rarity === t.rarity
								)
								let replacement: { [key: string]: string } = {}
								values.forEach(
									(value) =>
										(replacement["{" + value.string_key + ":%s}"] =
											value.string_value)
								)
								description = replaceAll(blessing.description, replacement)
							} else if (blessing.description) {
								description = blessing.description
							}
							return {
								baseName,
								rarity: t.rarity,
								displayName: blessing.display_name,
								icon: `${blessing.icon}.png`,
								description,
							}
						})
						.filter(Boolean) ?? []
				let rarity = item.description.overrides.rarity

				let weaponTemplate = getWeaponTemplate(weapon?.baseName ?? "unknown")
				let baseStats = (item.description.overrides?.base_stats ?? [])
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

				return {
					id: item.offerId,
					displayName: shopItem.display_name,
					itemType: shopItem.item_type,
					traits,
					perks,
					rarity,
					itemLevel: item.description.overrides.itemLevel,
					baseItemLevel: item.description.overrides.baseItemLevel,
					price: item.price,
					previewImage: shopItem.preview_image + ".png",
					baseStats,
					purchased: item.state === "completed",
					// TODO: where to get level from? chrome extension uses /web/:sub/summary
					// equippableAt: item.description.overrides.characterLevel,
					// canEquip:
					// 	item.description.overrides.characterLevel <=
					// 	currentCharacter.level,
				}
			})
			.filter(Boolean)

		let filteredOffers = offers
			.filter((item) => item && filterItemTypes.includes(item.itemType))
			.sort((itemA, itemB) => {
				let sortTypes: Record<
					string,
					(a: typeof itemA, b: typeof itemB) => number
				> = {
					baseItemLevel: (a, b) => sort(a.baseItemLevel, b.baseItemLevel),
					itemLevel: (a, b) => sort(a.itemLevel, b.itemLevel),
					price: (a, b) => sort(a.price.amount.amount, b.price.amount.amount),
				}

				if (sortBy && sortBy in sortTypes) {
					return sortTypes[sortBy](itemA, itemB)
				}
				return 0
			})
		return json({ offers: filteredOffers, wallet })
	}

	return json(EMPTY_RESULT)
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

export const raritySymbol = ["0", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"]

export default function Exchange() {
	let navigation = useNavigation()
	let { offers, wallet } = useLoaderData<typeof loader>()

	return (
		<>
			<RemixForm
				method="post"
				className="grid w-full grow grid-cols-2 gap-4 overflow-y-scroll bg-neutral-200 p-4 shadow-inner"
			>
				{offers.map((offer) => (
					<div
						key={offer.id}
						className={classnames(
							"border-l-3 from-1% relative border-2 border-neutral-400 bg-white bg-gradient-to-r shadow",
							rarityBorder[offer.rarity],
							offer.purchased && "opacity-50"
						)}
					>
						<Img
							className="pointer-events-none absolute bottom-0 right-0 max-h-full scale-x-[-1]"
							src={offer.previewImage}
							width="256"
						/>
						<div className="isolate flex min-h-full flex-col">
							<div className="m-2 flex flex-row font-heading">
								<div className="mr-1 flex items-center font-heading font-bold ">
									<ChevronDoubleUpIcon
										className="mr-0.5 h-4 w-4"
										aria-hidden="true"
									/>
									{offer.itemLevel}
								</div>
								<div
									className={classnames(
										"font-bold ",
										rarityColor[offer.rarity]
									)}
								>
									{offer.displayName}
								</div>
							</div>

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
							<div className="relative m-2 mt-0">
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
									{offer.baseItemLevel}
								</span>
								<div
									data-section="base-stats"
									className="grid grid-cols-3 grid-rows-2 gap-2"
								>
									{offer.baseStats.map((stat) => {
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

							{offer.perks.length > 0 ? (
								<div className="m-2">
									<div className="font-heading font-bold">Perks</div>
									{offer.perks.map((perk) => (
										<div key={perk.id} className="flex items-center">
											<div className="mr-2">{raritySymbol[perk.rarity]}</div>
											{perk.description}
										</div>
									))}
								</div>
							) : null}

							{offer.traits.length > 0 ? (
								<div className="m-2">
									<div className="font-heading font-bold">Blessings</div>
									<div className="flex w-2/3 items-center gap-2">
										{offer.traits.map((blessing) => (
											<div
												key={blessing.icon}
												className="flex flex-row items-center"
											>
												<div className="relative flex aspect-square w-16 shrink-0 flex-row items-center">
													<Img
														className="aspect-square rounded invert"
														alt={`Tier ${blessing.rarity} ${blessing.displayName}`}
														title={`Tier ${blessing.rarity} ${blessing.displayName}`}
														src={blessing.icon}
														width="128"
													/>
													<div
														aria-hidden
														className="absolute left-0 top-0 text-center leading-none"
													>
														{raritySymbol[blessing.rarity]}
													</div>
												</div>
												<div className="flex flex-col">
													<div className="font-bold">
														{blessing.displayName}
													</div>
													<div>{blessing.description}</div>
												</div>
											</div>
										))}
									</div>
								</div>
							) : null}

							<div className="mt-auto">
								<button
									type="submit"
									name="buy-item"
									value={offer.id}
									disabled={navigation.state != "idle" || offer.purchased}
									className={classnames(
										"m-2 flex inline-flex shrink cursor-pointer flex-row items-center items-center gap-2 rounded border bg-white p-2 font-bold leading-none text-amber-500 shadow hover:bg-neutral-50 disabled:cursor-not-allowed disabled:bg-neutral-200",
										offer.purchased && "text-neutral-400"
									)}
								>
									<CircleStackIcon className="h-4 w-4" aria-hidden="true" />
									{offer.purchased
										? "Purchased"
										: `Buy for ${offer.price.amount.amount.toLocaleString()} ${
												offer.price.amount.type
										  }`}
								</button>
							</div>
						</div>
					</div>
				))}
			</RemixForm>

			<div className="p-4">
				{wallet && wallet.credits && wallet.credits.balance ? (
					<div className="mb-4 flex items-center font-bold leading-none text-amber-500">
						<CircleStackIcon className="mr-1 h-4 w-4" aria-hidden="true" />
						{wallet.credits.balance.amount.toLocaleString()}{" "}
						{wallet.credits.balance.type}
					</div>
				) : null}

				<Form dir="col">
					<FormGroup label="Filter Type">
						<Checkbox name="type" value="melee" label="Melee" />
						<Checkbox name="type" value="ranged" label="Ranged" />
						<Checkbox name="type" value="gadget" label="Curio" />
					</FormGroup>

					<Select label="Sort by" name="sort" className="w-full">
						<option value="baseItemLevel">Base Rating</option>
						<option value="itemLevel">Total Rating</option>
						<option value="price">Price</option>
					</Select>
				</Form>
			</div>
		</>
	)
}
