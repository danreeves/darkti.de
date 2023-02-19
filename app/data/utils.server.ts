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
