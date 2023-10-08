import { json } from "@remix-run/node"
import { Link, useLoaderData, useOutlet } from "@remix-run/react"
import { Img } from "~/components/Img"
import { Button } from "~/components/ui/button"
import { getItems } from "~/data/items.server"
import { BlessingSchema } from "~/data/schemas.server"

export const loader = async () => {
	const items = await getItems(BlessingSchema)
	return json({ title: "Blessings", items })
}

export default function Blessings() {
	const { items } = useLoaderData<typeof loader>()

	let subpage = useOutlet()

	if (subpage) {
		return subpage
	}

	return (
		<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{items.map((item) => {
				return (
					<li className=" group relative " key={item.id}>
						<Button variant="outline" asChild>
							<Link to={item.slug} className=" h-full w-full flex-col">
								<div className="flex aspect-video w-full items-center justify-center">
									<Img
										src={`${item.icon}.png`}
										width="128"
										className="m-4 rounded  transition duration-75 group-hover:scale-105 invert dark:invert-0"
									/>
								</div>
								<div className="p-4 text-lg font-bold">{item.display_name}</div>
								<p className="px-4 pb-4 ">{item.description}</p>
							</Link>
						</Button>
					</li>
				)
			})}
		</ul>
	)
}
