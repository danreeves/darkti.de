import { json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Link, useLoaderData, useOutlet } from "@remix-run/react"
import { Form } from "~/components/Form"
import { getItems } from "~/data/items.server"
import { SkinSchema } from "~/data/schemas.server"
import { Img } from "~/components/Img"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Checkbox } from "~/components/ui/checkbox"
import { Button } from "~/components/ui/button"

export const loader = async ({ request }: LoaderArgs) => {
	const url = new URL(request.url)
	const name = url.searchParams.get("name") ?? undefined
	const showDescriptions = url.searchParams.has("descriptions")
	const items = await getItems(SkinSchema, { name })
	return json({ title: "Skins", items, showDescriptions })
}

export default function Skins() {
	const { items, showDescriptions } = useLoaderData<typeof loader>()

	let subpage = useOutlet()

	if (subpage) {
		return subpage
	}

	return (
		<>
			<Form className="flex-row justify-between items-end">
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<Label htmlFor="name">Search</Label>
					<Input type="string" name="name" id="name" />
				</div>
				<div className="flex items-center space-x-2 h-10">
					<Checkbox id="descriptions" name="descriptions" />
					<label
						htmlFor="descriptions"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Show descriptions
					</label>
				</div>
			</Form>

			<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{items.map((item) => {
					return (
						<li className="group relative " key={item.id}>
							<Button variant="outline" asChild className="justify-start">
								<Link to={item.slug} className="block h-full w-full flex-col ">
									<div className="aspect-video w-full overflow-hidden">
										<Img
											src={`${item.preview_image}.png`}
											width="256"
											className="h-full transition duration-75 group-hover:scale-105"
										/>
									</div>
									<div className="p-4 text-lg font-bold">
										{item.display_name}
									</div>
									{showDescriptions ? (
										<p className="px-4 pb-4 ">{item.description}</p>
									) : null}
								</Link>
							</Button>
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
