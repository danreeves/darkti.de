import { Form } from "~/components/Form"
import {
	Form as RemixForm,
	useLoaderData,
	useNavigation,
} from "@remix-run/react"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { redirect, json } from "@remix-run/node"
import { z } from "zod"
import { zx } from "zodix"
import { getAuthToken } from "~/services/db/authtoken.server"
import { getItems } from "~/data/items.server"
import { CurioSchema, TraitSchema, WeaponSchema } from "~/data/schemas.server"
import { replaceAll } from "~/data/utils.server"
import { authenticator } from "~/services/auth.server"
import {
	getAccountSummary,
	getCharacterStore,
	getAccountWallet,
	purchaseItem,
} from "~/services/darktide.server"
import { getSearchParam } from "~/utils/getSearchParam"
import { Img } from "~/components/Img"
import { t } from "~/data/localization.server"
import { getWeaponTemplate } from "~/data/weaponTemplates.server"
import { twMerge } from "tailwind-merge"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select"
import { SelectGroup } from "@radix-ui/react-select"
import { titleCase } from "~/utils/titleCase"
import { ChevronsUp, Database } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/utils/cn"
import useLocale from "~/hooks/locale"

let storeSlugToType: Record<string, "credits" | "marks"> = {
	exchange: "credits",
	requisitorium: "marks",
}

export async function action({ params, request }: ActionArgs) {
	let { character: characterId, store: storeSlug } = zx.parseParams(params, {
		character: z.string(),
		store: z.string(),
	})

	let storeType = storeSlugToType[storeSlug]
	if (!storeType) {
		return json({ error: "Invalid store type" })
	}

	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	let auth = await getAuthToken(user.id)

	let accountSummary = await getAccountSummary(auth)
	if (!accountSummary) {
		return json({ error: "Couldn't fetch account" })
	}

	let currentCharacter = accountSummary.summary.characters.find(
		(c) => c.id == characterId,
	)
	if (!currentCharacter) {
		return json({ error: "Couldn't find current character" })
	}

	let store = await getCharacterStore(
		auth,
		currentCharacter.archetype,
		currentCharacter.id,
		storeType,
	)
	if (!store) {
		return json({ error: "Couldn't fetch store" })
	}

	let wallet = await getAccountWallet(auth)
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
		lastTransactionId: (wallet[storeType]?.lastTransactionId ?? 0) + 1,
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
	let { character, store } = zx.parseParams(params, {
		character: z.string(),
		store: z.string(),
	})

	let storeType = storeSlugToType[store]
	if (!storeType) {
		return json(EMPTY_RESULT)
	}

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

	let accountSummary = await getAccountSummary(auth)
	if (!accountSummary) {
		redirect("/armoury")
		return json(EMPTY_RESULT)
	}
	let currentCharacter = accountSummary.summary.characters.find(
		(c) => c.id == character,
	)
	if (!currentCharacter) {
		redirect("/armoury")
		return json(EMPTY_RESULT)
	}

	let [currentShop, weapons, curios, allTraits, wallet] = await Promise.all([
		getCharacterStore(
			auth,
			currentCharacter.archetype,
			currentCharacter.id,
			storeType,
		),
		getItems(WeaponSchema),
		getItems(CurioSchema),
		getItems(TraitSchema),
		getAccountWallet(auth),
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

			let itemPerks = item.description.overrides?.perks
			let itemTraits = item.description.overrides?.traits

			let perks =
				itemPerks
					?.map((perk) => {
						let trait = allTraits.find((trait) => trait.id === perk.id)

						if (!trait) {
							return undefined
						}

						let description = "<No description>"
						if (trait.description && trait.description_values) {
							let values = trait.description_values.filter(
								(value) => +value.rarity === perk.rarity,
							)
							let replacement: { [key: string]: string } = {}
							values.forEach(
								(value) =>
									(replacement["{" + value.string_key + ":%s}"] =
										value.string_value),
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
				itemTraits
					?.map((t) => {
						let blessing = allTraits.find((b) => b.id === t.id)
						if (!blessing) return undefined
						let [baseName] = t.id.match(/\w+$/) ?? []

						let description = "<No description>"
						if (blessing.description && blessing.description_values) {
							let values = blessing.description_values.filter(
								(value) => +value.rarity === t.rarity,
							)
							let replacement: { [key: string]: string } = {}
							values.forEach(
								(value) =>
									(replacement["{" + value.string_key + ":%s}"] =
										value.string_value),
							)
							description = replaceAll(blessing.description, replacement)
						} else if (blessing.description) {
							description = blessing.description
						}
						return {
							baseName,
							rarity: t.rarity,
							displayName: blessing.display_name,
							icon: blessing.icon ? `${blessing.icon}.png` : null,
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
				return sortTypes[sortBy]!(itemA, itemB)
			}
			return 0
		})
	return json({
		offers: filteredOffers,
		wallet: wallet ? wallet[storeType] : null,
	})
}

let rarityBorder: Record<string, string> = {
	1: "border-l-foreground/60",
	2: "border-l-green-600",
	3: "border-l-blue-600",
	4: "border-l-purple-600",
	5: "border-l-orange-600",
}

let rarityColor: Record<string, string> = {
	1: "text-foreground/60",
	2: "text-green-800",
	3: "text-blue-800",
	4: "text-purple-800",
	5: "text-orange-800",
}

const raritySymbol = ["0", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"]

export default function Exchange() {
	let navigation = useNavigation()
	let locale = useLocale()
	let { offers, wallet } = useLoaderData<typeof loader>()

	return (
		<div className="relative flex flex-col max-w-7xl mx-auto grow">
			<Form className="flex max-w-7xl flex-row gap-4 m-2">
				<div className="grid items-center gap-1.5">
					<Label>Item type</Label>
					<div className="flex gap-4">
						{["melee", "ranged", "gadget"].map((kind) => (
							<div key={kind} className="flex items-center space-x-2 h-10">
								<Checkbox id={kind} name="type" value={kind} />
								<label
									htmlFor={kind}
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{titleCase(kind)}
								</label>
							</div>
						))}
					</div>
				</div>

				<div className="grid items-center gap-1.5">
					<Label htmlFor="sort">Sort by</Label>
					<Select name="sort" defaultValue="baseItemLevel">
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Base Rating" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="baseItemLevel">Base Rating</SelectItem>
								<SelectItem value="itemLevel">Total Rating</SelectItem>
								<SelectItem value="price">Price</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				{wallet && wallet.balance ? (
					<div className="flex h-full place-items-start ml-auto text-sm font-medium leading-none mb-4 text-amber-500">
						<div className="flex items-center">
							<Database className="mr-1 h-4 w-4" aria-hidden="true" />
							{wallet.balance.amount.toLocaleString(locale)}{" "}
							{wallet.balance.type}
						</div>
					</div>
				) : null}
			</Form>

			<RemixForm
				method="post"
				className="grid w-full grow grid-cols-2 gap-4 mb-4"
			>
				{offers.map((offer) => (
					<div
						key={offer.id}
						className={twMerge(
							"rounded-lg border bg-card text-card-foreground shadow-sm relative",
							rarityBorder[offer.rarity],
							offer.purchased && "opacity-50",
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
									<ChevronsUp className="mr-0.5 h-4 w-4" aria-hidden="true" />
									{offer.itemLevel}
								</div>
								<div
									className={twMerge("font-bold ", rarityColor[offer.rarity])}
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
										"absolute right-0 top-0 flex items-center font-heading text-sm font-bold"
									}
									title="Base item level"
								>
									<ChevronsUp className="mr-0.5 h-3 w-3" aria-hidden="true" />
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
															className="z-2 absolute left-0 top-0 h-full border border-background bg-amber-400"
														/>
														<div className="z-1 isolate m-px mx-1 font-heading text-xs leading-none text-background">
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
													{blessing.icon ? (
														<Img
															className="aspect-square rounded invert dark:invert-0"
															alt={`Tier ${blessing.rarity} ${blessing.displayName}`}
															title={`Tier ${blessing.rarity} ${blessing.displayName}`}
															src={blessing.icon}
															width="128"
														/>
													) : null}
													<div
														aria-hidden
														className={twMerge(
															"text-center leading-none",
															!blessing.icon && "w-[128px]",
															blessing.icon && "absolute left-0 top-0",
														)}
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
								<Button
									type="submit"
									name="buy-item"
									value={offer.id}
									disabled={navigation.state != "idle" || offer.purchased}
									className="m-2 gap-2"
								>
									<Database className="h-4 w-4" aria-hidden="true" />
									{offer.purchased
										? "Purchased"
										: `Buy for ${offer.price.amount.amount.toLocaleString(
												locale,
										  )} ${offer.price.amount.type}`}
								</Button>
							</div>
						</div>
					</div>
				))}
			</RemixForm>
		</div>
	)
}
