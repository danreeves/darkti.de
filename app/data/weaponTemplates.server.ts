import { filterBySchema } from "./utils.server"
import { z } from "zod"
import RAW_WEAPON_TEMPLATES from "./exported/weapon_templates.json"

let WeaponTemplateSchema = z.object({
	// uses_overheat: z.boolean().optional(),
	// uses_ammunition: z.boolean().optional(),
	// perks: z.record(
	// 	z.object({
	// 		display_name: z.string(),
	// 	})
	// ),
	// displayed_keywords: z.array(
	// 	z.object({
	// 		display_name: z.string(),
	// 	})
	// ),
	// traits: z.array(z.string()),
	// displayed_weapon_stats_table: z.object({
	// 	damage: z.array(z.unknown()),
	// 	stats: z.array(z.unknown()),
	// 	power_stats: z.array(z.unknown()),
	// }),
	base_stats: z.record(z.object({ display_name: z.string() })),
	name: z.string(),
})

export function getWeaponTemplates() {
	return filterBySchema(RAW_WEAPON_TEMPLATES, WeaponTemplateSchema)
}

export function getWeaponTemplate(name: string) {
	let templates = getWeaponTemplates()
	return templates.find((template) => template.name === name)
}
