import { Link as RouterLink } from "react-router"
import type { Route } from "./+types/curios"
import { idToSlug } from "~/utils/routeUtils"
import { VisualLink } from "~/components/Link"

export async function loader({ context }: Route.LoaderArgs) {
	return {
		title: "Curios",
		curios: await context.db.query.curios.findMany({
			// where: (curios, { eq }) => eq(curios.item_type, "WEAPON_MELEE"),
			orderBy: (curios, { asc }) => [asc(curios.display_name)],
		}),
	}
}

export default function Curios({
	loaderData: { curios },
}: Route.ComponentProps) {
	if (!curios) {
		return <p>No curios found.</p>
	}

	return (
		<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{curios.map((curio) => (
				<li
					key={curio.id}
					id={curio.id}
					className="transform overflow-hidden border border-green-500 transition duration-50 hover:scale-105"
					style={{
						viewTransitionName: `tile-${idToSlug(curio.id)}`,
					}}
				>
					<RouterLink
						to={`/curio/${idToSlug(curio.id)}`}
						className="object-cover"
						viewTransition
					>
						<img
							src={`https://cdn.darkti.de/${curio.preview_image}.png?w=600`}
							alt={curio.display_name}
							className="h-48 w-full border-b border-green-500 object-cover hover:filter-none"
						/>
						<div className="grid gap-4 p-4">
							<h2 className="mb-2 text-2xl font-bold text-green-500">
								{curio.display_name}
							</h2>
							<div>
								<VisualLink>View</VisualLink>
							</div>
						</div>
					</RouterLink>
				</li>
			))}
		</ul>
	)
}
