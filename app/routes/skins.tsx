import { Link } from "react-router"
import type { Route } from "./+types/curios"
import { Book } from "~/components/Book"
import { idToSlug } from "~/utils/routeUtils"
import { VisualLink } from "~/components/Link"

export async function loader({ context }: Route.LoaderArgs) {
	return await context.db.query.skins.findMany({
		orderBy: (skins, { asc }) => [asc(skins.display_name)],
		// limit: 25,
	})
}

export default function Skins({ loaderData }: Route.ComponentProps) {
	if (!loaderData) {
		return <p>No skins found.</p>
	}

	return (
		<div className="font-warhammer container mx-auto min-h-screen p-6">
			<div className="mb-4 flex flex-row items-center border-b border-green-500 pb-4">
				<Book className="" />
				<h1 className="font-machine flex-1 text-center text-5xl font-extrabold tracking-widest text-green-500">
					+++ Weapons of the Imperium +++
				</h1>
			</div>
			<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{loaderData.map((skin) => (
					<li
						key={skin.id}
						id={skin.id}
						className="transform overflow-hidden border border-green-500 transition duration-50 hover:scale-105"
						style={{
							viewTransitionName: `tile-${idToSlug(skin.id)}`,
						}}
					>
						<Link
							to={`/skins/${idToSlug(skin.id)}`}
							className="block h-full w-full"
							viewTransition
						>
							<img
								src={`https://cdn.darkti.de/${skin.preview_image}.png?w=600`}
								loading="lazy"
								alt={skin.display_name}
								className="h-48 w-full border-b border-green-500 object-cover hover:filter-none"
							/>
							<div className="flex flex-col gap-4 p-4">
								<h2 className="text-2xl font-bold text-green-500">
									{skin.display_name}
								</h2>
								<p className="text-sm text-green-500">
									{skin.description}
								</p>
								<div>
									<VisualLink>View</VisualLink>
								</div>
							</div>
						</Link>
					</li>
				))}
			</ul>
			<footer className="mt-12 text-center text-sm text-green-600 uppercase">
				<p>++++ For the Emperor ++++</p>
			</footer>
		</div>
	)
}
