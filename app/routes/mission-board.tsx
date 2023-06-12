import Missions, {
	getMissionBoardResponse,
} from "~/routes/armoury/mission-board"
import { getAuthTokenBySteamId } from "~/data/authtoken.server"
import { redirect } from "@remix-run/node"

export async function loader() {
	let auth = await getAuthTokenBySteamId(process.env.DEFAULT_STEAM_ID!)
	if (!auth) {
		return redirect("/")
	}
	return getMissionBoardResponse(auth)
}

export default Missions
