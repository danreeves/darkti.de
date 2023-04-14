import { ExclamationCircleIcon } from "@heroicons/react/24/outline"
import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { getAuthToken } from "~/data/authtoken.server"
import { authenticator } from "~/services/auth.server"
import { getAccountSummary } from "~/services/darktide.server"

export let loader = async ({ request }: LoaderArgs) => {
  let user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  })

  let auth = await getAuthToken(user.id)
  if (auth) {
    let account = await getAccountSummary(auth)
    let firstCharId = account?.summary.characters[0].id
    if (firstCharId) {
      return redirect(`/armoury/${firstCharId}/inventory`)
    }
  }

  return null
}

export default function ArmouryIndex() {
  return (
    <div className="mx-auto flex max-w-7xl place-content-center px-4 pb-4 pt-6 sm:px-8 lg:px-10">
      <div
        className="flex rounded-lg bg-yellow-100 p-4 text-sm text-yellow-700"
        role="alert"
      >
        <ExclamationCircleIcon
          className="mr-3 inline h-5 w-5"
          aria-hidden="true"
        />
        <div>
          <span className="font-medium">No Auth Token Found!</span> You need to
          authorise your account with the game before you can access this
          interface.
        </div>
      </div>
    </div>
  )
}
