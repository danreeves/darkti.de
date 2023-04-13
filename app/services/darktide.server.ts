import type { AuthToken } from "@prisma/client"
import { map } from "lodash"
import z from "zod"

let JoinSchema = z.object({
  queuePosition: z.number(),
  queueTicket: z.string(),
  retrySuggestion: z.number(),
})

export async function joinQueue(sessionTicket: string) {
  let url = "https://bsp-auth-prod.atoma.cloud/queue/join"
  let response = await fetch(url, {
    headers: {
      authorization: `Steam ${sessionTicket}`,
    },
  })
  if (response.ok) {
    let data = await response.json()
    let result = JoinSchema.safeParse(data)
    if (result.success) {
      return result.data
    }
  }
}

let AuthSchema = z.object({
  AccessToken: z.string(),
  ExpiresIn: z.number(),
  RefreshToken: z.string(),
  Sub: z.string(),
})

export async function checkToken(token: string) {
  let url = "https://bsp-auth-prod.atoma.cloud/queue/check"
  let response = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  if (response.ok) {
    let data = await response.json()
    let result = AuthSchema.safeParse(data)
    if (result.success) {
      return result.data
    }
  }
}

export async function refreshToken(refreshToken: string) {
  let url = "https://bsp-auth-prod.atoma.cloud/queue/refresh"
  let response = await fetch(url, {
    headers: {
      authorization: `Bearer ${refreshToken}`,
    },
  })
  if (response.ok) {
    let data = await response.json()
    let result = AuthSchema.safeParse(data)
    if (result.success) {
      return result.data
    }
  } else {
    console.log(response)
  }
}

export async function getCharacters(auth: AuthToken) {
  let url = `https://bsp-td-prod.atoma.cloud/data/${auth.sub}/characters`

  let response = await fetch(url, {
    headers: {
      authorization: `Bearer ${auth.accessToken}`,
    },
  })

  if (response.ok) {
    let data = await response.json()
    return data
  }
}

let MissionBoardSchema = z.object({
  missions: z.array(
    z.object({
      id: z.string(),
      map: z.string(),
      circumstance: z.string(),
      flags: z.unknown(),
      credits: z.number(),
      xp: z.number(),
      extraRewards: z.unknown(),
      challenge: z.number(),
      resistance: z.number(),
      start: z.string(),
      expiry: z.string(),
      requiredLevel: z.number(),
      missionGiver: z.string(),
      displayIndex: z.number(),
    })
  ),
  refreshAt: z.string(),
  _links: z.unknown(),
})
export async function getMissions(auth: AuthToken) {
  let url = `https://bsp-td-prod.atoma.cloud/mission-board`

  let response = await fetch(url, {
    headers: {
      authorization: `Bearer ${auth.accessToken}`,
    },
  })

  if (response.ok) {
    let data = await response.json()
    let result = MissionBoardSchema.safeParse(data)
    if (result.success) {
      return result.data
    }
  }
}

let LatenciesSchema = z.object({
  regions: z.array(
    z.object({
      region: z.string(),
      httpLatencyUrl: z.string(),
    })
  ),
})
export async function getLatencies(auth: AuthToken) {
  let url = `https://bsp-td-prod.atoma.cloud/matchmaker/regions`

  let response = await fetch(url, {
    headers: {
      authorization: `Bearer ${auth.accessToken}`,
    },
  })

  if (response.ok) {
    let data = await response.json()
    let result = LatenciesSchema.safeParse(data)
    if (result.success) {
      return result.data
    }
  }
}

let AccountSummarySchema = z.object({
  summary: z.object({
    sub: z.string(),
    name: z.string(),
    characters: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        inventory: z.record(z.string()),
        breed: z.string(),
        archetype: z.string(),
        gender: z.string(),
        lore: z.unknown(),
        selectedVoice: z.string().optional(),
        abilities: z.unknown(),
        career: z.object({
          specialization: z.string(),
          talents: z.array(z.string()).optional(),
        }),
        narrative: z.unknown(),
        personal: z.unknown(),
        prison_number: z.string(),
      })
    ),
    data: z.array(z.unknown()),
    currencies: z.array(z.unknown()),
    statistics: z.array(z.unknown()),
    consumables: z.array(z.unknown()),
    activeEffects: z.array(z.unknown()),
    progression: z.object({
      type: z.literal("account"),
      id: z.string(),
      currentLevel: z.number(),
      currentXp: z.number(),
      currentXpInLevel: z.number(),
      neededXpForNextLevel: z.number(),
      unclaimedRewards: z.array(z.unknown()),
      eligibleForLevel: z.boolean(),
    }),
  }),
})
export async function getAccountSummary(auth: AuthToken) {
  let url = `https://bsp-td-prod.atoma.cloud/data/${auth.sub}/account/summary`

  let response = await fetch(url, {
    headers: {
      authorization: `Bearer ${auth.accessToken}`,
    },
  })

  if (response.ok) {
    let data = await response.json()
    let result = AccountSummarySchema.safeParse(data)
    if (result.success) {
      return result.data
    }
  }
}

let AccountGearSchema = z.object({
  gearList: z.record(
    z.object({
      slots: z.array(z.string()),
      masterDataInstance: z.object({
        id: z.string(),
        overrides: z
          .object({
            ver: z.number().optional(),
            traits: z
              .array(
                z.object({
                  value: z.number().optional(),
                  id: z.string(),
                  rarity: z.number(),
                })
              )
              .optional(),
            perks: z
              .array(
                z.object({
                  value: z.number().optional(),
                  id: z.string(),
                  rarity: z.number(),
                })
              )
              .optional(),
            characterLevel: z.number().optional(),
            baseItemLevel: z.number().optional(),
            baseStats: z
              .array(z.object({ name: z.string(), value: z.number() }))
              .optional(),
            rarity: z.number().optional(),
            itemLevel: z.number().optional(),
          })
          .optional(),
      }),
      characterId: z.string().optional(),
    })
  ),
})
export async function getAccountGear(auth: AuthToken) {
  let url = `https://bsp-td-prod.atoma.cloud/data/${auth.sub}/account/gear`

  let response = await fetch(url, {
    headers: {
      authorization: `Bearer ${auth.accessToken}`,
    },
  })

  if (response.ok) {
    let data = await response.json()
    let result = AccountGearSchema.safeParse(data)
    if (result.success) {
      return result.data.gearList
    }
  }
}

let AccountTraitSchema = z.object({
  numRanks: z.number(),
  stickerBook: z.record(z.number()),
})
export async function getAccountTrait(auth: AuthToken, traitCategory: string) {
  let url = `https://bsp-td-prod.atoma.cloud/data/${auth.sub}/account/traits/${traitCategory}`

  let response = await fetch(url, {
    headers: {
      authorization: `Bearer ${auth.accessToken}`,
    },
  })

  if (response.ok) {
    let data = await response.json()
    let result = AccountTraitSchema.safeParse(data)
    if (result.success) {
      let { numRanks, stickerBook } = result.data
      return Object.entries(stickerBook).map(([trait, bitmask]) => {
        let ranks: ("seen" | "unseen" | "invalid")[] = []
        for (let i = 0; i <= numRanks - 1; i++) {
          if (((bitmask >> (i + 1 + 3)) & 1) === 0) {
            ranks[i] = "invalid"
          } else if (((bitmask >> (i + 1 - 1)) & 1) === 1) {
            ranks[i] = "seen"
          } else {
            ranks[i] = "unseen"
          }
        }
        return {
          trait,
          ranks,
        }
      })
    }
  }
}
