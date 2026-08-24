ALTER TABLE `handoffs` ADD `invoiceStatus` enum('proof','review','issued','cancelled') DEFAULT 'proof' NOT NULL;--> statement-breakpoint
ALTER TABLE `handoffs` ADD `invoiceNumber` varchar(120);--> statement-breakpoint
ALTER TABLE `handoffs` ADD `invoiceUrl` text;--> statement-breakpoint
ALTER TABLE `handoffs` ADD `invoiceIssuedAt` timestamp;--> statement-breakpoint
ALTER TABLE `handoffs` ADD `invoiceUpdatedAt` timestamp;