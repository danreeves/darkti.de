import { useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { forEach } from "lodash"
import { z } from "zod"
import { zx } from "zodix"
import { getAuthToken } from "~/data/authtoken.server"
import { getItems } from "~/data/items.server"
import { WeaponSchema } from "~/data/schemas.server"
import { authenticator } from "~/services/auth.server"
import { getAccountGear, getCharacters, getShopFor } from "~/services/darktide.server"
import { classnames } from "~/utils/classnames"

export let handle = "exchange"

export async function loader({ request, params }: LoaderArgs) {
 const { character } = zx.parseParams(params, { character: z.string() })
  let user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  })

  let auth = await getAuthToken(user.id)

  if (auth) {
	let characters = await getCharacters(auth)
	for(let i = 0; i < characters?.characters?.length; i++)
	{
		let character = characters?.characters[i]
		let currentShop = await getShopFor(auth, character?.archetype, character?.id )
	}
  }
}

export default function Exchange() {
	return "Coming Soon"
}
