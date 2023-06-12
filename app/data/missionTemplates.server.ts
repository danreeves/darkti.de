import { filterBySchema } from "./utils.server"
import { z } from "zod"
import RAW_MISSION_TEMPLATES from "./exported/mission_templates.json"
import RAW_MISSION_TYPES from "./exported/mission_types.json"
import RAW_CIRCUMSTANCE_TEMPLATES from "./exported/circumstance_templates.json"

let MissionTemplateSchema = z.object({
	name: z.string(),
	display_name: z.string(),
	zone_id: z.string(),
	texture_small: z.string(),
	texture_medium: z.string(),
	texture_big: z.string(),
	objectives: z.string(),
	coordinates: z.string(),
	type: z.string(),
	description: z.string(),
})

export function getMissionTemplates() {
	return filterBySchema(RAW_MISSION_TEMPLATES, MissionTemplateSchema)
}

export function getMissionTemplate(name: string) {
	let templates = getMissionTemplates()
	return templates.find((template) => template.name === name)
}

let CircumstanceSchema = z.record(
	z.string(),
	z.object({
		description: z.string(),
		display_name: z.string(),
		happening_display_name: z.string().optional(),
		favourable_to_players: z.boolean().optional(),
		icon: z.string(),
	})
)

export let CircumstanceTemplates = CircumstanceSchema.parse(
	RAW_CIRCUMSTANCE_TEMPLATES
)

let MissionTypeSchema = z.record(
	z.string(),
	z.object({
		id: z.number(),
		name: z.string(),
		icon: z.string(),
	})
)

export let MissionTypes = MissionTypeSchema.parse(RAW_MISSION_TYPES)
