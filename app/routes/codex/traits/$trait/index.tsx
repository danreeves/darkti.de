import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { getItem } from "~/data/items.server"
import { TraitSchema } from "~/data/schemas.server"

export const loader = async ({ params }: LoaderArgs) => {
  let item = await getItem(TraitSchema, params.trait || "NO PARAM?")
  if (!item) {
    throw new Response("Not Found", {
      status: 404,
    })
  }
  return json({ title: item.display_name, item })
}

export default function Skin() {
  const { item } = useLoaderData<typeof loader>()

  return (
    <div className="flex flex-col items-center">
      <div className="bg-neutral-800 shadow sm:rounded">
        <img
          src={`https://img.darkti.de/pngs/${item.icon}.png`}
          alt={item.display_name}
        />
      </div>
      <p className="m-4 mb-0 rounded bg-white p-4 shadow md:w-1/2">
        {item.description}
      </p>
      <pre>{JSON.stringify(item, null, 4)}</pre>
    </div>
  )
}
