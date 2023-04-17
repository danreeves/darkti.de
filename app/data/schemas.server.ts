import z from "zod"
import { t } from "./localization.server"

export const WeaponSchema = z
	.object({
		slots: z.array(
			z.union([z.literal("slot_secondary"), z.literal("slot_primary")])
		),
		item_type: z.union([z.literal("WEAPON_RANGED"), z.literal("WEAPON_MELEE")]),
		hud_icon: z.string(),
		preview_image: z.string(),
		weapon_template: z.string(),
		feature_flags: z.array(z.string()),
		wieldable_slot_scripts: z.union([z.any(), z.array(z.string())]).optional(),
		id: z.string(),
		archetypes: z.array(
			z.union([
				z.literal("veteran"),
				z.literal("zealot"),
				z.literal("psyker"),
				z.literal("ogryn"),
			])
		),
		breeds: z.array(z.union([z.literal("human"), z.literal("ogryn")])),
		display_name: z.string(),
		workflow_state: z.string(),
		description: z.string(),
	})
	.transform((item) => {
		let baseName = item.id.split("/").at(-1)!
		let slug = baseName?.replaceAll("_", "-")!
		let item_type = item.item_type.replace("WEAPON_", "").toLowerCase()
		let slots =
			Array.isArray(item.slots) && item.slots.length
				? item.slots.map((slot) => slot.replace("slot_", "").toLowerCase())
				: []
		let display_name = t(item.display_name)
		let description = item.description ? t(item.description) : undefined
		let tags: string[] = [item_type, ...slots]
		return {
			...item,
			display_name,
			description,
			item_type,
			slug,
			baseName,
			slots,
			tags,
		}
	})

export const CurioSchema = z
	.object({
		slots: z.array(
			z.union([
				z.literal("slot_attachment_1"),
				z.literal("slot_attachment_2"),
				z.literal("slot_attachment_3"),
			])
		),
		item_type: z.literal("GADGET"),
		preview_image: z.string(),
		feature_flags: z.array(z.string()),
		id: z.string(),
		display_name: z.string(),
		workflow_state: z.string(),
	})
	.transform((item) => {
		let baseName = item.id.split("/").at(-1)!
		let slug = baseName?.replaceAll("_", "-")!
		let display_name = t(item.display_name)
		return {
			...item,
			display_name,
			slug,
			baseName,
		}
	})

export const SkinSchema = z
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
	.transform((item) => {
		let baseName = item.id.split("/").at(-1)!
		let slug = baseName?.replaceAll("_", "-")!
		let display_name = t(item.display_name)
		let description = item.description ? t(item.description) : undefined
		return {
			...item,
			display_name,
			description,
			slug,
			baseName,
		}
	})
export const TraitSchema = z
	.object({
		icon: z.string(),
		icon_small: z.string(),
		weapon_type_restriction: z.array(z.string()),
		// Broken?
		// weapon_template_restriction: z.array(z.string()).optional(),
		id: z.string(),
		display_name: z.string(),
		description: z.string(),
		// TODO: Empty lists should be nulled in the lua exporter
		description_values: 
				z.array(
					z.object({
						string_key: z.string(),
						string_value: z.string(),
						rarity: z.string(),
					})
				).optional(),			
		trait: z.string(),
	})
	.transform((item) => {
		let baseName = item.id.split("/").at(-1)!
		let slug = baseName?.replaceAll("_", "-")!
		let display_name = t(item.display_name)
		let description = item.description ? t(item.description) : undefined
		return {
			...item,
			display_name,
			description,
			slug,
			baseName,
		}
	})


export const BlessingSchema = z.intersection(TraitSchema, z.object({ item_type: z.literal("TRAIT") }))
export const PerkSchema = z.intersection(TraitSchema, z.object({ item_type: z.literal("PERK") }))