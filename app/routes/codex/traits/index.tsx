import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { getItems } from "~/data/items.server"
import { TraitSchema } from "~/data/schemas.server"

export const loader = async () => {
  const items = await getItems(TraitSchema)
  return json({ title: "Traits", items })
}

export default function Traits() {
  const { items } = useLoaderData<typeof loader>()

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        return (
          <li
            className=" group relative m-2 overflow-hidden rounded bg-white shadow hover:shadow-lg"
            key={item.id}
          >
            <Link to={item.slug} className="block h-full w-full">
              <div className="flex aspect-video w-full items-center justify-center">
                <img
                  loading="lazy"
                  alt=""
                  src={`https://img.darkti.de/pngs/${item.icon}.png`}
                  className="m-4 rounded bg-neutral-800 transition duration-75 group-hover:scale-105"
                />
              </div>
              <div className="p-4 text-lg font-bold">{item.display_name}</div>
              <p className="px-4 pb-4 text-gray-800">{item.description}</p>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
