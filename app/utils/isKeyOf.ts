export function isKeyOf<Obj extends Record<string | number | symbol, unknown>>(
	obj: Obj,
	key: string | number | symbol | null | undefined,
): key is keyof Obj {
	if (key == null) {
		return false
	}
	return key in obj
}
