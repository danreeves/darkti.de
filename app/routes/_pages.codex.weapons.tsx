import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData, useOutlet } from "@remix-run/react"
import { TagList } from "~/components/TagList"
import { getItems } from "~/data/items.server"
import { WeaponSchema } from "~/data/schemas.server"
import { Form } from "~/components/Form"
import { getSearchParam } from "~/utils/getSearchParam"
import { Img } from "~/components/Img"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Checkbox } from "~/components/ui/checkbox"
import { titleCase } from "~/utils/titleCase"
import { Button } from "~/components/ui/button"

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
			<Form replace className="flex-row mb-4 gap-8">
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
					<Label>Archetype</Label>
					<div className="flex gap-4">
						{["veteran", "zealot", "psyker", "ogryn"].map((kind) => (
							<div key={kind} className="flex items-center space-x-2 h-10">
								<Checkbox id={kind} name="archetype" value={kind} />
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
			</Form>

			<ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{weapons.map((weapon) => {
					return (
						<li className="group relative" key={weapon.id}>
							<Button variant="outline" asChild className="items-start">
								<Link
									to={weapon.slug}
									className="isolate z-10 flex flex-col items-start h-full w-full p-4"
								>
									<div className="pointer-events-none absolute right-0 top-0 z-0 aspect-video h-full overflow-hidden ">
										<Img
											data-idk={weapon.preview_image}
											src={`${weapon.preview_image}.png`}
											width="256"
											className="h-full transition duration-75 group-hover:scale-105"
										/>
									</div>
									<div className="mb-2 text-lg font-bold">
										{weapon.display_name}
									</div>
									<TagList tags={weapon.tags} />
									<TagList tags={weapon.archetypes} />
								</Link>
							</Button>
						</li>
					)
				})}
			</ul>

			{weapons.length < 1 ? (
				<div className="px-4 py-6 sm:px-0">
					<div className="grid h-96 place-content-center rounded-lg border-4 border-dashed border-foreground/25">
						<span className="font-heading text-lg font-black text-foreground">
							No results
						</span>
					</div>
				</div>
			) : null}
		</>
	)
}
