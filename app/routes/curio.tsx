import { Link } from "~/components/Link"
import type { Route } from "./+types/curio"
import { idToSlug, slugToId } from "~/utils/routeUtils"
import { redirect } from "react-router"

export async function loader({ context, params }: Route.LoaderArgs) {
	const id = slugToId(params.id)
	const results = await context.db.query.curios.findMany({
		where: (curios, { eq }) => eq(curios.id, id),
		orderBy: (curios, { asc }) => [asc(curios.display_name)],
	})

	if (!results.length) {
		return redirect("/curios")
	}

	return {
		title: results[0].display_name,
		curio: results[0],
	}
}

export default function Curio({ loaderData: { curio } }: Route.ComponentProps) {
	return (
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
	)
}
