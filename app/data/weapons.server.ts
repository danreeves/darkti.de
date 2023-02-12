import items from "./exported/item_master_list.json"

const MASSAGED_DATA = items
	.filter(
		(item) =>
			item.item_type === "WEAPON_MELEE" || item.item_type === "WEAPON_RANGED"
	)
	.filter((item) => item.display_name)
	.filter((item) => Array.isArray(item.slots) && item.slots.length)
	.map((item) => {
		let baseName = item.id.split("/").at(-1)
		let slug = baseName?.replaceAll("_", "-")
		return {
			...item,
			slug,
			baseName,
		}
	})
	.filter((item) => item.slug && item.baseName)

export async function getWeapons() {
	return MASSAGED_DATA
}

export async function getWeapon(slug: string) {
	return MASSAGED_DATA.find((weapon) => weapon.slug === slug)
}
