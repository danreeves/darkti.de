import { sortBy } from "lodash"
import ITEM_DATA from "./exported/item_master_list.json"
import type { ZodSchema } from "zod"
import { filterBySchema } from "./utils.server"

export async function getItems<Schema extends ZodSchema>(
  schema: Schema,
  {
    item_type,
    archetypes,
    name,
  }: {
    item_type?: string[]
    archetypes?: string[]
    name?: string
  } = {}
) {
  const items = sortBy(filterBySchema(ITEM_DATA, schema), "baseName")
  return items.filter((item) => {
    const keepItemType =
      !item_type || (item_type && item_type.includes(item.item_type))
    const keepArchetype =
      !archetypes ||
      (archetypes &&
        item.archetypes?.some((arch: string) => archetypes.includes(arch)))
    const keepName =
      !name ||
      (name && item.display_name.toLowerCase().includes(name.toLowerCase()))
    return keepItemType && keepArchetype && keepName
  })
}

export async function getItem<Schema extends ZodSchema>(
  schema: Schema,
  slug: string
) {
  const items = sortBy(filterBySchema(ITEM_DATA, schema), "baseName")
  return items.find((item) => item.slug === slug)
}
