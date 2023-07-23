import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { Tabs, TabList, Tab, TabPanel } from "react-aria-components"
import { json } from "@remix-run/node"
import { useLoaderData, useNavigation, Form } from "@remix-run/react"
import { getAuthToken } from "~/data/authtoken.server"
import { getItems } from "~/data/items.server"
import { BlessingSchema, WeaponSchema } from "~/data/schemas.server"
import { authenticator } from "~/services/auth.server"
import { getAccountTrait } from "~/services/darktide.server"
import {
	getUserOwnedTraits,
	setUserOwnedTraits,
} from "~/data/ownedTraits.server"
import { getWeaponTemplates } from "~/data/weaponTemplates.server"
import type { AuthToken } from "@prisma/client"
import { ArrowPathIcon } from "@heroicons/react/24/outline"
import { Img } from "~/components/Img"
import { classnames } from "~/utils/classnames"

async function getTraitsForPattern(auth: AuthToken, pattern: string) {
	let traitCategory = `bespoke_${pattern}`
	let stickerbook = await getAccountTrait(auth, traitCategory)
	if (!stickerbook) {
		return
	}
	return {
		weapon: pattern,
		traits: stickerbook,
	}
}

export let action = async ({ request }: ActionArgs) => {
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})
	let auth = await getAuthToken(user.id)
	let weaponTemplates = getWeaponTemplates()
	let weaponPatterns = Array.from(
		new Set(
			weaponTemplates.map((template) => template.name.replace(/_\w\d$/, ""))
		)
	)
	let ownedTraits = await Promise.all(
		weaponPatterns.map((pattern) => getTraitsForPattern(auth, pattern))
	)
	await setUserOwnedTraits(user.id, ownedTraits.filter(Boolean))
	return json({ ok: true })
}

export let loader = async ({ request }: LoaderArgs) => {
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})
	let ownedTraits = await getUserOwnedTraits(user.id)
	let allWeapons = await getItems(WeaponSchema)
	const allBlessings = await getItems(BlessingSchema)

	if (!ownedTraits) {
		return json({ lastUpdated: null, patterns: null })
	}

	let transformedTraits = ownedTraits.traits.map((weaponPattern) => {
		let weapons = allWeapons.filter((weapon) =>
			weapon.baseName.includes(weaponPattern.weapon)
		)
		let displayName = weapons.map((weapon) => weapon.display_name).join(", ")
		let tiers = [[], [], [], []]

		for (let trait of weaponPattern.traits) {
			let blessingTemplate = allBlessings.find(
				(blessing) => blessing.id === trait.name
			)
			if (!blessingTemplate) {
				continue
			}
			for (let i = 0; i <= trait.tiers.length - 1; i++) {
				let tier = trait.tiers[i]
				if (tier !== "INVALID") {
					tiers[i].push({
						id: trait.name,
						icon: `${blessingTemplate.icon}.png`,
						name: blessingTemplate.display_name,
						description: blessingTemplate.description,
						owned: tier === "OWNED",
					})
				}
			}
		}

		return {
			displayName,
			tiers,
		}
	})

	return json({
		lastUpdated: ownedTraits.lastUpdated,
		patterns: transformedTraits,
	})
}

function LoadingSpinner({ loading }: { loading: boolean }) {
	if (!loading) return null
	return <ArrowPathIcon className="h-3 w-3 animate-spin " />
}

const raritySymbol = ["0", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"]

export default function Traits() {
	let navigation = useNavigation()
	let data = useLoaderData<typeof loader>()

	return (
		<>
			<h1 className="sr-only">Trait Collection</h1>
			<div className="mx-6 flex flex-row items-center justify-between">
				<p>Last refresh: {data.lastUpdated ?? "—"}</p>
				<Form method="post">
					<button
						type="submit"
						name="refresh"
						disabled={navigation.state != "idle"}
						className="m-2 flex cursor-pointer items-center gap-2 rounded border bg-white p-2 font-bold leading-none text-neutral-800 shadow hover:bg-neutral-50 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
					>
						<LoadingSpinner loading={navigation.state != "idle"} />
						Refresh
					</button>
				</Form>
			</div>
			<div className="overflow-y-scroll bg-neutral-200 p-4 shadow-inner">
				{data.patterns?.map((pattern) => (
					<div key={pattern.displayName}>
						<h2 className="font-heading">{pattern.displayName}</h2>
						<Tabs>
							<TabList
								aria-label="Tiers"
								className="mb-1 flex flex-row"
								defaultSelectedKey={"3"}
							>
								{pattern.tiers.map((_, i) => (
									<Tab
										key={i}
										id={i.toString()}
										className="block w-6 cursor-pointer border-b-2 text-center aria-selected:border-neutral-400"
									>
										{raritySymbol[i + 1]}
									</Tab>
								))}
							</TabList>
								{pattern.tiers.map((tier, i) => {
									return (
										<TabPanel key={i} id={i.toString()}>
											<h3 className="sr-only mb-2">{raritySymbol[i + 1]}</h3>
											<div className="mb-4 grid grid-cols-3 gap-2">
												{tier.map((blessing) => (
													<div
														key={blessing.id}
														className={classnames(
															"rounded bg-neutral-800 bg-white p-2 shadow",
															blessing.owned ? "" : "opacity-40"
														)}
													>
														<div className="font-bold">{blessing.name}</div>
														<div className="flex items-center">
															<Img
																className="invert"
																src={blessing.icon}
																width="256"
															/>
															<p>{blessing.description}</p>
														</div>
													</div>
												))}
											</div>
										</TabPanel>
									)
								})}
						</Tabs>
					</div>
				))}
			</div>
		</>
	)
}
