import { useLoaderData } from "@remix-run/react"
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
	let user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	})

	let auth = await getAuthToken(user.id)

	if (auth) {
		let characterList = await getCharacters(auth)
    if(characterList === undefined) {
      redirect("/armoury")    
      return json({ offers:[] })
    }
		let currentCharacter =
			characterList.characters[
				characterList.characters.findIndex((c) => c.id == character)
			]
		let currentShop = await getCharacterStore(
			auth,
			currentCharacter.archetype,
			currentCharacter.id
		)
		const weapons = await getItems(WeaponSchema)
    const traits = await getItems(PerkSchema)
    if(!currentShop) return json({ offers: []})
		
    let offers = Object.entries(currentShop)
			.map(([id, item]) => {
				let weapon = weapons.find((wep) => wep.id === item?.description.id)
				if (!weapon) return undefined
        if (!item) return undefined
        if(item.description.overrides.perks){
          item.description.overrides.perks.forEach(perk => {
            let trait = traits.find((trait) => trait.id === perk.id)
            if(trait && trait.description && trait.description_values){
              let values = trait.description_values.filter((value) => +value.rarity === perk.rarity)
              let replacement : {[key : string]: string} = {}
              values.map((value) => replacement["{" + value.string_key + ":%s}"] = value.string_value)
              perk.id =  replaceAll(trait.description, replacement)
            }
          })
        }
				return {
					id,
					item,
					weapon,
				}
			})
			.filter(Boolean)
		return json({ offers: offers })
    }
	return json({ offers: []})
}

let rarityBorder: Record<string, string> = {
	1: "border-l-neutral-600",
	2: "border-l-green-600",
	3: "border-l-blue-600",
	4: "border-l-purple-600",
	5: "border-l-orange-600",
}

export default function Exchange() {
	let { offers } = useLoaderData<typeof loader>()
	return (
		<div className="grid w-full grow grid-cols-4 gap-4 bg-neutral-200 p-4 shadow-inner">
			{offers.map((offer) => (
				<div
					key={offer.id}
					className={classnames(
						"border-l-3 relative border-2 border-neutral-400 bg-white p-4 shadow",
						rarityBorder[String(offer.item.description.overrides.rarity) ?? "0"]
					)}
				>
					<div>{offer.weapon.display_name}</div>
					<div className="">
						<div>Rating</div>
						<span>{offer.item.description.overrides.itemLevel}</span>
					</div>
					<div className="">
						<div>Base Rating</div>
						<span>{offer.item.description.overrides.baseItemLevel}</span>
					</div>
					<div>
						<div>{offer.item.price.amount.type}</div>
						<span style={{ color: "gold" }}>
							{offer.item.price.amount.amount}
						</span>
					</div>
					{offer.item.description.overrides.perks && offer.item.description.overrides.perks.length > 0 ? (
						<div>
							<div>Perks</div>
							{offer.item.description.overrides.perks.map((perk) => (
								<div key={perk.id}>{perk.id}</div>
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
	)
}
