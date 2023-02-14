import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { getItems } from "~/data/items.server"

export const loader = async () => {
  const weapons = await getItems({ item_type: ["melee", "ranged"] })
  return json({ title: "Weapons", weapons })
}

export default function Weapons() {
  const { weapons } = useLoaderData<typeof loader>()

  return (
    <ul className="grid grid-cols-2">
      {weapons.map((weapon) => {
        return (
          <li
            className=" group relative m-2 overflow-hidden rounded bg-white shadow hover:shadow-lg"
            key={weapon.id}
          >
            <Link to={weapon.slug} className="block h-full w-full p-4">
              <div className="mb-2 text-lg font-bold">
                {weapon.display_name}
              </div>
              <TagList tags={weapon.tags} />
              <TagList tags={weapon.archetypes ?? []} />
            </Link>
            <div className="pointer-events-none absolute top-0 right-0 aspect-video h-full overflow-hidden ">
              <img
                alt=""
                src={`https://img.darkti.de/pngs/${weapon.preview_image}.png`}
                className="h-full transition duration-75 group-hover:scale-105"
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="center-items flex gap-2 py-1">
      {tags.map((tag) => (
        <div
          key={tag}
          className="small-caps inline-block rounded bg-neutral-200 p-1.5 text-xs font-bold uppercase text-neutral-500"
        >
          {tag}
        </div>
      ))}
    </div>
  )
}
