import { Link } from "react-router"
import type { Route } from "./+types/weapons"
import { Book } from "~/components/Book"
import { idToSlug } from "~/utils/routeUtils"

export async function loader({ context }: Route.LoaderArgs) {
	return await context.db.query.weapons.findMany({
		// where: (weapons, { eq }) => eq(weapons.item_type, "WEAPON_MELEE"),
		orderBy: (weapons, { asc }) => [asc(weapons.display_name)],
	})
}

export default function Weapons({ loaderData }: Route.ComponentProps) {
	if (!loaderData) {
		return <p>No weapons found.</p>
	}

	return (
		<div className="container mx-auto min-h-screen p-6">
			<div className="mb-4 flex flex-row items-center border-b border-green-500 pb-4">
				<Book className="" />
				<h1 className="font-machine flex-1 text-center text-5xl font-extrabold tracking-widest text-green-500">
					+++ Weapons of the Imperium +++
				</h1>
			</div>
			<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{loaderData.map((weapon) => (
					<li
						key={weapon.id}
						id={weapon.id}
						className="transform overflow-hidden border border-green-500 transition duration-50 hover:scale-105"
						style={{
							viewTransitionName: `tile-${idToSlug(weapon.id)}`,
						}}
					>
						<img
							src={`https://cdn.darkti.de/${weapon.preview_image}.png?w=600`}
							alt={weapon.display_name}
							className="h-48 w-full border-b border-green-500 object-cover hover:filter-none"
						/>
						<div className="p-4">
							<h2 className="mb-2 text-2xl font-bold text-green-500">
								{weapon.display_name}
							</h2>
							<p className="mb-4 text-sm text-green-500">
								{weapon.description}
							</p>
							<button className="border border-green-500 px-4 py-2 text-green-500 hover:bg-green-600 hover:text-black">
								Learn More
							</button>
						</div>
					</li>
				))}
			</ul>
			<footer className="mt-8 text-center text-sm text-green-600 uppercase">
				<p>++++ For the Emperor ++++</p>
			</footer>
		</div>
	)
}
