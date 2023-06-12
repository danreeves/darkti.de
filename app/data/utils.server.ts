import type { ZodSchema } from "zod"
import { z } from "zod"
import memoize from "memoizee"

function _filterBySchema<Schema extends ZodSchema>(
	input: unknown[],
	schema: Schema
): z.infer<Schema>[] {
	return z
		.any()
		.array()
		.transform((arr) =>
			arr
				.map((item) => {
					let result = schema.safeParse(item)
					if (result.success) {
						return result.data
					}
					return undefined
				})
				.filter(Boolean)
		)
		.parse(input)
}

export const filterBySchema = memoize(_filterBySchema)

/**
 * Replaces all instances of a term in a sentence
 * @param sentence - Sentence to process
 * @param wordsToReplace - Object with keys of the tokens and the replacement values {replacekey: replacevalue, replacekey2: replacevalue2}
 * @returns  the processed string
 */
export function replaceAll(
	sentence: string,
	wordsToReplace: { [key: string]: string }
) {
	return Object.keys(wordsToReplace).reduce(
		(f, s, i) => `${f}`.replace(new RegExp(s, "ig"), wordsToReplace[s]),
		sentence
	)
}
