import z from "zod"
import { t } from "./localization.server"

export const WeaponSchema = z
  .object({
    slots: z.array(
      z.union([z.literal("slot_secondary"), z.literal("slot_primary")])
    ),
    item_type: z.union([z.literal("WEAPON_RANGED"), z.literal("WEAPON_MELEE")]),
    hud_icon: z.string(),
    preview_image: z.string(),
    weapon_template: z.string(),
    feature_flags: z.array(z.string()),
    wieldable_slot_scripts: z.union([z.any(), z.array(z.string())]).optional(),
    id: z.string(),
    archetypes: z.array(
      z.union([
        z.literal("veteran"),
        z.literal("zealot"),
        z.literal("psyker"),
        z.literal("ogryn"),
      ])
    ),
    breeds: z.array(z.union([z.literal("human"), z.literal("ogryn")])),
    display_name: z.string(),
    workflow_state: z.string(),
    description: z.string(),
  })
  .transform((item) => {
    let baseName = item.id.split("/").at(-1)!
    let slug = baseName?.replaceAll("_", "-")!
    let item_type = item.item_type.replace("WEAPON_", "").toLowerCase()
    let slots =
      Array.isArray(item.slots) && item.slots.length
        ? item.slots.map((slot) => slot.replace("slot_", "").toLowerCase())
        : []
    let display_name = t(item.display_name)
    let description = item.description ? t(item.description) : undefined
    let tags: string[] = [item_type, ...slots]
    return {
      ...item,
      display_name,
      description,
      item_type,
      slug,
      baseName,
      slots,
      tags,
    }
  })

export const CurioSchema = z
  .object({
    slots: z.array(
      z.union([
        z.literal("slot_attachment_1"),
        z.literal("slot_attachment_2"),
        z.literal("slot_attachment_3"),
      ])
    ),
    item_type: z.literal("GADGET"),
    preview_image: z.string(),
    feature_flags: z.array(z.string()),
    id: z.string(),
    display_name: z.string(),
    workflow_state: z.string(),
  })
  .transform((item) => {
    let baseName = item.id.split("/").at(-1)!
    let slug = baseName?.replaceAll("_", "-")!
    let display_name = t(item.display_name)
    return {
      ...item,
      display_name,
      slug,
      baseName,
    }
  })

export const SkinSchema = z
  .object({
    slots: z.array(z.literal("slot_weapon_skin")),
    item_type: z.literal("WEAPON_SKIN"),
    preview_image: z.string(),
    weapon_template_restriction: z.array(z.string()),
    feature_flags: z.array(z.string()),
    id: z.string(),
    display_name: z.string(),
    workflow_state: z.string(),
    description: z.string().optional(),
  })
  .transform((item) => {
    let baseName = item.id.split("/").at(-1)!
    let slug = baseName?.replaceAll("_", "-")!
    let display_name = t(item.display_name)
    let description = item.description ? t(item.description) : undefined
    return {
      ...item,
      display_name,
      description,
      slug,
      baseName,
    }
  })

export const BlessingSchema = z
  .object({
    item_type: z.literal("TRAIT"),
    icon: z.string(),
    icon_small: z.string(),
    weapon_type_restriction: z.array(z.string()),
    // Broken?
    // weapon_template_restriction: z.array(z.string()).optional(),
    id: z.string(),
    display_name: z.string(),
    description: z.string(),
    // TODO: Empty lists should be nulled in the lua exporter
    description_values: z
      .union([
        z.unknown(),
        z.array(
          z.object({
            string_key: z.string(),
            string_value: z.string(),
            rarity: z.string(),
          })
        ),
      ])
      .optional(),
    trait: z.string(),
  })
  .transform((item) => {
    let baseName = item.id.split("/").at(-1)!
    let slug = baseName?.replaceAll("_", "-")!
    let display_name = t(item.display_name)
    let description = item.description ? t(item.description) : undefined
    return {
      ...item,
      display_name,
      description,
      slug,
      baseName,
    }
  })

  
export const AuthSchema = z.object({
  AccessToken: z.string(),
  ExpiresIn: z.number(),
  RefreshToken: z.string(),
  Sub: z.string(),
})
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
export const LatenciesSchema = z.object({
  regions: z.array(
    z.object({
      region: z.string(),
      httpLatencyUrl: z.string(),
    })
  ),
})

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

export const JoinSchema = z.object({
  queuePosition: z.number(),
  queueTicket: z.string(),
  retrySuggestion: z.number(),
})


export const CharactersSchema = z.object({
  _links: z.object({ self: z.object({ href: z.string() }) }),
  characters: z.array(
    z.union([
      z.object({
        _links: z.object({
          self: z.object({ href: z.string() }),
          data: z.object({ href: z.string(), templated: z.boolean() }),
          statistics: z.object({ href: z.string(), templated: z.boolean() }),
          history: z.object({ href: z.string(), templated: z.boolean() }),
          inventory: z.object({ href: z.string() }),
          gear: z.object({ href: z.string() })
        }),
        id: z.string(),
        name: z.string(),
        inventory: z.object({
          slot_animation_emote_1: z.string(),
          slot_animation_emote_2: z.string(),
          slot_animation_emote_3: z.string(),
          slot_animation_emote_4: z.string(),
          slot_animation_emote_5: z.string(),
          slot_attachment_2: z.string(),
          slot_attachment_3: z.string(),
          slot_attachment_1: z.string(),
          slot_body_legs: z.string(),
          slot_body_face_scar: z.string(),
          slot_secondary: z.string(),
          slot_body_hair: z.string(),
          slot_body_arms: z.string(),
          slot_body_skin_color: z.string(),
          slot_portrait_frame: z.string(),
          slot_body_face: z.string(),
          slot_animation_end_of_round: z.string(),
          slot_gear_lowerbody: z.string(),
          slot_body_eye_color: z.string(),
          slot_insignia: z.string(),
          slot_gear_extra_cosmetic: z.string(),
          slot_body_torso: z.string(),
          slot_body_face_tattoo: z.string(),
          slot_body_hair_color: z.string(),
          slot_body_tattoo: z.string(),
          slot_primary: z.string(),
          slot_body_face_hair: z.string(),
          slot_gear_upperbody: z.string(),
          slot_gear_head: z.string()
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
          talents: z.array(z.string())
        }),
        narrative: z.object({
          events: z.object({
            onboarding_step_mission_board_introduction: z.boolean(),
            level_unlock_crafting_station_visited: z.boolean(),
            level_unlock_credits_store_visited: z.boolean(),
            level_unlock_premium_store_visited: z.boolean(),
            mission_board: z.boolean(),
            level_unlock_barber_visited: z.boolean(),
            onboarding_step_chapel_video_viewed: z.boolean(),
            onboarding_step_chapel_cutscene_played: z.boolean(),
            level_unlock_contract_store_visited: z.boolean()
          }),
          stories: z.object({
            onboarding: z.number(),
            level_unlock_popups: z.number(),
            path_of_trust: z.number()
          })
        }),
        personal: z.object({ character_height: z.number() }),
        prison_number: z.string(),
        memberships: z.array(z.unknown())
      }),
      z.object({
        _links: z.object({
          self: z.object({ href: z.string() }),
          data: z.object({ href: z.string(), templated: z.boolean() }),
          statistics: z.object({ href: z.string(), templated: z.boolean() }),
          history: z.object({ href: z.string(), templated: z.boolean() }),
          inventory: z.object({ href: z.string() }),
          gear: z.object({ href: z.string() })
        }),
        id: z.string(),
        name: z.string(),
        inventory: z.object({
          slot_attachment_2: z.string(),
          slot_attachment_1: z.string(),
          slot_body_legs: z.string(),
          slot_body_face_scar: z.string(),
          slot_secondary: z.string(),
          slot_body_hair: z.string(),
          slot_body_arms: z.string(),
          slot_body_skin_color: z.string(),
          slot_portrait_frame: z.string(),
          slot_body_face: z.string(),
          slot_animation_end_of_round: z.string(),
          slot_gear_lowerbody: z.string(),
          slot_body_eye_color: z.string(),
          slot_insignia: z.string(),
          slot_gear_extra_cosmetic: z.string(),
          slot_body_torso: z.string(),
          slot_body_face_tattoo: z.string(),
          slot_body_hair_color: z.string(),
          slot_body_tattoo: z.string(),
          slot_primary: z.string(),
          slot_body_face_hair: z.string(),
          slot_gear_upperbody: z.string(),
          slot_gear_head: z.string()
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
          talents: z.array(z.string())
        }),
        narrative: z.object({
          events: z.object({
            level_unlock_crafting_station_visited: z.boolean(),
            onboarding_step_mission_board_introduction: z.boolean(),
            level_unlock_credits_store_visited: z.boolean(),
            level_unlock_premium_store_visited: z.boolean(),
            mission_board: z.boolean(),
            level_unlock_barber_visited: z.boolean(),
            onboarding_step_chapel_video_viewed: z.boolean(),
            onboarding_step_chapel_cutscene_played: z.boolean(),
            level_unlock_contract_store_visited: z.boolean()
          }),
          stories: z.object({
            onboarding: z.number(),
            level_unlock_popups: z.number(),
            path_of_trust: z.number()
          })
        }),
        personal: z.object({ character_height: z.number() }),
        prison_number: z.string(),
        memberships: z.array(z.unknown())
      }),
      z.object({
        _links: z.object({
          self: z.object({ href: z.string() }),
          data: z.object({ href: z.string(), templated: z.boolean() }),
          statistics: z.object({ href: z.string(), templated: z.boolean() }),
          history: z.object({ href: z.string(), templated: z.boolean() }),
          inventory: z.object({ href: z.string() }),
          gear: z.object({ href: z.string() })
        }),
        id: z.string(),
        name: z.string(),
        inventory: z.object({
          slot_body_legs: z.string(),
          slot_body_face_scar: z.string(),
          slot_secondary: z.string(),
          slot_body_hair: z.string(),
          slot_body_arms: z.string(),
          slot_body_skin_color: z.string(),
          slot_portrait_frame: z.string(),
          slot_body_face: z.string(),
          slot_animation_end_of_round: z.string(),
          slot_gear_lowerbody: z.string(),
          slot_body_eye_color: z.string(),
          slot_insignia: z.string(),
          slot_gear_extra_cosmetic: z.string(),
          slot_body_torso: z.string(),
          slot_body_face_tattoo: z.string(),
          slot_body_hair_color: z.string(),
          slot_body_tattoo: z.string(),
          slot_primary: z.string(),
          slot_body_face_hair: z.string(),
          slot_gear_upperbody: z.string(),
          slot_gear_head: z.string()
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
        career: z.object({ specialization: z.string() }),
        narrative: z.object({
          events: z.object({
            onboarding_step_chapel_video_viewed: z.boolean(),
            onboarding_step_chapel_cutscene_played: z.boolean()
          }),
          stories: z.object({ onboarding: z.number() })
        }),
        personal: z.object({ character_height: z.number() }),
        prison_number: z.string(),
        memberships: z.array(z.unknown())
      })
    ])
  )
})

export const ShopSchema = z.object({
  _links: z.object({
    self: z.object({ href: z.string() }),
    config: z.object({ href: z.string() })
  }),
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
    z.union([
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
            perks: z.array(z.unknown()),
            base_stats: z.array(
              z.object({ name: z.string(), value: z.number() })
            )
          })
        }),
        media: z.array(z.unknown())
      }),
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
            perks: z.array(z.object({ id: z.string(), rarity: z.number() })),
            base_stats: z.array(
              z.object({ name: z.string(), value: z.number() })
            )
          })
        }),
        media: z.array(z.unknown())
      }),
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
            traits: z.array(z.object({ id: z.string(), rarity: z.number() })),
            perks: z.array(z.object({ id: z.string(), rarity: z.number() })),
            base_stats: z.array(
              z.object({ name: z.string(), value: z.number() })
            )
          })
        }),
        media: z.array(z.unknown())
      }),
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
            perks: z.array(z.object({ id: z.string(), rarity: z.number() })),
            traits: z.array(
              z.object({
                id: z.string(),
                rarity: z.number(),
                value: z.number()
              })
            )
          })
        }),
        media: z.array(z.unknown())
      })
    ])
  ),
  rerollsThisRotation: z.number(),
  currentRotationEnd: z.string()
})
