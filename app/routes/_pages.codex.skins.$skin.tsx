import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { Img } from "~/components/Img"
import { getItem } from "~/data/items.server"
import { SkinSchema } from "~/data/schemas.server"

export const loader = async ({ params }: LoaderFunctionArgs) => {
	let item = await getItem(SkinSchema, params.skin || "NO PARAM?")
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
			<div className="">
				<Img
					src={`${item.preview_image}.png`}
					width="1920"
					alt={item.display_name}
				/>
			</div>
			<p className="m-4 mb-0  p-4  md:w-1/2">{item.description}</p>
		</div>
	)
}
