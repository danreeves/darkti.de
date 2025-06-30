import type { Config } from "drizzle-kit";

export default {
  out: "./drizzle",
  schema: "./database/schema.ts",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    databaseId: "e5be73b9-28c6-4810-b1b4-aa29a834d29f",
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    token: process.env.CLOUDFLARE_TOKEN!,
  },
} satisfies Config;
