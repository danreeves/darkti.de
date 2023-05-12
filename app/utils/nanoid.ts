import { customAlphabet } from "nanoid"
import nanoidDictionary from "nanoid-dictionary"

let { nolookalikesSafe } = nanoidDictionary

const _nanoid = customAlphabet(nolookalikesSafe, 14)

export function nanoid() {
	return _nanoid()
}
