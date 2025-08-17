import { Link as RouterLink, useLocation } from "react-router"
import type { Route } from "./+types/skins"
import { idToSlug } from "~/utils/routeUtils"
import { VisualLink, Link } from "~/components/Link"
import { count } from "drizzle-orm"
import { skins as skinsTable } from "~/database/schema"

export async function loader({ context, request }: Route.LoaderArgs) {
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") || "1", 10)
	const limit = parseInt(url.searchParams.get("limit") || "48", 10)
	const offset = (page - 1) * limit

	const skins = await context.db.query.skins.findMany({
		orderBy: (skins, { asc }) => [asc(skins.display_name)],
		limit,
		offset,
	})

	const totalSkins = await context.db
		.select({ count: count() })
		.from(skinsTable)

	return {
		title: "Weapons of the Imperium",
		skins,
		totalSkins: totalSkins[0].count,
		page,
		limit,
	}
}

export default function Skins({ loaderData }: Route.ComponentProps) {
	const { skins, totalSkins, page, limit } = loaderData
	const { pathname, search } = useLocation()

	if (!skins || skins.length === 0) {
		return <p>No skins found.</p>
	}

	const totalPages = Math.ceil(totalSkins / limit)

	return (
		<>
			<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{skins.map((skin) => (
					<li
						key={skin.id}
						id={skin.id}
						className="transform overflow-hidden border border-green-500 transition duration-50 hover:scale-105"
						style={{
							viewTransitionName: `tile-${idToSlug(skin.id)}`,
						}}
						onMouseEnter={() => {
							const img = new window.Image()
							img.src = `https://cdn.darkti.de/${skin.preview_image}.png?w=1920`
						}}
					>
						<RouterLink
							to={`/skins/${idToSlug(skin.id)}`}
							state={{ referrer: pathname + search }}
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
						</RouterLink>
					</li>
				))}
			</ul>
			<div className="mt-8 flex items-center justify-center gap-4">
				{page > 1 ? (
					<Link to={`?page=${page - 1}&limit=${limit}`}>
						{"<"} Previous
					</Link>
				) : (
					<span className="cursor-not-allowed border border-green-500 px-4 py-2 text-green-500 opacity-50">
						{"<"} Previous
					</span>
				)}
				<span className="text-green-500">
					Page {page} of {totalPages}
				</span>
				{page < totalPages ? (
					<Link to={`?page=${page + 1}&limit=${limit}`}>
						Next {">"}
					</Link>
				) : (
					<span className="cursor-not-allowed border border-green-500 px-4 py-2 text-green-500 opacity-50">
						Next {">"}
					</span>
				)}
			</div>
		</>
	)
}
