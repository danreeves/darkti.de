import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { Img } from "~/components/Img"
import { getItem } from "~/data/items.server"
import { BlessingSchema } from "~/data/schemas.server"

export const loader = async ({ params }: LoaderFunctionArgs) => {
	let item = await getItem(BlessingSchema, params.blessing || "NO PARAM?")
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
			<div className="invert dark:invert-0">
				<Img src={`${item.icon}.png`} width="128" alt={item.display_name} />
			</div>
			<p className="m-4 mb-0  text-foreground p-4  md:w-1/2">
				{item.description}
			</p>
			<pre>{JSON.stringify(item, null, 4)}</pre>
		</div>
	)
}
