import { Link } from "~/components/Link"
import type { Route } from "./+types/skin"
import { idToSlug, slugToId } from "~/utils/routeUtils"
import { redirect, useLocation } from "react-router"

export async function loader({ context, params }: Route.LoaderArgs) {
	const id = slugToId(params.id)
	const results = await context.db.query.skins.findMany({
		where: (skins, { eq }) => eq(skins.id, id),
		orderBy: (skins, { asc }) => [asc(skins.display_name)],
		limit: 1,
	})

	if (!results.length) {
		return redirect("/skins")
	}

	return { title: results[0].display_name, skin: results[0] }
}

export default function Curios({ loaderData: { skin } }: Route.ComponentProps) {
	const { state } = useLocation()
	if (!skin) {
		return <p>No skin found.</p>
	}

	return (
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
	)
}
