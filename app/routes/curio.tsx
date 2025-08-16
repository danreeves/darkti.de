import { Link } from "~/components/Link"
import type { Route } from "./+types/curio"
import { Book } from "~/components/Book"
import { idToSlug, slugToId } from "~/utils/routeUtils"

export async function loader({ context, params }: Route.LoaderArgs) {
	const id = slugToId(params.id)
	const results = await context.db.query.curios.findMany({
		where: (curios, { eq }) => eq(curios.id, id),
		orderBy: (curios, { asc }) => [asc(curios.display_name)],
	})

	if (!results.length) {
		return null
	}

	return results[0]
}

export default function Curios({ loaderData: curio }: Route.ComponentProps) {
	if (!curio) {
		return <p>No curio found.</p>
	}

	return (
		<div className="container mx-auto min-h-screen p-6">
			<div className="mb-4 flex flex-row items-center border-b border-green-500 pb-4">
				<Book className="" />
				<h1 className="font-machine flex-1 text-center text-5xl font-extrabold tracking-widest text-green-500">
					+++ {curio.display_name} +++
				</h1>
			</div>
			<div className="flex flex-col gap-4">
				<div
					className="border border-green-500"
					style={{
						viewTransitionName: `tile-${idToSlug(curio.id)}`,
					}}
				>
					<img
						src={`https://cdn.darkti.de/${curio.preview_image}.png?w=1920`}
						alt={curio.display_name}
						className="aspect-video w-full border-b border-green-500 object-cover hover:filter-none"
					/>
				</div>
				<Link to="/curios" viewTransition>
					Back
				</Link>
			</div>
			<footer className="mt-8 text-center text-sm text-green-600 uppercase">
				<p>++++ For the Emperor ++++</p>
			</footer>
		</div>
	)
}
