import type { AuthToken } from "@prisma/client"
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

// TODO
// export async function refreshToken(refreshToken: string) {
//   let url = "https://bsp-auth-prod.atoma.cloud/queue/refresh"
//   let response = await fetch(url, {
//     headers: {
//       authorization: `Bearer ${refreshToken}`,
//     },
//   })
//   if (response.ok) {
//     let result = await response.json()
//   }
// }

export async function getCharacters(auth: AuthToken) {
  let url = `https://bsp-td-prod.atoma.cloud/data/${auth.Sub}/characters`

  let response = await fetch(url, {
    headers: {
      authorization: `Bearer ${auth.AccessToken}`,
    },
  })

  if (response.ok) {
    let data = await response.json()
    return data
  }
}
