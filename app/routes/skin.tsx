import { Link } from "~/components/Link"
import type { Route } from "./+types/curio"
import { Book } from "~/components/Book"
import { idToSlug, slugToId } from "~/utils/routeUtils"
import { useLocation } from "react-router"

export async function loader({ context, params }: Route.LoaderArgs) {
	const id = slugToId(params.id)
	const results = await context.db.query.skins.findMany({
		where: (skins, { eq }) => eq(skins.id, id),
		orderBy: (skins, { asc }) => [asc(skins.display_name)],
		limit: 1,
	})

	if (!results.length) {
		return null
	}

	return results[0]
}

export default function Curios({ loaderData: skin }: Route.ComponentProps) {
	const { state } = useLocation()
	if (!skin) {
		return <p>No skin found.</p>
	}

	return (
		<div className="container mx-auto min-h-screen p-6">
			<div className="mb-4 flex flex-row items-center border-b border-green-500 pb-4">
				<Book className="" />
				<h1 className="font-machine flex-1 text-center text-5xl font-extrabold tracking-widest text-green-500">
					+++ {skin.display_name} +++
				</h1>
			</div>
			<div className="flex flex-col gap-4">
				<div
					className="border border-green-500"
					style={{
						viewTransitionName: `tile-${idToSlug(skin.id)}`,
					}}
				>
					<img
						src={`https://cdn.darkti.de/${skin.preview_image}.png?w=1920`}
						alt={skin.display_name}
						className="aspect-video w-full border-b border-green-500 object-cover hover:filter-none"
					/>
					<div className="p-4">
						<h2 className="mb-2 text-2xl font-bold text-green-500">
							{skin.display_name}
						</h2>
						<p className="mb-4 text-sm text-green-500">
							{/* @ts-ignore -- this totally exists... */}
							{skin.description}
						</p>
					</div>
				</div>
				<Link to={state?.referrer || "/skins"} viewTransition>
					Back
				</Link>
			</div>
			<footer className="mt-8 text-center text-sm text-green-600 uppercase">
				<p>++++ For the Emperor ++++</p>
			</footer>
		</div>
	)
}
