import { AuthToken } from "@prisma/client"
import { AuthSchema, MissionBoardSchema, LatenciesSchema, AccountSummarySchema, AccountGearSchema, JoinSchema, CharactersSchema, ShopSchema } from "../data/schemas.server"
import { map } from "lodash"
import z from "zod"

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
    
    let result = CharactersSchema.safeParse(data)
    if(result.success){
      return result.data
    }
  } else {
    console.log(response)
  }
}


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
export async function getCharacterStore(auth: AuthToken, characterArchetype: string, characterId: string) {
  let url = `https://bsp-td-prod.atoma.cloud/store/storefront/credits_store_${archetype}?accountId=${auth.sub}&characterId=${id}&personal=true`
    let response = await fetch(url, {
    headers: {
      authorization: `Bearer ${auth.accessToken}`,
    },
  })

  if (response.ok) {
    let data = await response.json()
    let result = ShopSchema.safeParse(data)
    if (result.success) {
      return result.data
    } else {
      console.log(result.error)
    }

  }
  
}