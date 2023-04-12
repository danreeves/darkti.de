import { useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { z } from "zod"
import { zx } from "zodix"
import { getAuthToken } from "~/data/authtoken.server"
import { getItems } from "~/data/items.server"
import { WeaponSchema } from "~/data/schemas.server"
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
      let characterGear = Object.entries(gear)
        .map(([id, item]) => {
          let weapon = weapons.find(
            (wep) => wep.id === item.masterDataInstance.id
          )
          if (!weapon) return undefined
          return {
            id,
            item,
            weapon,
          }
        })
        .filter(Boolean)
        .filter((item) => {
          return !item.item.characterId || item.item.characterId === character
        })
      return json({ items: characterGear })
    }
  }
  return json({ items: [] })
}

let rarityBorder: Record<string, string> = {
  1: "border-l-neutral-600",
  2: "border-l-green-600",
  3: "border-l-blue-600",
  4: "border-l-purple-600",
  5: "border-l-orange-600",
}

export default function Inventory() {
  let { items } = useLoaderData<typeof loader>()
  return (
    <div className="grid w-full grow grid-cols-4 gap-4 bg-neutral-200 p-4 shadow-inner">
      {items.map((item) => (
        <div
          key={item.id}
          className={classnames(
            "border-l-3 relative border-2 border-neutral-400 bg-white p-4 shadow",
            rarityBorder[
              String(item.item.masterDataInstance.overrides?.rarity) ?? "0"
            ]
          )}
        >
          {item.weapon.display_name}
          <img
            alt=""
            loading="lazy"
            className="max-w-1/2 pointer-events-none absolute right-0 top-0 h-full"
            src={`https://img.darkti.de/pngs/${item.weapon.preview_image}.png`}
          />
        </div>
      ))}
    </div>
  )
}
