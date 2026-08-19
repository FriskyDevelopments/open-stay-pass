ALTER TABLE `credentials` ADD `tokenCiphertext` text;--> statement-breakpoint
ALTER TABLE `credentials` ADD `tokenIv` varchar(32);--> statement-breakpoint
ALTER TABLE `credentials` ADD `tokenTag` varchar(32);