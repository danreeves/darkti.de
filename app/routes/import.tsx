import { useFetcher } from "react-router"
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

export async function loader({ context }: Route.LoaderArgs) {
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
			className={`m-10 mx-auto flex w-xl flex-col items-center justify-center rounded border border-gray-200 p-4 text-white ${busy ? "opacity-50" : ""}`}
		>
			<h1 className="mb-4 text-2xl font-bold">Import</h1>
			{success === true ? (
				<p className="text-green-500">Operation successful!</p>
			) : success === false ? (
				<p className="text-red-500">Import failed. {message}</p>
			) : null}

			{loaderData ? (
				<p>
					Total items:{" "}
					{Object.values(loaderData.tableCounts).reduce(
						(sum, count) => sum + count,
						0,
					)}
					across {Object.keys(loaderData.tableCounts).length} tables
				</p>
			) : null}

			<fetcher.Form
				method="post"
				className="m-4 flex w-lg flex-wrap content-center items-center justify-center gap-1"
			>
				<button
					className="rounded-md bg-blue-400 p-2 text-sm text-white"
					type="submit"
					disabled={busy}
					name="action"
					value="import_circumstance_templates"
				>
					{busy
						? "Loading..."
						: `Circumstances (${loaderData?.tableCounts?.circumstanceTemplates || 0})`}
				</button>
				<button
					className="rounded-md bg-blue-400 p-2 text-sm text-white"
					type="submit"
					disabled={busy}
					name="action"
					value="import_mission_templates"
				>
					{busy
						? "Loading..."
						: `Mission Templates (${loaderData?.tableCounts?.missionTemplates || 0})`}
				</button>
				<button
					className="rounded-md bg-blue-400 p-2 text-sm text-white"
					type="submit"
					disabled={busy}
					name="action"
					value="import_mission_types"
				>
					{busy
						? "Loading..."
						: `Mission Types (${loaderData?.tableCounts?.missionTypes || 0})`}
				</button>
				<button
					className="rounded-md bg-blue-400 p-2 text-sm text-white"
					type="submit"
					disabled={busy}
					name="action"
					value="import_zones"
				>
					{busy
						? "Loading..."
						: `Zones (${loaderData?.tableCounts?.zones || 0})`}
				</button>
				<button
					className="rounded-md bg-purple-400 p-2 text-sm text-white"
					type="submit"
					disabled={busy}
					name="action"
					value="import_blessings"
				>
					{busy
						? "Loading..."
						: `Blessings (${loaderData?.tableCounts?.traits || 0})`}
				</button>
				<button
					className="rounded-md bg-purple-400 p-2 text-sm text-white"
					type="submit"
					disabled={busy}
					name="action"
					value="import_perks"
				>
					{busy
						? "Loading..."
						: `Perks (${loaderData?.tableCounts?.traits || 0})`}
				</button>
				<button
					className="rounded-md bg-purple-400 p-2 text-sm text-white"
					type="submit"
					disabled={busy}
					name="action"
					value="import_skins"
				>
					{busy
						? "Loading..."
						: `Skins (${loaderData?.tableCounts?.skins || 0})`}
				</button>
				<button
					className="rounded-md bg-purple-400 p-2 text-sm text-white"
					type="submit"
					disabled={busy}
					name="action"
					value="import_curios"
				>
					{busy
						? "Loading..."
						: `Curios (${loaderData?.tableCounts?.curios || 0})`}
				</button>
				<button
					className="rounded-md bg-purple-400 p-2 text-sm text-white"
					type="submit"
					disabled={busy}
					name="action"
					value="import_weapons"
				>
					{busy
						? "Loading..."
						: `Weapons (${loaderData?.tableCounts?.weapons || 0})`}
				</button>
				<button
					className="rounded-md bg-red-400 p-2 text-sm text-white"
					type="submit"
					disabled={busy}
					name="action"
					value="delete"
				>
					{busy ? "Loading..." : "Delete All"}
				</button>
			</fetcher.Form>
		</div>
	)
}
