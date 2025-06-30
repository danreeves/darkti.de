CREATE TABLE `circumstanceTemplates` (
	`key` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`display_name` text NOT NULL,
	`happening_display_name` text,
	`favourable_to_players` integer,
	`icon` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `curios` (
	`item_type` text NOT NULL,
	`slots` text NOT NULL,
	`preview_image` text NOT NULL,
	`feature_flags` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`workflow_state` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `missionTemplates` (
	`name` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`zone_id` text NOT NULL,
	`texture_small` text NOT NULL,
	`texture_medium` text NOT NULL,
	`texture_big` text NOT NULL,
	`objectives` text NOT NULL,
	`coordinates` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `missionTypes` (
	`key` text PRIMARY KEY NOT NULL,
	`index` integer,
	`name` text NOT NULL,
	`icon` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `skins` (
	`item_type` text NOT NULL,
	`slots` text NOT NULL,
	`preview_image` text NOT NULL,
	`weapon_template_restriction` text NOT NULL,
	`feature_flags` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`workflow_state` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `traits` (
	`item_type` text NOT NULL,
	`icon` text NOT NULL,
	`icon_small` text NOT NULL,
	`weapon_type_restriction` text NOT NULL,
	`weapon_template_restriction` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`description` text NOT NULL,
	`description_values` text,
	`trait` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weapons` (
	`item_type` text NOT NULL,
	`slots` text NOT NULL,
	`hud_icon` text NOT NULL,
	`preview_image` text NOT NULL,
	`weapon_template` text NOT NULL,
	`feature_flags` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`archetypes` text NOT NULL,
	`breeds` text NOT NULL,
	`display_name` text NOT NULL,
	`workflow_state` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `zones` (
	`key` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`name_short` text,
	`map_node` text,
	`images_mission_vote` text,
	`images_default` text,
	`images_mission_board_details` text
);
