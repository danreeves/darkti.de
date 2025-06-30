import { useFetcher, redirect } from "react-router"
import type { Route } from "./+types/import"
import {
	circumstanceTemplates,
	CircumstanceTemplateInsertSchema,
	CircumstanceTemplateSchemaJSON,
	missionTemplates,
	MissionTemplateInsertSchema,
	missionTypes,
	zones,
	MissionTypeInsertSchema,
	ZoneInsertSchema,
	BlessingSchemaJSON,
	traits,
	TraitInsertSchema,
	PerkSchemaJSON,
	SkinSchemaJSON,
	skins,
	SkinInsertSchema,
	CurioSchemaJSON,
	curios,
	CurioInsertSchema,
	weapons,
	WeaponSchemaJSON,
	WeaponInsertSchema,
} from "../../database/schema"
import { count } from "drizzle-orm"

const tables = [
	circumstanceTemplates,
	missionTemplates,
	missionTypes,
	zones,
	traits,
	skins,
	curios,
	weapons,
]

export async function action({ request, context }: Route.ActionArgs) {
	// Check authentication first
	const sessionCookie = getCookie(request, "admin-session")

	if (sessionCookie !== "authenticated") {
		throw redirect("/admin")
	}

	const CIRCUMSTANCE_TEMPLATES = await import(
		"../../exported/circumstance_templates.json"
	).then((module) => module.default)
	const MISSION_TEMPLATES = await import(
		"../../exported/mission_templates.json"
	).then((module) => module.default)
	const MISSION_TYPES = await import(
		"../../exported/mission_types.json"
	).then((module) => module.default)
	const ZONES = await import("../../exported/zones.json").then(
		(module) => module.default,
	)
	const ITEM_MASTER_LIST = await import(
		"../../exported/item_master_list.json"
	).then((module) => module.default)

	const formData = await request.formData()
	const action = formData.get("action")
	if (typeof action === "string" && action.startsWith("import")) {
		try {
			if (action === "import_circumstance_templates") {
				for (const [key, template] of Object.entries(
					CIRCUMSTANCE_TEMPLATES,
				)) {
					await context.db.insert(circumstanceTemplates).values(
						CircumstanceTemplateInsertSchema.parse(
							CircumstanceTemplateSchemaJSON.parse({
								key,
								...template,
							}),
						),
					)
				}
			}

			if (action === "import_mission_templates") {
				for (const template of MISSION_TEMPLATES) {
					await context.db
						.insert(missionTemplates)
						.values(MissionTemplateInsertSchema.parse(template))
				}
			}

			if (action === "import_mission_types") {
				for (const [key, template] of Object.entries(MISSION_TYPES)) {
					await context.db.insert(missionTypes).values(
						MissionTypeInsertSchema.parse({
							key,
							...template,
						}),
					)
				}
			}

			if (action === "import_zones") {
				for (const [key, template] of Object.entries(ZONES)) {
					await context.db.insert(zones).values(
						ZoneInsertSchema.parse({
							key,
							...template,
						}),
					)
				}
			}

			if (action === "import_blessings") {
				for (const item of ITEM_MASTER_LIST) {
					const { success: isBlessing, data: blessing } =
						BlessingSchemaJSON.safeParse(item)
					if (isBlessing) {
						await context.db
							.insert(traits)
							.values(TraitInsertSchema.parse(blessing))
					}
				}
			}

			if (action === "import_perks") {
				for (const item of ITEM_MASTER_LIST) {
					const { success: isPerk, data: perk } =
						PerkSchemaJSON.safeParse(item)
					if (isPerk) {
						await context.db
							.insert(traits)
							.values(TraitInsertSchema.parse(perk))
					}
				}
			}

			if (action === "import_skins") {
				for (const item of ITEM_MASTER_LIST) {
					const { success: isSkin, data: skin } =
						SkinSchemaJSON.safeParse(item)
					if (isSkin) {
						await context.db
							.insert(skins)
							.values(SkinInsertSchema.parse(skin))
					}
				}
			}

			if (action === "import_curios") {
				for (const item of ITEM_MASTER_LIST) {
					const { success: isCurio, data: curio } =
						CurioSchemaJSON.safeParse(item)
					if (isCurio) {
						await context.db
							.insert(curios)
							.values(CurioInsertSchema.parse(curio))
					}
				}
			}

			if (action === "import_weapons") {
				for (const item of ITEM_MASTER_LIST) {
					const { success: isWeapon, data: weapon } =
						WeaponSchemaJSON.safeParse(item)
					if (isWeapon) {
						await context.db
							.insert(weapons)
							.values(WeaponInsertSchema.parse(weapon))
					}
				}
			}
		} catch (error) {
			console.error("Error parsing templates:", error)
			return {
				success: false,
				// @ts-expect-error
				message: error.message,
			}
		}

		return { success: true }
	}

	if (action === "delete") {
		try {
			for (const table of tables) {
				await context.db.delete(table).all()
			}
		} catch (error) {
			console.error("Error deleting templates:", error)
			return {
				success: false,
				// @ts-expect-error
				message: error.message,
			}
		}
		return { success: true }
	}

	return
}

function getCookie(request: Request, name: string): string | undefined {
	const cookieHeader = request.headers.get("Cookie")
	if (!cookieHeader) return undefined

	const cookies = cookieHeader.split(";").map((cookie) => cookie.trim())
	const targetCookie = cookies.find((cookie) => cookie.startsWith(`${name}=`))

	return targetCookie ? targetCookie.split("=")[1] : undefined
}

export async function loader({ request, context }: Route.LoaderArgs) {
	// Check authentication
	const sessionCookie = getCookie(request, "admin-session")

	if (sessionCookie !== "authenticated") {
		throw redirect("/admin")
	}

	const tableNames = [
		"circumstanceTemplates",
		"missionTemplates",
		"missionTypes",
		"zones",
		"traits",
		"skins",
		"curios",
		"weapons",
	]

	const tableCounts: Record<string, number> = {}
	for (let i = 0; i < tables.length; i++) {
		const table = tables[i]
		const tableName = tableNames[i]
		const numRows = (
			await context.db.select({ count: count() }).from(table)
		)[0].count

		tableCounts[tableName] = numRows
	}
	return {
		tableCounts,
	}
}

export default function Import({ loaderData }: Route.ComponentProps) {
	let fetcher = useFetcher()

	const { success, message } = fetcher.data || {}
	let busy = fetcher.state !== "idle"

	return (
		<div
			className={`mx-auto flex max-w-4xl flex-col items-center justify-center border border-green-500 p-6 text-green-500 ${
				busy ? "opacity-50" : ""
			}`}
		>
			<h1 className="font-machine mb-6 text-4xl font-bold tracking-widest text-green-500">
				+++ DATA IMPORT +++
			</h1>

			{success === true ? (
				<p className="mb-4 text-green-400">
					+++ Operation successful! +++
				</p>
			) : success === false ? (
				<p className="mb-4 text-red-500">
					+++ Import failed. {message} +++
				</p>
			) : null}

			{loaderData ? (
				<p className="mb-6 text-center text-green-400">
					Total items in data banks:{" "}
					<span className="font-bold text-green-500">
						{Object.values(loaderData.tableCounts).reduce(
							(sum, count) => sum + count,
							0,
						)}
					</span>{" "}
					across{" "}
					<span className="font-bold text-green-500">
						{Object.keys(loaderData.tableCounts).length}
					</span>{" "}
					data-banks
				</p>
			) : null}

			<fetcher.Form
				method="post"
				className="flex w-full flex-wrap content-center items-center justify-center gap-2"
			>
				<button
					className="transform border border-green-500 bg-black px-4 py-2 text-sm text-green-500 transition duration-50 hover:scale-105 hover:bg-green-600 hover:text-black disabled:opacity-50"
					type="submit"
					disabled={busy}
					name="action"
					value="import_circumstance_templates"
				>
					{busy
						? "Processing..."
						: `Circumstances (${loaderData?.tableCounts?.circumstanceTemplates || 0})`}
				</button>
				<button
					className="transform border border-green-500 bg-black px-4 py-2 text-sm text-green-500 transition duration-50 hover:scale-105 hover:bg-green-600 hover:text-black disabled:opacity-50"
					type="submit"
					disabled={busy}
					name="action"
					value="import_mission_templates"
				>
					{busy
						? "Processing..."
						: `Mission Templates (${loaderData?.tableCounts?.missionTemplates || 0})`}
				</button>
				<button
					className="transform border border-green-500 bg-black px-4 py-2 text-sm text-green-500 transition duration-50 hover:scale-105 hover:bg-green-600 hover:text-black disabled:opacity-50"
					type="submit"
					disabled={busy}
					name="action"
					value="import_mission_types"
				>
					{busy
						? "Processing..."
						: `Mission Types (${loaderData?.tableCounts?.missionTypes || 0})`}
				</button>
				<button
					className="transform border border-green-500 bg-black px-4 py-2 text-sm text-green-500 transition duration-50 hover:scale-105 hover:bg-green-600 hover:text-black disabled:opacity-50"
					type="submit"
					disabled={busy}
					name="action"
					value="import_zones"
				>
					{busy
						? "Processing..."
						: `Zones (${loaderData?.tableCounts?.zones || 0})`}
				</button>
				<button
					className="transform border border-green-500 bg-black px-4 py-2 text-sm text-green-500 transition duration-50 hover:scale-105 hover:bg-green-600 hover:text-black disabled:opacity-50"
					type="submit"
					disabled={busy}
					name="action"
					value="import_blessings"
				>
					{busy
						? "Processing..."
						: `Blessings (${loaderData?.tableCounts?.traits || 0})`}
				</button>
				<button
					className="transform border border-green-500 bg-black px-4 py-2 text-sm text-green-500 transition duration-50 hover:scale-105 hover:bg-green-600 hover:text-black disabled:opacity-50"
					type="submit"
					disabled={busy}
					name="action"
					value="import_perks"
				>
					{busy
						? "Processing..."
						: `Perks (${loaderData?.tableCounts?.traits || 0})`}
				</button>
				<button
					className="transform border border-green-500 bg-black px-4 py-2 text-sm text-green-500 transition duration-50 hover:scale-105 hover:bg-green-600 hover:text-black disabled:opacity-50"
					type="submit"
					disabled={busy}
					name="action"
					value="import_skins"
				>
					{busy
						? "Processing..."
						: `Skins (${loaderData?.tableCounts?.skins || 0})`}
				</button>
				<button
					className="transform border border-green-500 bg-black px-4 py-2 text-sm text-green-500 transition duration-50 hover:scale-105 hover:bg-green-600 hover:text-black disabled:opacity-50"
					type="submit"
					disabled={busy}
					name="action"
					value="import_curios"
				>
					{busy
						? "Processing..."
						: `Curios (${loaderData?.tableCounts?.curios || 0})`}
				</button>
				<button
					className="transform border border-green-500 bg-black px-4 py-2 text-sm text-green-500 transition duration-50 hover:scale-105 hover:bg-green-600 hover:text-black disabled:opacity-50"
					type="submit"
					disabled={busy}
					name="action"
					value="import_weapons"
				>
					{busy
						? "Processing..."
						: `Weapons (${loaderData?.tableCounts?.weapons || 0})`}
				</button>
				<button
					className="transform border border-red-500 bg-black px-4 py-2 text-sm text-red-500 transition duration-50 hover:scale-105 hover:bg-red-600 hover:text-black disabled:opacity-50"
					type="submit"
					disabled={busy}
					name="action"
					value="delete"
				>
					{busy ? "Purging..." : "Purge All Data"}
				</button>
			</fetcher.Form>
		</div>
	)
}
