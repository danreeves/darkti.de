import { PrismaClient } from "@prisma/client"

let prisma: PrismaClient

declare global {
  var __db__: PrismaClient
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient()
} else {
  // In development only create one client when hot reloading the server
  if (!globalThis.__db__) {
    globalThis.__db__ = new PrismaClient()
  }
  prisma = globalThis.__db__
}

export { prisma }
