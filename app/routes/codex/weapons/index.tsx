import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { getWeapons } from "~/data/weapons.server"
import { useTranslation } from "~/hooks/useTranslation"

export const loader = async () => {
	const weapons = await getWeapons()
	return json({ title: "Weapons", weapons })
}

export default function Weapons() {
	const { weapons } = useLoaderData<typeof loader>()
	const t = useTranslation()

	return (
		<ul className="grid grid-cols-2">
			{weapons.map((weapon) => (
				<li
					className=" group relative m-2 h-32 overflow-hidden rounded bg-white shadow hover:shadow-lg"
					key={weapon.id}
				>
					<Link to={weapon.slug} className="block h-full w-full p-4">
						<span className="font-bold">{t(weapon.display_name)}</span>
					</Link>
					<div className="pointer-events-none absolute top-0 right-0 aspect-video h-full overflow-hidden ">
						<img
							alt=""
							src={`https://img.darkti.de/pngs/${weapon.preview_image}.png`}
							className="transition duration-75 group-hover:scale-105"
						/>
					</div>
				</li>
			))}
		</ul>
	)
}
