import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData, useOutlet } from "@remix-run/react"
import { TagList } from "~/components/TagList"
import { getItems } from "~/data/items.server"
import { WeaponSchema } from "~/data/schemas.server"
import { Form, FormGroup, TextInput, Checkbox } from "~/components/Form"
import { getSearchParam } from "~/utils/getSearchParam"
import { Img } from "~/components/Img"

export const loader = async ({ request }: LoaderArgs) => {
	const url = new URL(request.url)
	const item_type = getSearchParam(url.searchParams, "type", [
		"melee",
		"ranged",
	])
	const archetypes = getSearchParam(url.searchParams, "archetype", undefined)
	const name = url.searchParams.get("name") ?? undefined
	const weapons = await getItems(WeaponSchema, { item_type, archetypes, name })
	return json({ title: "Weapons", weapons })
}

export default function Weapons() {
	const { weapons } = useLoaderData<typeof loader>()

	let subpage = useOutlet()

	if (subpage) {
		return subpage
	}

	return (
		<>
			<Form dir="row">
				<FormGroup label="Item type">
					<Checkbox name="type" value="melee" label="Melee" />
					<Checkbox name="type" value="ranged" label="Ranged" />
				</FormGroup>

				<FormGroup label="Class">
					<Checkbox name="archetype" value="veteran" label="Veteran" />
					<Checkbox name="archetype" value="zealot" label="Zealot" />
					<Checkbox name="archetype" value="psyker" label="Psyker" />
					<Checkbox name="archetype" value="ogryn" label="Ogryn" />
				</FormGroup>

				<TextInput label="Search" name="name" className="ml-auto items-end" />
			</Form>
			<ul className="grid grid-cols-1 md:grid-cols-2">
				{weapons.map((weapon) => {
					return (
						<li
							className=" group relative m-2 overflow-hidden rounded bg-white shadow hover:shadow-lg"
							key={weapon.id}
						>
							<div className="pointer-events-none absolute right-0 top-0 z-0 aspect-video h-full overflow-hidden ">
								<Img
									data-idk={weapon.preview_image}
									src={`${weapon.preview_image}.png`}
									width="256"
									className="h-full transition duration-75 group-hover:scale-105"
								/>
							</div>
							<Link
								to={weapon.slug}
								className="isolate z-10 block h-full w-full p-4"
							>
								<div className="mb-2 text-lg font-bold">
									{weapon.display_name}
								</div>
								<TagList tags={weapon.tags} />
								{/* TODO: Different schema for weapons and curios so this is not optional */}
								<TagList tags={weapon.archetypes ?? []} />
							</Link>
						</li>
					)
				})}
			</ul>
			{weapons.length < 1 ? (
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
