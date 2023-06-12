local mod = get_mod("DTAuth")

local domain = "https://darkti.de"
-- local domain = "http://localhost:3000"

mod:command("login", "Open the https://darkti.de/login page in your browser", function()
	Application.open_url_in_browser(domain .. "/login")
end)

function mod.on_all_mods_loaded()
	-- TODO: if Backend.get_auth_method() == Backend.AUTH_METHOD_XBOXLIVE then XboxLive.user_id()?
	if HAS_STEAM and Backend.get_auth_method() == Backend.AUTH_METHOD_STEAM then
		mod.authenticate_steam()
	end
end

function mod.authenticate_steam()
	local steam_id = Steam.id_hex_to_dec(Steam.user_id())

	local function getHasToken()
		local has_token_url = domain .. "/auth/steam/" .. steam_id .. "/hasToken"
		return Managers.backend:url_request(has_token_url)
	end

	local function authenticate(ticket)
		local auth_url = domain .. "/auth/steam/" .. steam_id
		Managers.backend
			:url_request(auth_url, {
				headers = {
					["steam-auth-session-ticket"] = ticket,
				},
			})
			:next(function(data)
				if data.body.ok then
					mod:echo("Done.")
				end
			end)
			:catch(function(e)
				if e.body and e.body.error then
					mod:info(e.body.error)
				else
					mod:info("Failed with unknown error")
				end
			end)
	end

	getHasToken():next(function(data)
		if data and data.body and data.body.hasToken == false then
			mod:echo("Authenticating...")
			local id = Steam.retrieve_auth_session_ticket()
			mod.update = function()
				local app_ticket = Steam.poll_auth_session_ticket(id)
				if app_ticket then
					authenticate(app_ticket)
					mod.update = nil
				end
			end
		else
			mod:info("Already authenticated")
		end
	end)
end
