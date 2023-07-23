import { prisma } from "~/data/db.server"
import { z } from "zod"

let OwnedTraitsSchema = z.array(
	z.object({
		// weapon pattern basename, e.g. autogun_p1
		weapon: z.string(),
		// traits for weapon pattern
		traits: z.array(
			z.object({
				// trait base name, e.g. allow_flanking_and_increased_damage_when_flanking
				name: z.string(),
				tiers: z
					.array(
						z.union([
							z.literal("OWNED"),
							z.literal("UNOWNED"),
							z.literal("INVALID"),
						]),
					)
					.length(4),
			}),
		),
	}),
)
type OwnedTraits = z.infer<typeof OwnedTraitsSchema>

export async function getUserOwnedTraits(userId: number) {
	let data = await prisma.ownedTraits.findUnique({ where: { userId } })
	if (!data) {
		return
	}
	let result = OwnedTraitsSchema.safeParse(data.traits)
	if (result.success) {
		return {
			lastUpdated: data.lastUpdated,
			traits: result.data,
		}
	}
}

export async function setUserOwnedTraits(userId: number, traits: OwnedTraits) {
	let data = {
		lastUpdated: new Date(),
		traits,
		userId,
	}
	return await prisma.ownedTraits.upsert({
		where: { userId },
		create: data,
		update: data,
	})
}
