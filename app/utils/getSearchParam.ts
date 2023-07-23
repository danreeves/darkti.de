// Returns all values for an array search param or a fallback value
export function getSearchParam<T>(
	searchParams: URLSearchParams,
	key: string,
	fallback: T,
): string[] | T {
	return searchParams.has(key) ? searchParams.getAll(key) : fallback
}
