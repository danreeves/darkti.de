import { sortBy } from "lodash"
import items from "./exported/item_master_list.json"
import type { Lang } from "./localization.server"
import { t } from "./localization.server"

const MASSAGED_DATA = sortBy(
  items
    .filter((item) => item.display_name)
    .map((item) => {
      let baseName = item.id.split("/").at(-1)!
      let slug = baseName?.replaceAll("_", "-")!
      let item_type = item.item_type.replace("WEAPON_", "").toLowerCase()
      let slots =
        Array.isArray(item.slots) && item.slots.length
          ? item.slots.map((slot) => slot.replace("slot_", "").toLowerCase())
          : []
      return {
        ...item,
        item_type,
        slug,
        baseName,
        slots,
      }
    })
    .filter((item) => item.slug && item.baseName && item.slots.length),
  "baseName"
)

function localize(item: (typeof MASSAGED_DATA)[number], lang: Lang = "en") {
  let description = item.description
    ? t(item.description ?? "", lang)
    : undefined
  let tags: string[] = [item.item_type].concat(item.slots)
  return {
    ...item,
    display_name: t(item.display_name),
    description,
    tags,
  }
}

export async function getItems({ item_type }: { item_type?: string[] }) {
  return MASSAGED_DATA.filter((item) => {
    return !item_type || (item_type && item_type.includes(item.item_type))
  }).map((item) => localize(item))
}

export async function getItem(slug: string) {
  let item = MASSAGED_DATA.find((item) => item.slug === slug)
  if (item) {
    return localize(item)
  }
}
