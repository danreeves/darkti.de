local mod = get_mod("Exporter")
local LocalizationManager = require("scripts/managers/localization/localization_manager")

-- Set up custom view
mod:add_require_path("Exporter/scripts/mods/Exporter/ItemPreviewView")

mod:register_view({
	view_name = "item_preview_view",
	view_settings = {
		init_view_function = function()
			return true
		end,
		class = "ItemPreviewView",
		disable_game_world = true,
		display_name = "loc_exporter_item_preview_view",
		load_always = true,
		load_in_hub = true,
		package = "packages/ui/views/system_view/system_view", -- abritrary
		path = "Exporter/scripts/mods/Exporter/ItemPreviewView",
		state_bound = true,
	},
	view_transitions = {},
	view_options = {
		close_all = false,
		close_previous = false,
		close_transition_time = nil,
		transition_time = nil,
	},
})

-- Increase the resolution of the weapon/icon renderers
mod:hook("UIManager", "create_single_icon_renderer", function(func, self, render_type, id, settings)
	if render_type == "weapon" or render_type == "icon" then
		return func(self, render_type, id, {
			width = 1920,
			height = 1080,
		})
	end
	return func(self, render_type, id, settings)
end)

mod:command("export", "Dump all the data", function()
	mod.export_files()
end)

mod:command("capture_images", "Automatically dump images of all items", function(item_type)
	-- Setup icon renderers again because the above hook isn't
	-- available when it's initially called
	Managers.ui:_setup_icon_renderers()
	Managers.ui:open_view("item_preview_view", nil, nil, nil, nil, { item_type = item_type })
end)

function mod.write_file(relative_path, contents)
	local user_dir = os.getenv("USERPROFILE")
	local path = string.format("%s\\Desktop\\%s", user_dir, relative_path)
	local file = Mods.lua.io.open(path, "w+")
	file:write(contents)
	file:close()
end

function mod.copy_keys(tbl, keys)
	local new_tbl = {}
	for _, key in ipairs(keys) do
		local val = tbl[key]
		if type(val) == "table" then
			new_tbl[key] = table.clone(val)
		else
			new_tbl[key] = val
		end
	end
	return new_tbl
end

function mod.table_walk(tbl, fn)
	for key, value in pairs(tbl) do
		if type(value) == "table" then
			mod.table_walk(value, fn)
		else
			fn(tbl, key, value)
		end
	end
end

function mod.array_join(tbl, joiner)
	joiner = joiner or "\n"
	local str = ""
	for i = 1, #tbl do
		str = str .. tbl[i]
		if i ~= #tbl then
			str = str .. joiner
		end
	end
	return str
end

function mod.replace_functions(tbl)
	for k, v in pairs(tbl) do
		if type(v) == "function" then
			-- mod:echo(k .. " is a function, removing it")
			tbl[k] = nil
		end
		if type(v) == "table" then
			mod.replace_functions(v)
		end
	end
end

function mod.export_files()
	local pm = Managers.package
	local strings_package_id = pm:load("packages/strings", "ExporterMod", nil)
	local lm = LocalizationManager:new()
	lm:setup_localizers(strings_package_id)

	local icon_keys = {
		"hud_icon",
		"hud_icon_small",
		"icon",
		"icon_small",
		"texture_big",
		"texture_medium",
		"texture_small",
	}

	local localizations = {}
	local textures = {}

	local function add_localization(key)
		localizations[key] = lm:_lookup(key)
	end

	local function add_texture(name)
		if #name > 0 then
			textures[#textures + 1] = string.gsub(name, "materials", "textures")
		end
	end

	local function preprocess(tbl)
		mod.table_walk(tbl, function(t, k, value)
			-- Add localizations to dict
			if type(value) == "string" and string.starts_with(value, "loc_") then
				add_localization(value)
			end

			-- Add textures to list
			if table.array_contains(icon_keys, k) then
				add_texture(value)
			end

			-- Fix non-json values
			if math.is_nan(value) then
				-- mod:echo(k .. " is nan")
				t[k] = nil
			end

			-- need to check for inf, not math.huge(? i forget)
			-- selene: allow(divide_by_zero)
			if value == 1 / 0 then
				-- mod:echo(k .. " is inf")
				t[k] = nil
			end
		end)
	end

	local WeaponTemplates = require("scripts/settings/equipment/weapon_templates/weapon_templates")
	local weapon_templates = {}
	local allowed_weapon_template_keys = {
		"name",
		"base_stats",
		"displayed_weapon_stats_table",
		"traits",
		"perks",
		"toughness_template",
		"stamina_template",
		"sprint_template",
		"dodge_template",
		"can_use_while_vaulting",
		"keywords",
		"displayed_keywords",
		"overheat_configuration",
		"crosshair_type",
		"hit_marker_type",
		"sprint_ready_up_time",
		"uses_ammunition",
		"uses_overheat",
		"ammo_template",
		"spread_template",
		"reload_template",
		"hud_icon",
		"hud_icon_small",
	}
	for _, weapon_template in pairs(WeaponTemplates) do
		table.insert(weapon_templates, mod.copy_keys(weapon_template, allowed_weapon_template_keys))
	end

	mod.replace_functions(weapon_templates)

	preprocess(weapon_templates)

	local WeaponUnlockSettings = require("scripts/settings/weapon_unlock_settings")

	local item_master_list = {}
	local cached_items = Managers.backend.interfaces.master_data:items_cache():get_cached()
	local allowed_item_types = { "WEAPON_MELEE", "WEAPON_RANGED", "GADGET", "TRAIT", "PERK", "WEAPON_SKIN" }
	local allowed_item_keys = {
		"item_type",
		"workflow_state",
		"feature_flags",
		"weapon_type",
		"weapon_template",
		"slots",
		"hud_icon",
		"display_name",
		"description",
		"breeds",
		"archetypes",
		"wieldable_slot_scripts",
		"preview_item",
		"weapon_template_restriction", -- TODO: This can be empty and it gets serialized as an object
		"weapon_type_restriction",
		"trait",
		"icon",
		"icon_small",
		"description_values",
	}

	for id, item in pairs(cached_items) do
		local is_npc = item.archetypes and item.archetypes[1] == "npc"
		mod:echo(cjson.encode(item.archetypes))
		if table.array_contains(allowed_item_types, item.item_type) then
			if not is_npc then
				local tbl = mod.copy_keys(item, allowed_item_keys)

				tbl.id = id
				tbl.preview_image = id:gsub("/", "-")

				if tbl.description_values and #tbl.description_values == 0 then
					tbl.description_values = nil
				end

				local archetypes = {}
				for specialization, unlock_settings in pairs(WeaponUnlockSettings) do
					for _, items in ipairs(unlock_settings) do
						for _, item_id in ipairs(items) do
							if item_id == id then
								archetypes[#archetypes + 1] = specialization
							end
						end
					end
				end
				tbl.archetypes = archetypes

				if #tbl.archetypes < 1 and item.archetypes and #item.archetypes then
					tbl.archetypes = item.archetypes
				end

				if #tbl.archetypes < 1 then
					tbl.archetypes = nil
				end

				table.insert(item_master_list, tbl)
			end
		end
	end

	preprocess(item_master_list)

	local BuffTemplates = require("scripts/settings/buff/buff_templates")
	local allowed_buff_keys = {
		"name",
		"class_name",
		"keywords",
		"stat_buffs",
		"predicted",
		"proc_events",
		"unique_buff_id",
		"duration",
		"buff_id",
		"lerped_stat_buffs",
		"interval",
		"hud_icon",
		"hud_priority",
		"is_negative",
		"target",
		"stepped_stat_buffs",
		"refresh_duration_on_stack",
		"max_stacks",
		"unique_buff_priority",
		"forbidden_keywords",
		"damage_template",
		"damage_type",
		"max_stacks_cap",
		"start_interval_on_apply",
		"start_with_frame_offset",
		"localization_info",
		"meta_buff",
		"meta_stat_buffs",
	}
	local buff_templates = {}
	for _, buff_template in pairs(BuffTemplates) do
		local tbl = mod.copy_keys(buff_template, allowed_buff_keys)
		mod.replace_functions(tbl)
		table.insert(buff_templates, tbl)
	end

	preprocess(buff_templates)

	local Missions = require("scripts/settings/mission/mission_templates")
	local CircumstanceTemplates = require("scripts/settings/circumstance/circumstance_templates")

	local mission_templates = {}
	for name, mission in pairs(Missions) do
		table.insert(mission_templates, {
			name = name,
			display_name = mission.mission_name,
			zone_id = mission.zone_id,
			texture_small = mission.texture_small,
			texture_medium = mission.texture_medium,
			texture_big = mission.texture_big,
			objectives = mission.objectives,
			coordinates = mission.coordinates,
			type = mission.mission_type,
			description = mission.mission_description,
		})
	end

	local circumstance_templates = {}
	for name, circumstance in pairs(CircumstanceTemplates) do
		circumstance_templates[name] = circumstance.ui
	end

	local mission_types = table.clone(require("scripts/settings/mission/mission_types"))
	local zones = table.clone(require("scripts/settings/zones/zones"))

	preprocess(mission_templates)
	preprocess(circumstance_templates)
	preprocess(mission_types)
	preprocess(zones)

	mod.write_file("exports\\buff_templates.json", cjson.encode(buff_templates))
	mod.write_file("exports\\weapon_templates.json", cjson.encode(weapon_templates))
	mod.write_file("exports\\item_master_list.json", cjson.encode(item_master_list))
	mod.write_file("exports\\mission_templates.json", cjson.encode(mission_templates))
	mod.write_file("exports\\circumstance_templates.json", cjson.encode(circumstance_templates))
	mod.write_file("exports\\mission_types.json", cjson.encode(mission_types))
	mod.write_file("exports\\zones.json", cjson.encode(zones))

	mod.write_file(string.format("exports\\localization_%s.json", lm:language()), cjson.encode(localizations))
	mod.write_file("exports\\textures.txt", mod.array_join(textures))
end

mod:command("extension_localisation", "", function()
	local WeaponTemplates = require("scripts/settings/equipment/weapon_templates/weapon_templates")

	local strings_package_id = Managers.package:load("packages/strings", "ExporterMod", nil)
	local lm = LocalizationManager:new()
	lm:setup_localizers(strings_package_id)

	local map = {}

	for _, template in pairs(WeaponTemplates) do
		if template.base_stats then
			for key, base_stat in pairs(template.base_stats) do
				map[key] = { display_name = lm:_lookup(base_stat.display_name) }
			end
		end
	end

	local items = Managers.backend.interfaces.master_data:items_cache():get_cached()

	for id, item in pairs(items) do
		if
			item.item_type == "TRAIT"
			or item.item_type == "PERK"
			or item.item_type == "GADGET"
			or item.item_type == "WEAPON_MELEE"
			or item.item_type == "WEAPON_RANGED"
		then
			map[id] = {
				description = lm:_lookup(item.description),
				display_name = lm:_lookup(item.display_name),
			}
		end
	end

	mod.write_file("localisation.json", cjson.encode(map))
end)
