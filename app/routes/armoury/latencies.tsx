import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import type { Dispatch, SetStateAction } from "react"
import { useEffect, useState } from "react"
import { getAuthToken } from "~/data/authtoken.server"
import { authenticator } from "~/services/auth.server"
import { getLatencies } from "~/services/darktide.server"

export let loader = async ({ request }: LoaderArgs) => {
  let user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  })

  let auth = await getAuthToken(user.id)
  if (auth) {
    let data = await getLatencies(auth)
    return json(data)
  }

  return json({ regions: [] })
}

async function getPings(
  regions: { region: string; httpLatencyUrl: string }[],
  setPings: Dispatch<SetStateAction<Record<string, number>>>
) {
  for (let region of regions) {
    let start = Date.now()
    await fetch(region.httpLatencyUrl)
    let end = Date.now()
    setPings((pings) => ({
      ...pings,
      [region.region]: end - start,
    }))
  }
}

export default function Latencies() {
  let { regions } = useLoaderData<typeof loader>()
  let [pings, setPings] = useState<Record<string, number>>({})

  useEffect(() => {
    getPings(regions, setPings)
  }, [regions])

  useEffect(() => {
    let intervalId = setInterval(() => {
      getPings(regions, setPings)
    }, 10000)
    return () => clearInterval(intervalId)
  }, [regions])

  let list = regions.map((region) => {
    return { label: region.region, ping: pings[region.region] ?? 0 }
  })

  list.sort((a, b) => a.ping - b.ping)

  return (
    <>
      <h1 className="sr-only">Datacenter latencies</h1>
      <div className="my-6 mx-auto w-1/2 rounded bg-white p-6 shadow">
        <ul>
          {list.map((region) => (
            <li key={region.label}>
              <span className="font-bold">{region.label}</span>:{" "}
              {`${region.ping}ms`}
            </li>
          ))}
        </ul>
        <p className="mt-4 italic opacity-70">Refreshes every 10 seconds.</p>
      </div>
    </>
  )
}
