import { json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { Checkbox, Form, TextInput } from "~/components/Form"
import { getItems } from "~/data/items.server"
import { SkinSchema } from "~/data/schemas.server"

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url)
  const name = url.searchParams.get("name") ?? undefined
  const showDescriptions = url.searchParams.has("descriptions")
  const items = await getItems(SkinSchema, { name })
  return json({ title: "Skins", items, showDescriptions })
}

export default function Skins() {
  const { items, showDescriptions } = useLoaderData<typeof loader>()

  return (
    <>
      <Form>
        <Checkbox label="Show descriptions" name="descriptions" />
        <TextInput label="Search" name="name" className="ml-auto items-end" />
      </Form>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          return (
            <li
              className=" group relative m-2 overflow-hidden rounded bg-white shadow hover:shadow-lg"
              key={item.id}
            >
              <Link to={item.slug} className="block h-full w-full">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    loading="lazy"
                    alt=""
                    src={`https://img.darkti.de/pngs/${item.preview_image}.png`}
                    className="h-full transition duration-75 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 text-lg font-bold">{item.display_name}</div>
                {showDescriptions ? (
                  <p className="px-4 pb-4 text-gray-800">{item.description}</p>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
      {items.length < 1 ? (
        <div className="px-4 py-6 sm:px-0">
          <div className="grid h-96 place-content-center rounded-lg border-4 border-dashed border-gray-200">
            <span className="font-heading text-lg font-black text-neutral-400">
              No results
            </span>
          </div>
        </div>
      ) : null}
    </>
  )
}
