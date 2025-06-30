PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_missionTemplates` (
	`name` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`zone_id` text NOT NULL,
	`texture_small` text,
	`texture_medium` text,
	`texture_big` text,
	`objectives` text NOT NULL,
	`coordinates` text,
	`type` text,
	`description` text
);
--> statement-breakpoint
INSERT INTO `__new_missionTemplates`("name", "display_name", "zone_id", "texture_small", "texture_medium", "texture_big", "objectives", "coordinates", "type", "description") SELECT "name", "display_name", "zone_id", "texture_small", "texture_medium", "texture_big", "objectives", "coordinates", "type", "description" FROM `missionTemplates`;--> statement-breakpoint
DROP TABLE `missionTemplates`;--> statement-breakpoint
ALTER TABLE `__new_missionTemplates` RENAME TO `missionTemplates`;--> statement-breakpoint
PRAGMA foreign_keys=ON;