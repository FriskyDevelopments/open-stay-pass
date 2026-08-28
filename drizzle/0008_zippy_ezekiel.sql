ALTER TABLE `stays` ADD `wifiPasswordCiphertext` text;--> statement-breakpoint
ALTER TABLE `stays` ADD `wifiPasswordIv` varchar(32);--> statement-breakpoint
ALTER TABLE `stays` ADD `wifiPasswordTag` varchar(32);