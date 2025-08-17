import { Link } from "~/components/Link"
import type { Route } from "./+types/weapon"
import { idToSlug, slugToId } from "~/utils/routeUtils"
import { redirect, useLocation } from "react-router"

export async function loader({ context, params }: Route.LoaderArgs) {
	const id = slugToId(params.id)
	const results = await context.db.query.weapons.findMany({
		where: (weapons, { eq }) => eq(weapons.id, id),
		orderBy: (weapons, { asc }) => [asc(weapons.display_name)],
		limit: 1,
	})

	if (!results.length) {
		return redirect("/weapons")
	}

	return { title: results[0].display_name, weapon: results[0] }
}

export default function Weapon({
	loaderData: { weapon },
}: Route.ComponentProps) {
	const { state } = useLocation()

	return (
		<div className="flex flex-col gap-4">
			<div
				className="border border-green-500"
				style={{
					viewTransitionName: `tile-${idToSlug(weapon.id)}`,
				}}
			>
				<img
					src={`https://cdn.darkti.de/${weapon.preview_image}.png?w=1920`}
					alt={weapon.display_name}
					className="aspect-video w-full border-b border-green-500 object-cover hover:filter-none"
				/>
				<div className="p-4">
					<h2 className="mb-2 text-2xl font-bold text-green-500">
						{weapon.display_name}
					</h2>
					<p className="mb-4 text-sm text-green-500">
						{/* @ts-ignore -- this totally exists... */}
						{weapon.description}
					</p>
				</div>
			</div>
			<Link to={state?.referrer || "/skins"} viewTransition>
				Back
			</Link>
		</div>
	)
}
