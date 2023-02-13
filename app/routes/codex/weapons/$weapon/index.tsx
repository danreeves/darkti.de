import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { getItem } from "~/data/items.server"

export const loader = async ({ params }: LoaderArgs) => {
  let weapon = await getItem(params.weapon || "NO WEAPON PARAM?")
  if (!weapon) {
    throw new Response("Not Found", {
      status: 404,
    })
  }
  return json({ title: weapon.display_name, weapon })
}

export default function Weapon() {
  const { weapon } = useLoaderData<typeof loader>()

  return <pre>{JSON.stringify(weapon, null, 4)}</pre>
}
