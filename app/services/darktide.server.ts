import { AuthToken } from "@prisma/client"
import { map } from "lodash"
import z from "zod"

export const JoinSchema = z.object({
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

export const AuthSchema = z.object({
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

export const CharactersSchema = z.object({
  characters: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        inventory: z.object({
          slot_animation_emote_1: z.string().optional(),
          slot_animation_emote_2: z.string().optional(),
          slot_animation_emote_3: z.string().optional(),
          slot_animation_emote_4: z.string().optional(),
          slot_animation_emote_5: z.string().optional(),
          slot_attachment_2: z.string().optional(),
          slot_attachment_3: z.string().optional(),
          slot_attachment_1: z.string().optional(),
          slot_body_legs: z.string().optional(),
          slot_body_face_scar: z.string().optional(),
          slot_secondary: z.string().optional(),
          slot_body_hair: z.string().optional(),
          slot_body_arms: z.string().optional(),
          slot_body_skin_color: z.string().optional(),
          slot_portrait_frame: z.string().optional(),
          slot_body_face: z.string().optional(),
          slot_animation_end_of_round: z.string().optional(),
          slot_gear_lowerbody: z.string().optional(),
          slot_body_eye_color: z.string().optional(),
          slot_insignia: z.string().optional(),
          slot_gear_extra_cosmetic: z.string().optional(),
          slot_body_torso: z.string().optional(),
          slot_body_face_tattoo: z.string().optional(),
          slot_body_hair_color: z.string().optional(),
          slot_body_tattoo: z.string().optional(),
          slot_primary: z.string().optional(),
          slot_body_face_hair: z.string().optional(),
          slot_gear_upperbody: z.string().optional(),
          slot_gear_head: z.string().optional()
        }),
        breed: z.string(),
        archetype: z.string(),
        gender: z.string(),
        lore: z.object({
          backstory: z.object({
            crime: z.string(),
            formative_event: z.string(),
            growing_up: z.string(),
            childhood: z.string(),
            personality: z.string(),
            planet: z.string()
          })
        }),
        selected_voice: z.string(),
        abilities: z.object({
          grenade_ability: z.string(),
          combat_ability: z.string()
        }),
        career: z.object({
          specialization: z.string(),
          talents: z.array(z.string()).optional()
        }),
        narrative: z.object({
          events: z.object({
            onboarding_step_mission_board_introduction: z.boolean().optional(),
            level_unlock_crafting_station_visited: z.boolean().optional(),
            level_unlock_credits_store_visited: z.boolean().optional(),
            level_unlock_premium_store_visited: z.boolean().optional(),
            mission_board: z.boolean().optional(),
            level_unlock_barber_visited: z.boolean().optional(),
            onboarding_step_chapel_video_viewed: z.boolean().optional(),
            onboarding_step_chapel_cutscene_played: z.boolean().optional(),
            level_unlock_contract_store_visited: z.boolean().optional()
          }),
          stories: z.object({
            onboarding: z.number(),
            level_unlock_popups: z.number().optional(),
            path_of_trust: z.number().optional()
          })
        }),
        personal: z.object({ character_height: z.number() }),
        prison_number: z.string(),
        memberships: z.array(z.unknown())
      }),
  )
})
export async function getCharacters(auth: AuthToken) {
  let url = `https://bsp-td-prod.atoma.cloud/data/${auth.sub}/characters`

  let response = await fetch(url, {
    headers: {
      authorization: `Bearer ${auth.accessToken}`,
    },
  })

  if (response.ok) {
    let data = await response.json()
    
    let result = CharactersSchema.safeParse(data)
    if(result.success){
      return result.data
    }else{
      console.log(result.error)
    }
  } else {
    console.log(response)
  }
}

export const MissionBoardSchema = z.object({
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

export const LatenciesSchema = z.object({
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

export const AccountSummarySchema = z.object({
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


// Account 
export const AccountGearSchema = z.object({
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

export const CharacterStoreSchema = z.object({
  catalog: z.object({
    id: z.string(),
    name: z.string(),
    generation: z.number(),
    layoutRef: z.string(),
    validFrom: z.string(),
    validTo: z.string()
  }),
  name: z.string(),
  public: z.array(z.unknown()),
  personal: z.array(
        z.object({
        offerId: z.string(),
        sku: z.object({
          id: z.string(),
          displayPriority: z.number(),
          internalName: z.string(),
          name: z.string(),
          description: z.string(),
          category: z.string(),
          assetId: z.string(),
          tags: z.array(z.unknown()),
          dlcReq: z.array(z.unknown())
        }),
        entitlement: z.object({
          id: z.string(),
          limit: z.number(),
          type: z.string()
        }),
        price: z.object({
          amount: z.object({ amount: z.number(), type: z.string() }),
          id: z.string(),
          priority: z.number(),
          priceFormula: z.string()
        }),
        state: z.string(),
        description: z.object({
          id: z.string(),
          gearId: z.string(),
          rotation: z.string(),
          type: z.string(),
          properties: z.object({}),
          overrides: z.object({
            ver: z.number(),
            rarity: z.number(),
            characterLevel: z.number(),
            itemLevel: z.number(),
            baseItemLevel: z.number(),
            traits: z.array(z.unknown()),
            perks: z.array(z.object({id: z.string(), rarity: z.number()})).optional(),
            base_stats: z.array(
              z.object({ name: z.string(), value: z.number() })
            ).optional()
          })
        }),
        media: z.array(z.unknown())
      }).optional(),    
  ),
  rerollsThisRotation: z.number(),
  currentRotationEnd: z.string()
})
export async function getCharacterStore(auth: AuthToken, characterArchetype: string, characterId: string) {
  let url = `https://bsp-td-prod.atoma.cloud/store/storefront/credits_store_${characterArchetype}?accountId=${auth.sub}&characterId=${characterId}&personal=true`
    let response = await fetch(url, {
    headers: {
      authorization: `Bearer ${auth.accessToken}`,
    },
  })

  if (response.ok) {
    let data = await response.json()
    let result = CharacterStoreSchema.safeParse(data)
    if (result.success) {
      return result.data
    } else {
      console.log(result.error)
    }

  }
  
}