local mod = get_mod("DTAuth")

mod:command("login", "Open the https://darkti.de/login page in your browser", function()
	Application.open_url_in_browser("https://darkti.de/login")
end)

-- TODO: if Backend.get_auth_method() == Backend.AUTH_METHOD_XBOXLIVE then XboxLive.user_id()?

if HAS_STEAM then
	local function authenticate(ticket)
		-- local domain = "https://darkti.de/"
		local domain = "http://localhost:3000/"

		if Backend.get_auth_method() == Backend.AUTH_METHOD_STEAM then
			mod:echo("Authenticating...")
			local steam_id = Steam.id_hex_to_dec(Steam.user_id())
			local path = "auth/steam/" .. steam_id
			local auth_url = domain .. path
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
						mod:echo(e.body.error)
					else
						mod:echo("Failed with unknown error")
					end
				end)
		end
	end

	local id = Steam.retrieve_auth_session_ticket()
	mod.update = function()
		local app_ticket = Steam.poll_auth_session_ticket(id)
		if app_ticket then
			authenticate(app_ticket)
			mod.update = nil
		end
	end
end
