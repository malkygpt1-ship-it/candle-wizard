CREATE TABLE `app_meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`occurred_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`actor` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`action` text NOT NULL,
	`before_json` text,
	`after_json` text,
	`effects_json` text NOT NULL,
	`idempotency_key` text,
	`source` text DEFAULT 'app' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `audit_events` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_occurred_idx` ON `audit_events` (`occurred_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `audit_idempotency_uidx` ON `audit_events` (`idempotency_key`);--> statement-breakpoint
CREATE TABLE `bom_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` text NOT NULL,
	`material_id` text NOT NULL,
	`quantity_milli` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bom_product_material_uidx` ON `bom_items` (`product_id`,`material_id`);--> statement-breakpoint
CREATE INDEX `bom_material_idx` ON `bom_items` (`material_id`);--> statement-breakpoint
CREATE TABLE `idempotency_keys` (
	`key` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`response_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`supplier_id` text,
	`supplier_sku` text,
	`unit` text NOT NULL,
	`pack_size_milli` integer NOT NULL,
	`purchase_price_micros` integer NOT NULL,
	`unit_cost_micros` integer NOT NULL,
	`last_purchase_unit_cost_micros` integer NOT NULL,
	`minimum_stock_milli` integer DEFAULT 0 NOT NULL,
	`reorder_point_milli` integer DEFAULT 0 NOT NULL,
	`preferred_order_qty_milli` integer DEFAULT 0 NOT NULL,
	`lead_time_days` integer DEFAULT 0 NOT NULL,
	`location` text,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `materials_supplier_idx` ON `materials` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `materials_category_idx` ON `materials` (`category`);--> statement-breakpoint
CREATE TABLE `production_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`production_date` text NOT NULL,
	`product_id` text NOT NULL,
	`planned_qty_milli` integer NOT NULL,
	`actual_produced_milli` integer DEFAULT 0 NOT NULL,
	`rejected_milli` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`operator` text,
	`wax_lot` text,
	`fragrance_lot` text,
	`container_lot` text,
	`unit_cost_snapshot_micros` integer,
	`total_cost_snapshot_micros` integer,
	`waste_cost_snapshot_micros` integer,
	`completed_at` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `batch_status_idx` ON `production_batches` (`status`);--> statement-breakpoint
CREATE INDEX `batch_product_idx` ON `production_batches` (`product_id`);--> statement-breakpoint
CREATE TABLE `production_plan_lines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_id` text NOT NULL,
	`line_no` integer NOT NULL,
	`product_id` text NOT NULL,
	`desired_qty_milli` integer NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `production_plans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plan_line_uidx` ON `production_plan_lines` (`plan_id`,`line_no`);--> statement-breakpoint
CREATE TABLE `production_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'scenario' NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`sku` text NOT NULL,
	`name` text NOT NULL,
	`collection` text NOT NULL,
	`candle_type` text NOT NULL,
	`container_size_ml` integer NOT NULL,
	`wax_weight_milli` integer NOT NULL,
	`fragrance` text NOT NULL,
	`fragrance_bps` integer NOT NULL,
	`wick_type` text NOT NULL,
	`colour` text NOT NULL,
	`selling_price_pence` integer NOT NULL,
	`target_stock_milli` integer DEFAULT 0 NOT NULL,
	`production_trigger_milli` integer DEFAULT 0 NOT NULL,
	`direct_labour_minutes_milli` integer DEFAULT 0 NOT NULL,
	`packaging_labour_minutes_milli` integer DEFAULT 0 NOT NULL,
	`energy_cost_micros` integer DEFAULT 0 NOT NULL,
	`overhead_cost_micros` integer DEFAULT 0 NOT NULL,
	`selling_cost_micros` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE TABLE `purchase_order_lines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`po_number` text NOT NULL,
	`line_no` integer NOT NULL,
	`material_id` text NOT NULL,
	`ordered_qty_milli` integer NOT NULL,
	`received_qty_milli` integer DEFAULT 0 NOT NULL,
	`unit_price_micros` integer NOT NULL,
	`unit` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`po_number`) REFERENCES `purchase_orders`(`po_number`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `po_line_uidx` ON `purchase_order_lines` (`po_number`,`line_no`);--> statement-breakpoint
CREATE INDEX `po_line_material_idx` ON `purchase_order_lines` (`material_id`);--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`po_number` text PRIMARY KEY NOT NULL,
	`order_date` text NOT NULL,
	`supplier_id` text NOT NULL,
	`status` text NOT NULL,
	`expected_date` text,
	`actual_date` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `po_supplier_idx` ON `purchase_orders` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `po_status_idx` ON `purchase_orders` (`status`);--> statement-breakpoint
CREATE TABLE `settings` (
	`workspace_id` text PRIMARY KEY NOT NULL,
	`business_name` text NOT NULL,
	`currency_code` text DEFAULT 'GBP' NOT NULL,
	`vat_bps` integer DEFAULT 2000 NOT NULL,
	`waste_bps` integer DEFAULT 300 NOT NULL,
	`labour_rate_pence_per_hour` integer DEFAULT 1450 NOT NULL,
	`target_margin_bps` integer DEFAULT 6500 NOT NULL,
	`source_filename` text NOT NULL,
	`imported_on` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`occurred_on` text NOT NULL,
	`item_kind` text NOT NULL,
	`item_id` text NOT NULL,
	`movement_type` text NOT NULL,
	`quantity_milli` integer NOT NULL,
	`unit_cost_micros` integer DEFAULT 0 NOT NULL,
	`batch_id` text,
	`po_number` text,
	`lot_ref` text,
	`waste_event_id` text,
	`reason` text,
	`source` text DEFAULT 'app' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `production_batches`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`po_number`) REFERENCES `purchase_orders`(`po_number`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `movement_item_idx` ON `stock_movements` (`item_kind`,`item_id`);--> statement-breakpoint
CREATE INDEX `movement_batch_idx` ON `stock_movements` (`batch_id`);--> statement-breakpoint
CREATE INDEX `movement_po_idx` ON `stock_movements` (`po_number`);--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`contact_name` text,
	`email` text,
	`phone` text,
	`website` text,
	`address` text,
	`lead_time_days` integer DEFAULT 0 NOT NULL,
	`minimum_order_pence` integer DEFAULT 0 NOT NULL,
	`payment_terms` text,
	`materials_supplied` text,
	`active` integer DEFAULT 1 NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `waste_events` (
	`id` text PRIMARY KEY NOT NULL,
	`occurred_on` text NOT NULL,
	`batch_id` text,
	`product_id` text,
	`material_id` text NOT NULL,
	`waste_type` text NOT NULL,
	`lot_ref` text,
	`quantity_milli` integer NOT NULL,
	`unit` text NOT NULL,
	`unit_cost_snapshot_micros` integer NOT NULL,
	`stock_movement_id` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `production_batches`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `waste_events_stock_movement_id_unique` ON `waste_events` (`stock_movement_id`);--> statement-breakpoint
CREATE INDEX `waste_batch_idx` ON `waste_events` (`batch_id`);--> statement-breakpoint
CREATE INDEX `waste_material_idx` ON `waste_events` (`material_id`);
--> statement-breakpoint
CREATE TRIGGER `app_material_stock_nonnegative`
BEFORE INSERT ON `stock_movements`
WHEN NEW.`source` = 'app'
	AND NEW.`item_kind` = 'material'
	AND NEW.`quantity_milli` < 0
	AND COALESCE((SELECT SUM(`quantity_milli`) FROM `stock_movements` WHERE `item_kind` = 'material' AND `item_id` = NEW.`item_id`), 0) + NEW.`quantity_milli` < 0
BEGIN
	SELECT RAISE(ABORT, 'Material stock would become negative.');
END;
--> statement-breakpoint
CREATE TRIGGER `app_po_receipt_not_overposted`
BEFORE INSERT ON `stock_movements`
WHEN NEW.`source` = 'app'
	AND NEW.`movement_type` = 'purchase_receipt'
	AND COALESCE((SELECT SUM(`quantity_milli`) FROM `stock_movements` WHERE `movement_type` = 'purchase_receipt' AND `po_number` = NEW.`po_number` AND `item_id` = NEW.`item_id`), 0) + NEW.`quantity_milli` > COALESCE((SELECT SUM(`received_qty_milli`) FROM `purchase_order_lines` WHERE `po_number` = NEW.`po_number` AND `material_id` = NEW.`item_id`), 0)
BEGIN
	SELECT RAISE(ABORT, 'Receipt would exceed the recorded PO quantity.');
END;
