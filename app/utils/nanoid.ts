import { customAlphabet } from "nanoid"
import { nolookalikesSafe } from "nanoid-dictionary"

const _nanoid = customAlphabet(nolookalikesSafe, 14)

export function nanoid() {
	return _nanoid()
}
