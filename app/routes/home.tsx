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
	return await context.db.query.weapons.findMany({
		limit: 1,
		orderBy: sql`RANDOM()`,
	})
}

export default function Home({ loaderData }: Route.ComponentProps) {
	return (
		<div className="font-warhammer container mx-auto min-h-screen p-6">
			<div className="mb-8 flex flex-row items-center border-b border-green-500 pb-4">
				<Book className="" />
				<h1 className="font-machine flex-1 text-center text-5xl font-extrabold tracking-widest text-green-500">
					+++ Darkti.de +++
				</h1>
			</div>
			<div className="flex flex-row gap-4">
				<Link
					to="/weapons"
					className="transform overflow-hidden border border-green-500 transition duration-50 hover:scale-105"
				>
					<img
						src={`https://cdn.darkti.de/${loaderData[0].preview_image}.png?w=600`}
						alt={loaderData[0].display_name}
						className="halftone h-48 w-full border-b border-green-500 object-cover hover:filter-none"
					/>
					<div className="font-machine p-4 text-center text-5xl font-bold tracking-widest text-green-500">
						/Weapons
					</div>
				</Link>
			</div>
		</div>
	)
}
