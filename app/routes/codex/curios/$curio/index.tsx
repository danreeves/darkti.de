import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { getItem } from "~/data/items.server"

export const loader = async ({ params }: LoaderArgs) => {
	let item = await getItem(params.curio || "NO WEAPON PARAM?")
	if (!item) {
		throw new Response("Not Found", {
			status: 404,
		})
	}
	return json({ title: item.display_name, item })
}

export default function Curio() {
	const { item } = useLoaderData<typeof loader>()

	return <div className="bg-white rounded shadow">
		<img src={`https://img.darkti.de/pngs/${item.preview_image}.png`} alt={item.display_name} />
	</div>
}
