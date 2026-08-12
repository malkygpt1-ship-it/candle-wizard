import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const appMeta = sqliteTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const settings = sqliteTable("settings", {
  workspaceId: text("workspace_id").primaryKey(),
  businessName: text("business_name").notNull(),
  currencyCode: text("currency_code").notNull().default("GBP"),
  vatBps: integer("vat_bps").notNull().default(2000),
  wasteBps: integer("waste_bps").notNull().default(300),
  labourRatePencePerHour: integer("labour_rate_pence_per_hour").notNull().default(1450),
  targetMarginBps: integer("target_margin_bps").notNull().default(6500),
  sourceFilename: text("source_filename").notNull(),
  importedOn: text("imported_on").notNull(),
  ...timestamps,
});

export const suppliers = sqliteTable("suppliers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  leadTimeDays: integer("lead_time_days").notNull().default(0),
  minimumOrderPence: integer("minimum_order_pence").notNull().default(0),
  paymentTerms: text("payment_terms"),
  materialsSupplied: text("materials_supplied"),
  active: integer("active").notNull().default(1),
  notes: text("notes"),
  ...timestamps,
});

export const materials = sqliteTable("materials", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  supplierId: text("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  supplierSku: text("supplier_sku"),
  unit: text("unit").notNull(),
  packSizeMilli: integer("pack_size_milli").notNull(),
  purchasePriceMicros: integer("purchase_price_micros").notNull(),
  purchasePriceIncVatMicros: integer("purchase_price_inc_vat_micros"),
  unitCostMicros: integer("unit_cost_micros").notNull(),
  lastPurchaseUnitCostMicros: integer("last_purchase_unit_cost_micros").notNull(),
  minimumStockMilli: integer("minimum_stock_milli").notNull().default(0),
  reorderPointMilli: integer("reorder_point_milli").notNull().default(0),
  preferredOrderQtyMilli: integer("preferred_order_qty_milli").notNull().default(0),
  leadTimeDays: integer("lead_time_days").notNull().default(0),
  location: text("location"),
  supplierProductUrl: text("supplier_product_url"),
  priceCheckedOn: text("price_checked_on"),
  active: integer("active").notNull().default(1),
  ...timestamps,
}, (table) => [index("materials_supplier_idx").on(table.supplierId), index("materials_category_idx").on(table.category)]);

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  collection: text("collection").notNull(),
  candleType: text("candle_type").notNull(),
  containerSizeMl: integer("container_size_ml").notNull(),
  waxWeightMilli: integer("wax_weight_milli").notNull(),
  fragrance: text("fragrance").notNull(),
  fragranceBps: integer("fragrance_bps").notNull(),
  wickType: text("wick_type").notNull(),
  colour: text("colour").notNull(),
  sellingPricePence: integer("selling_price_pence").notNull(),
  targetStockMilli: integer("target_stock_milli").notNull().default(0),
  productionTriggerMilli: integer("production_trigger_milli").notNull().default(0),
  directLabourMinutesMilli: integer("direct_labour_minutes_milli").notNull().default(0),
  packagingLabourMinutesMilli: integer("packaging_labour_minutes_milli").notNull().default(0),
  energyCostMicros: integer("energy_cost_micros").notNull().default(0),
  overheadCostMicros: integer("overhead_cost_micros").notNull().default(0),
  sellingCostMicros: integer("selling_cost_micros").notNull().default(0),
  active: integer("active").notNull().default(1),
  ...timestamps,
});

export const bomItems = sqliteTable("bom_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  materialId: text("material_id").notNull().references(() => materials.id, { onDelete: "restrict" }),
  quantityMilli: integer("quantity_milli").notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("bom_product_material_uidx").on(table.productId, table.materialId), index("bom_material_idx").on(table.materialId)]);

export const productionPlans = sqliteTable("production_plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("scenario"),
  notes: text("notes"),
  ...timestamps,
});

export const productionPlanLines = sqliteTable("production_plan_lines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  planId: text("plan_id").notNull().references(() => productionPlans.id, { onDelete: "cascade" }),
  lineNo: integer("line_no").notNull(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  desiredQtyMilli: integer("desired_qty_milli").notNull(),
  notes: text("notes"),
  ...timestamps,
}, (table) => [uniqueIndex("plan_line_uidx").on(table.planId, table.lineNo)]);

export const purchaseOrders = sqliteTable("purchase_orders", {
  poNumber: text("po_number").primaryKey(),
  orderDate: text("order_date").notNull(),
  supplierId: text("supplier_id").notNull().references(() => suppliers.id, { onDelete: "restrict" }),
  status: text("status").notNull(),
  expectedDate: text("expected_date"),
  actualDate: text("actual_date"),
  notes: text("notes"),
  ...timestamps,
}, (table) => [index("po_supplier_idx").on(table.supplierId), index("po_status_idx").on(table.status)]);

export const purchaseOrderLines = sqliteTable("purchase_order_lines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  poNumber: text("po_number").notNull().references(() => purchaseOrders.poNumber, { onDelete: "cascade" }),
  lineNo: integer("line_no").notNull(),
  materialId: text("material_id").notNull().references(() => materials.id, { onDelete: "restrict" }),
  orderedQtyMilli: integer("ordered_qty_milli").notNull(),
  receivedQtyMilli: integer("received_qty_milli").notNull().default(0),
  unitPriceMicros: integer("unit_price_micros").notNull(),
  unit: text("unit").notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("po_line_uidx").on(table.poNumber, table.lineNo), index("po_line_material_idx").on(table.materialId)]);

export const productionBatches = sqliteTable("production_batches", {
  id: text("id").primaryKey(),
  productionDate: text("production_date").notNull(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  plannedQtyMilli: integer("planned_qty_milli").notNull(),
  actualProducedMilli: integer("actual_produced_milli").notNull().default(0),
  rejectedMilli: integer("rejected_milli").notNull().default(0),
  status: text("status").notNull(),
  operator: text("operator"),
  waxLot: text("wax_lot"),
  fragranceLot: text("fragrance_lot"),
  containerLot: text("container_lot"),
  unitCostSnapshotMicros: integer("unit_cost_snapshot_micros"),
  totalCostSnapshotMicros: integer("total_cost_snapshot_micros"),
  wasteCostSnapshotMicros: integer("waste_cost_snapshot_micros"),
  completedAt: text("completed_at"),
  notes: text("notes"),
  ...timestamps,
}, (table) => [index("batch_status_idx").on(table.status), index("batch_product_idx").on(table.productId)]);

export const stockMovements = sqliteTable("stock_movements", {
  id: text("id").primaryKey(),
  occurredOn: text("occurred_on").notNull(),
  itemKind: text("item_kind").notNull(),
  itemId: text("item_id").notNull(),
  movementType: text("movement_type").notNull(),
  quantityMilli: integer("quantity_milli").notNull(),
  unitCostMicros: integer("unit_cost_micros").notNull().default(0),
  batchId: text("batch_id").references(() => productionBatches.id, { onDelete: "set null" }),
  poNumber: text("po_number").references(() => purchaseOrders.poNumber, { onDelete: "set null" }),
  lotRef: text("lot_ref"),
  wasteEventId: text("waste_event_id"),
  reason: text("reason"),
  source: text("source").notNull().default("app"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("movement_item_idx").on(table.itemKind, table.itemId), index("movement_batch_idx").on(table.batchId), index("movement_po_idx").on(table.poNumber)]);

export const wasteEvents = sqliteTable("waste_events", {
  id: text("id").primaryKey(),
  occurredOn: text("occurred_on").notNull(),
  batchId: text("batch_id").references(() => productionBatches.id, { onDelete: "set null" }),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
  materialId: text("material_id").notNull().references(() => materials.id, { onDelete: "restrict" }),
  wasteType: text("waste_type").notNull(),
  lotRef: text("lot_ref"),
  quantityMilli: integer("quantity_milli").notNull(),
  unit: text("unit").notNull(),
  unitCostSnapshotMicros: integer("unit_cost_snapshot_micros").notNull(),
  stockMovementId: text("stock_movement_id").notNull().unique(),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("waste_batch_idx").on(table.batchId), index("waste_material_idx").on(table.materialId)]);

export const auditEvents = sqliteTable("audit_events", {
  id: text("id").primaryKey(),
  occurredAt: text("occurred_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  actor: text("actor").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  beforeJson: text("before_json"),
  afterJson: text("after_json"),
  effectsJson: text("effects_json").notNull(),
  idempotencyKey: text("idempotency_key"),
  source: text("source").notNull().default("app"),
}, (table) => [index("audit_entity_idx").on(table.entityType, table.entityId), index("audit_occurred_idx").on(table.occurredAt), uniqueIndex("audit_idempotency_uidx").on(table.idempotencyKey)]);

export const idempotencyKeys = sqliteTable("idempotency_keys", {
  key: text("key").primaryKey(),
  action: text("action").notNull(),
  responseJson: text("response_json").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
