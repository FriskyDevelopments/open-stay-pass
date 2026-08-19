CREATE TABLE `activityEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operatorId` int NOT NULL,
	`credentialId` varchar(36),
	`handoffId` varchar(36),
	`type` enum('arrival_scan','handoff_completed','credential_revoked') NOT NULL,
	`locale` enum('es','en'),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credentials` (
	`id` varchar(36) NOT NULL,
	`operatorId` int NOT NULL,
	`stayId` varchar(36),
	`handoffId` varchar(36),
	`type` enum('arrival','handoff') NOT NULL,
	`status` enum('active','revoked','expired') NOT NULL DEFAULT 'active',
	`tokenHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `handoffs` (
	`id` varchar(36) NOT NULL,
	`operatorId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`sourceType` enum('note','photo','link') NOT NULL DEFAULT 'note',
	`sourceContent` text NOT NULL,
	`context` text NOT NULL,
	`checkState` enum('ready','needs_review') NOT NULL DEFAULT 'needs_review',
	`ownerName` varchar(160) NOT NULL,
	`status` enum('draft','shared','completed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `handoffs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stays` (
	`id` varchar(36) NOT NULL,
	`operatorId` int NOT NULL,
	`propertyName` varchar(160) NOT NULL,
	`guestName` varchar(160) NOT NULL,
	`guestLocale` enum('es','en') NOT NULL DEFAULT 'es',
	`wifiName` varchar(160),
	`wifiPassword` varchar(160),
	`houseRules` text,
	`localRecommendations` text,
	`arrivalAt` timestamp NOT NULL,
	`departureAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stays_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `activity_operator_idx` ON `activityEvents` (`operatorId`);--> statement-breakpoint
CREATE INDEX `credentials_operator_idx` ON `credentials` (`operatorId`);--> statement-breakpoint
CREATE INDEX `credentials_stay_idx` ON `credentials` (`stayId`);--> statement-breakpoint
CREATE INDEX `credentials_handoff_idx` ON `credentials` (`handoffId`);--> statement-breakpoint
CREATE INDEX `handoffs_operator_idx` ON `handoffs` (`operatorId`);--> statement-breakpoint
CREATE INDEX `stays_operator_idx` ON `stays` (`operatorId`);