CREATE TABLE `operatorNotificationSettings` (
	`operatorId` int NOT NULL,
	`channel` enum('project_owner_push','in_app_only') NOT NULL DEFAULT 'project_owner_push',
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `operatorNotificationSettings_operatorId` PRIMARY KEY(`operatorId`)
);
--> statement-breakpoint
CREATE TABLE `operatorNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operatorId` int NOT NULL,
	`credentialId` varchar(36),
	`handoffId` varchar(36),
	`type` enum('arrival_scan','handoff_completed') NOT NULL,
	`titleEs` varchar(240) NOT NULL,
	`titleEn` varchar(240) NOT NULL,
	`detailEs` text NOT NULL,
	`detailEn` text NOT NULL,
	`deliveryChannel` enum('project_owner_push','in_app_only') NOT NULL,
	`deliveryStatus` enum('queued','delivered','unavailable') NOT NULL DEFAULT 'queued',
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `operatorNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `notifications_operator_idx` ON `operatorNotifications` (`operatorId`);