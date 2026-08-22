ALTER TABLE `users` ADD `hostcasaId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_hostcasaId_unique` UNIQUE(`hostcasaId`);