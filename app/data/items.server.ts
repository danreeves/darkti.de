import { sortBy } from "lodash"
import ITEM_DATA from "./exported/item_master_list.json"
import { t } from "./localization.server"
import z from "zod"
import { filterBySchema } from "./utils.server"

const WeaponSchema = z
	.object({
		slots: z.array(
			z.union([
				z.literal("slot_secondary"),
				z.literal("slot_primary"),
				// z.literal("slot_weapon_skin"),
				z.literal("slot_attachment_1"),
				z.literal("slot_attachment_2"),
				z.literal("slot_attachment_3"),
			])
		),
		item_type: z.union([
			z.literal("WEAPON_RANGED"),
			z.literal("WEAPON_MELEE"),
			z.literal("GADGET"),
		]),
		hud_icon: z.string().optional(),
		preview_image: z.string(),
		weapon_template: z.string().optional(),
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
		).optional(),
		breeds: z.array(z.union([z.literal("human"), z.literal("ogryn")])).optional(),
		display_name: z.string(),
		workflow_state: z.string(),
		description: z.string().optional(),
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

const items = sortBy(filterBySchema(ITEM_DATA, WeaponSchema), "baseName")

export async function getItems({
	item_type,
	archetypes,
	name,
}: {
	item_type?: string[]
	archetypes?: string[]
	name?: string
}) {
	return items.filter((item) => {
		const keepItemType =
			!item_type || (item_type && item_type.includes(item.item_type))
		const keepArchetype =
			!archetypes ||
			(archetypes && item.archetypes?.some((arch) => archetypes.includes(arch)))
		const keepName =
			!name ||
			(name && item.display_name.toLowerCase().includes(name.toLowerCase()))
		return keepItemType && keepArchetype && keepName
	})
}

export async function getItem(slug: string) {
	return items.find((item) => item.slug === slug)
}
