import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { Img } from "~/components/Img"
import { getItem } from "~/data/items.server"
import { CurioSchema } from "~/data/schemas.server"

export const loader = async ({ params }: LoaderArgs) => {
	let item = await getItem(CurioSchema, params.curio || "NO PARAM?")
	if (!item) {
		throw new Response("Not Found", {
			status: 404,
		})
	}
	return json({ title: item.display_name, item })
}

export default function Curio() {
	const { item } = useLoaderData<typeof loader>()

	return (
		<div className="flex flex-col items-center">
			<div className="bg-white shadow sm:rounded">
				<Img
					src={`${item.preview_image}.png`}
					width="1920"
					alt={item.display_name}
				/>
			</div>
			<p className="m-4 mb-0 rounded bg-white p-4 shadow md:w-1/2">
				{item.display_name}
			</p>
		</div>
	)
}
