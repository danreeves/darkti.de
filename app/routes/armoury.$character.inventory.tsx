import { useLoaderData, useParams } from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { z } from "zod"
import { zx } from "zodix"
import { Form } from "~/components/Form"
import { Img } from "~/components/Img"
import { getAuthToken } from "~/data/authtoken.server"
import { getItems } from "~/data/items.server"
import { BlessingSchema, WeaponSchema } from "~/data/schemas.server"
import { authenticator } from "~/services/auth.server"
import { getAccountGear } from "~/services/darktide.server"
import { getSearchParam } from "~/utils/getSearchParam"
import { cn } from "~/lib/utils"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { ChevronsUp } from "lucide-react"
import { titleCase } from "~/utils/titleCase"
import { Checkbox } from "~/components/ui/checkbox"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select"
import { uniqBy } from "lodash-es"

export async function loader({ request, params }: LoaderArgs) {
	let { character } = zx.parseParams(params, { character: z.string() })
	let url = new URL(request.url)
	let filterItemTypes = getSearchParam(url.searchParams, "type", [
		"melee",
		"ranged",
	])
	let searchName = url.searchParams.get("name") ?? ""
	let searchBlessing = url.searchParams.get("blessing") ?? ""

	if (searchBlessing === "any") {
		searchBlessing = ""
	}

	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})
	let auth = await getAuthToken(user.id)
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
					(wep) => wep.id === item.masterDataInstance.id,
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

							if (!baseName) return null

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
					: true),
		)

		let traits = uniqBy(
			characterGear.map((item) => item.traits).flat(),
			"baseName",
		)

		return json({ items, traits })
	}

	return json({ items: [], traits: [] })
}

let rarityBorder: Record<string, string> = {
	1: "border-l-foreground/75",
	2: "border-l-green-600",
	3: "border-l-blue-600",
	4: "border-l-purple-600",
	5: "border-l-orange-600",
}

let rarityColor: Record<string, string> = {
	1: "text-foreground/75",
	2: "text-green-800",
	3: "text-blue-800",
	4: "text-purple-800",
	5: "text-orange-800",
}

export default function Inventory() {
	let { items, traits } = useLoaderData<typeof loader>()
	let { character } = useParams()

	return (
		<div className="relative flex flex-col max-w-7xl mx-auto grow">
			<Form key={character} className="flex max-w-7xl flex-row gap-4 m-2">
				<div className="grid items-center gap-1.5">
					<Label htmlFor="name">Search</Label>
					<Input type="string" name="name" id="name" />
				</div>

				<div className="grid   items-center gap-1.5">
					<Label>Item type</Label>
					<div className="flex gap-4">
						{["melee", "ranged"].map((kind) => (
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
					<Label htmlFor="blessing">Trait</Label>
					<Select name="blessing" defaultValue="">
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Any" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="any">Any</SelectItem>
								{traits.map((trait) => (
									<SelectItem key={trait.baseName} value={trait.baseName}>
										{trait.displayName}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</Form>

			<div className="grid grid-cols-4 gap-4 mb-4 ">
				{items.map((item) => {
					return (
						<div
							key={item.id}
							className={cn(
								"rounded-lg border bg-card text-card-foreground shadow-sm relative",
								rarityBorder[item.rarity],
							)}
						>
							<Img
								className="pointer-events-none absolute bottom-0 right-0 aspect-video max-h-full scale-x-[-1]"
								src={item.previewImage}
								width="256"
							/>
							<div className="isolate flex min-h-full flex-col">
								<div
									className={cn(
										"m-2 font-bold leading-none",
										rarityColor[item.rarity],
									)}
								>
									{item.displayName}
								</div>
								<span className="m-2 flex items-center font-heading font-bold leading-none">
									<ChevronsUp className="mr-0.5 h-4 w-4" aria-hidden="true" />
									{item.itemLevel}
								</span>
								<div className="m-2 mt-auto flex items-center gap-2">
									{item.traits.map((trait) => (
										<Img
											className="h-10 w-10 rounded invert dark:invert-0"
											key={trait.icon}
											alt={`Tier ${trait.rarity} ${trait.displayName}`}
											title={`Tier ${trait.rarity} ${trait.displayName}`}
											src={trait.icon}
											width="128"
										/>
									))}
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
