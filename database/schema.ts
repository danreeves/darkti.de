import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { z } from "zod"
import { createInsertSchema } from "drizzle-zod"
import _LOCALIZATION from "../exported/localization_en.json"
const LOCALIZATION: Record<string, string> = _LOCALIZATION

export const guestBook = sqliteTable("guestBook", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	email: text().notNull().unique(),
})

export const circumstanceTemplates = sqliteTable("circumstanceTemplates", {
	key: text().primaryKey(),
	description: text().notNull(),
	display_name: text().notNull(),
	happening_display_name: text(),
	favourable_to_players: integer(), // Use integer to represent boolean (0 or 1)
	icon: text().notNull(),
})

export const CircumstanceTemplateSchemaJSON = z
	.object({
		key: z.string(),
		description: z.string(),
		display_name: z.string(),
		happening_display_name: z.string().optional(),
		favourable_to_players: z.boolean().optional(),
		icon: z.string(),
	})
	.transform((data) => ({
		...data,
		// Transform the boolean to integer (0 or 1)
		favourable_to_players: data.favourable_to_players ? 1 : 0,
		display_name: LOCALIZATION[data.display_name] || data.display_name,
		description: LOCALIZATION[data.description] || data.description,
		happening_display_name: data.happening_display_name
			? LOCALIZATION[data.happening_display_name]
			: undefined,
	}))

export const CircumstanceTemplateInsertSchema = createInsertSchema(
	circumstanceTemplates,
)

export const missionTemplates = sqliteTable("missionTemplates", {
	name: text().primaryKey(),
	display_name: text().notNull(),
	zone_id: text().notNull(),
	texture_small: text(),
	texture_medium: text(),
	texture_big: text(),
	objectives: text().notNull(),
	coordinates: text(),
	type: text(),
	description: text(),
})

export const MissionTemplateInsertSchema = createInsertSchema(
	missionTemplates,
).transform((data) => ({
	...data,
	// Localize the display_name and description
	display_name: LOCALIZATION[data.display_name] || data.display_name,
	description: data.description ? LOCALIZATION[data.description] : undefined,
}))

export const missionTypes = sqliteTable("missionTypes", {
	key: text().primaryKey(),
	index: integer(),
	name: text().notNull(),
	icon: text().notNull(),
})

export const MissionTypeInsertSchema = createInsertSchema(
	missionTypes,
).transform((data) => ({
	...data,
	// Localize the name
	name: LOCALIZATION[data.name] || data.name,
}))

export const zones = sqliteTable("zones", {
	key: text().primaryKey(),
	name: text().notNull(),
	name_short: text(),
	map_node: text(),
	images_mission_vote: text(),
	images_default: text(),
	images_mission_board_details: text(),
})

export const ZoneInsertSchema = createInsertSchema(zones).transform((data) => ({
	...data,
	// Localize the name
	name: LOCALIZATION[data.name] || data.name,
	name_short: data.name_short ? LOCALIZATION[data.name_short] : undefined,
}))

export const traits = sqliteTable("traits", {
	item_type: text().notNull(), // TRAIT or PERK
	icon: text().notNull(),
	icon_small: text().notNull(),
	weapon_type_restriction: text().notNull(), // Store as a JSON string
	weapon_template_restriction: text().notNull(), // Store as a JSON string
	id: text().primaryKey(),
	display_name: text().notNull(),
	description: text().notNull(),
	description_values: text(), // Store as a JSON string
	trait: text().notNull(),
})

export const TraitInsertSchema = createInsertSchema(traits)

const TraitSchema = z
	.object({
		icon: z.string(),
		icon_small: z.string(),
		weapon_type_restriction: z.array(z.string()),
		weapon_template_restriction: z.array(z.string()),
		id: z.string(),
		display_name: z.string(),
		description: z.string(),
		description_values: z
			.array(
				z.object({
					string_key: z.string(),
					string_value: z.string(),
					rarity: z.string(),
				}),
			)
			.optional(),
		trait: z.string(),
	})
	.transform((data) => ({
		...data,
		// Transform the weapon_type_restriction and weapon_template_restriction to arrays
		weapon_type_restriction: JSON.stringify(data.weapon_type_restriction),
		weapon_template_restriction: JSON.stringify(
			data.weapon_template_restriction,
		),
		description_values: data.description_values
			? JSON.stringify(data.description_values)
			: undefined,
		display_name: LOCALIZATION[data.display_name] || data.display_name,
		description: LOCALIZATION[data.description] || data.description,
	}))

export const BlessingSchemaJSON = z.intersection(
	TraitSchema,
	z.object({ item_type: z.literal("TRAIT") }),
)

export const PerkSchemaJSON = z.intersection(
	TraitSchema,
	z.object({ item_type: z.literal("PERK") }),
)

export const skins = sqliteTable("skins", {
	item_type: text().notNull(), // WEAPON_SKIN
	slots: text().notNull(), // Store as a JSON string
	preview_image: text().notNull(),
	weapon_template_restriction: text().notNull(), // Store as a JSON string
	feature_flags: text().notNull(), // Store as a JSON string
	id: text().primaryKey(),
	display_name: text().notNull(),
	workflow_state: text().notNull(),
	description: text(), // Optional
})

export const SkinInsertSchema = createInsertSchema(skins)

export const SkinSchemaJSON = z
	.object({
		slots: z.array(z.literal("slot_weapon_skin")),
		item_type: z.literal("WEAPON_SKIN"),
		preview_image: z.string(),
		weapon_template_restriction: z.array(z.string()),
		feature_flags: z.array(z.string()),
		id: z.string(),
		display_name: z.string(),
		workflow_state: z.string(),
		description: z.string().optional(),
	})
	.transform((data) => ({
		...data,
		// Transform arrays to JSON strings
		slots: JSON.stringify(data.slots),
		weapon_template_restriction: JSON.stringify(
			data.weapon_template_restriction,
		),
		feature_flags: JSON.stringify(data.feature_flags),
		display_name: LOCALIZATION[data.display_name] || data.display_name,
		// Localize the description if it exists
		description: data.description ? LOCALIZATION[data.description] : null,
	}))

export const curios = sqliteTable("curios", {
	item_type: text().notNull(), // GADGET
	slots: text().notNull(), // Store as a JSON string
	preview_image: text().notNull(),
	feature_flags: text().notNull(), // Store as a JSON string
	id: text().primaryKey(),
	display_name: text().notNull(),
	workflow_state: text().notNull(),
})

export const CurioInsertSchema = createInsertSchema(curios)

export const CurioSchemaJSON = z
	.object({
		slots: z.array(
			z.union([
				z.literal("slot_attachment_1"),
				z.literal("slot_attachment_2"),
				z.literal("slot_attachment_3"),
			]),
		),
		item_type: z.literal("GADGET"),
		preview_image: z.string(),
		feature_flags: z.array(z.string()),
		id: z.string(),
		display_name: z.string(),
		workflow_state: z.string(),
	})
	.transform((data) => ({
		...data,
		// Transform arrays to JSON strings
		slots: JSON.stringify(data.slots),
		feature_flags: JSON.stringify(data.feature_flags),
		display_name: LOCALIZATION[data.display_name] || data.display_name,
	}))

export const weapons = sqliteTable("weapons", {
	item_type: text().notNull(), // WEAPON_RANGED or WEAPON_MELEE
	slots: text().notNull(), // Store as a JSON string
	hud_icon: text().notNull(),
	preview_image: text().notNull(),
	weapon_template: text().notNull(),
	feature_flags: text().notNull(), // Store as a JSON string
	// wieldable_slot_scripts: text(), // Store as a JSON string
	id: text().primaryKey(),
	archetypes: text().notNull(), // Store as a JSON string
	breeds: text().notNull(), // Store as a JSON string
	display_name: text().notNull(),
	workflow_state: text().notNull(),
	description: text(),
})

export const WeaponInsertSchema = createInsertSchema(weapons)

export const WeaponSchemaJSON = z
	.object({
		slots: z.array(
			z.union([z.literal("slot_secondary"), z.literal("slot_primary")]),
		),
		item_type: z.union([
			z.literal("WEAPON_RANGED"),
			z.literal("WEAPON_MELEE"),
		]),
		hud_icon: z.string(),
		preview_image: z.string(),
		weapon_template: z.string(),
		feature_flags: z.array(z.string()),
		// wieldable_slot_scripts: z.union([z.any(), z.array(z.string())]).optional(),
		id: z.string(),
		archetypes: z.array(
			z.union([
				z.literal("veteran"),
				z.literal("zealot"),
				z.literal("psyker"),
				z.literal("ogryn"),
				z.literal("adamant"),
				z.literal("broker"),
			]),
		),
		breeds: z.array(z.union([z.literal("human"), z.literal("ogryn")])),
		display_name: z.string(),
		workflow_state: z.string(),
		description: z.string(),
	})
	.transform((data) => ({
		...data,
		// Transform arrays to JSON strings
		slots: JSON.stringify(data.slots),
		feature_flags: JSON.stringify(data.feature_flags),
		archetypes: JSON.stringify(data.archetypes),
		breeds: JSON.stringify(data.breeds),
		display_name: LOCALIZATION[data.display_name] || data.display_name,
		description: data.description ? LOCALIZATION[data.description] : null,
	}))
