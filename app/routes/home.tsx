import * as schema from "~/database/schema"

import type { Route } from "./+types/home"
import { sql } from "drizzle-orm"
import { Book } from "~/components/Book"
import { Link } from "react-router"

export async function action({ request, context }: Route.ActionArgs) {
	const formData = await request.formData()
	let name = formData.get("name")
	let email = formData.get("email")
	if (typeof name !== "string" || typeof email !== "string") {
		return { guestBookError: "Name and email are required" }
	}

	name = name.trim()
	email = email.trim()
	if (!name || !email) {
		return { guestBookError: "Name and email are required" }
	}

	try {
		await context.db.insert(schema.guestBook).values({ name, email })
	} catch (error) {
		return { guestBookError: "Error adding to guest book" }
	}
}

export async function loader({ context }: Route.LoaderArgs) {
	return {
		weapons: await context.db.query.weapons.findMany({
			limit: 1,
			orderBy: sql`RANDOM()`,
		}),
		curios: await context.db.query.curios.findMany({
			limit: 1,
			orderBy: sql`RANDOM()`,
		}),
		skins: await context.db.query.skins.findMany({
			limit: 1,
			orderBy: sql`RANDOM()`,
		}),
	}
}

function PageLink({
	to,
	label,
	imageSrc,
	imageAlt,
}: {
	to: string
	label: string
	imageSrc: string
	imageAlt: string
}) {
	return (
		<Link
			to={to}
			className="group transform overflow-hidden border border-green-500 transition duration-50 hover:scale-105"
		>
			<img
				src={imageSrc}
				alt={imageAlt}
				className="halftone h-48 w-full border-b border-green-500 object-cover group-hover:filter-none"
			/>
			<div className="p-4 text-center text-5xl font-bold text-green-500">
				{label}
			</div>
		</Link>
	)
}

export default function Home({
	loaderData: { weapons, curios, skins },
}: Route.ComponentProps) {
	return (
		<div className="container mx-auto min-h-screen p-6">
			<div className="mb-4 flex flex-row items-center border-b border-green-500 pb-4">
				<Book className="" />
				<h1 className="font-machine flex-1 text-center text-5xl font-extrabold tracking-widest text-green-500">
					+++ Darkti.de +++
				</h1>
			</div>
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<PageLink
					to="/weapons"
					label="/weapons"
					imageSrc={`https://cdn.darkti.de/${weapons[0].preview_image}.png?w=600`}
					imageAlt={weapons[0].display_name}
				/>
				<PageLink
					to="/curios"
					label="/curios"
					imageSrc={`https://cdn.darkti.de/${curios[0].preview_image}.png?w=600`}
					imageAlt={curios[0].display_name}
				/>
				<PageLink
					to="/skins"
					label="/skins"
					imageSrc={`https://cdn.darkti.de/${skins[0].preview_image}.png?w=600`}
					imageAlt={skins[0].display_name}
				/>
			</div>
		</div>
	)
}
