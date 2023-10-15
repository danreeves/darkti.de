export function isRecord(
	input: unknown,
): input is Record<string | number | symbol, unknown> {
	return typeof input === "object" && input != null
}
