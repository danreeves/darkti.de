export function idToSlug(id: string): string {
	return id.replaceAll("/", "-")
}

export function slugToId(slug: string): string {
	return slug.replaceAll("-", "/")
}
