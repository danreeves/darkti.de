import { Link, useOutlet } from "@remix-run/react"
import { json } from "@remix-run/node"
import { Button } from "~/components/ui/button"
import { Img } from "~/components/Img"
import { twMerge } from "tailwind-merge"

export const loader = async () => {
	return json({ title: "Codex" })
}

export default function Codex() {
	let subpage = useOutlet()

	if (subpage) {
		return subpage
	}

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<LinkBox
				to="weapons"
				label="Weapons"
				img="content-items-weapons-player-melee-combataxe_p3_m1.png"
			/>
			{/* <LinkBox to="classes" label="Classes" /> */}
			<LinkBox
				to="blessings"
				label="Blessings"
				img="content/ui/textures/icons/traits/weapon_trait_064.png"
				imgClassName="invert dark:invert-0"
			/>
			{/* <LinkBox to="perks" label="Perks" /> */}
			<LinkBox
				to="skins"
				label="Skins"
				img="content-items-weapons-player-skins-lasgun-lasgun_p1_m001_twitch.png"
			/>
			<LinkBox
				to="curios"
				label="Curios"
				img="content-items-gadgets-defensive_gadget_2.png"
			/>
		</div>
	)
}

function LinkBox({
	to,
	label,
	img,
	imgClassName,
}: {
	to: string
	label: string
	img: string
	imgClassName?: string
}) {
	return (
		<Button variant="outline" asChild>
			<Link to={to} className="text-xl py-6 h-24 relative group">
				{label}{" "}
				<div
					className={twMerge(
						"pointer-events-none absolute right-0 top-0 z-0 aspect-video h-full overflow-hidden",
						imgClassName,
					)}
				>
					<Img
						src={img}
						width="256"
						className="h-24 transition duration-75 group-hover:scale-105"
					/>
				</div>
			</Link>
		</Button>
	)
}
