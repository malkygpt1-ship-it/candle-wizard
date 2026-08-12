import { computeProductCost, computeSnapshot, normalizedImportedReceipt, purchaseOrderStatusAfterReceipt, quantityCostMicros, requiredMaterialsForProduct, type AuditRow, type BatchRow, type BomRow, type DomainState, type MaterialRow, type MovementRow, type PlanLineRow, type ProductRow, type PurchaseOrderLineRow, type PurchaseOrderRow, type SettingsRow, type SupplierRow, type WasteRow } from "./domain";
import { workbookSeed } from "./workbook-seed";
import { supplierCatalogue } from "./supplier-catalogue";
import initialSchemaSql from "../drizzle/0000_optimal_joshua_kane.sql?raw";

const WORKSPACE_ID = "lumina-main";
const SEED_VERSION = "candle-workbook-2026-08-12-v9-candle-shack-catalogue";
const seedSuppliers = [...workbookSeed.suppliers, supplierCatalogue.supplier];
const seedMaterials = [...workbookSeed.materials, ...supplierCatalogue.materials];
const OPERATIONAL_GUARDS_SQL = `CREATE TRIGGER IF NOT EXISTS \`app_material_stock_nonnegative\` BEFORE INSERT ON \`stock_movements\` WHEN NEW.\`source\` = 'app' AND NEW.\`item_kind\` = 'material' AND NEW.\`quantity_milli\` < 0 AND COALESCE((SELECT SUM(\`quantity_milli\`) FROM \`stock_movements\` WHERE \`item_kind\` = 'material' AND \`item_id\` = NEW.\`item_id\`), 0) + NEW.\`quantity_milli\` < 0 BEGIN SELECT RAISE(ABORT, 'Material stock would become negative.'); END;
CREATE TRIGGER IF NOT EXISTS \`app_po_receipt_not_overposted\` BEFORE INSERT ON \`stock_movements\` WHEN NEW.\`source\` = 'app' AND NEW.\`movement_type\` = 'purchase_receipt' AND COALESCE((SELECT SUM(\`quantity_milli\`) FROM \`stock_movements\` WHERE \`movement_type\` = 'purchase_receipt' AND \`po_number\` = NEW.\`po_number\` AND \`item_id\` = NEW.\`item_id\`), 0) + NEW.\`quantity_milli\` > COALESCE((SELECT SUM(\`received_qty_milli\`) FROM \`purchase_order_lines\` WHERE \`po_number\` = NEW.\`po_number\` AND \`material_id\` = NEW.\`item_id\`), 0) BEGIN SELECT RAISE(ABORT, 'Receipt would exceed the recorded PO quantity.'); END;`;

type Statement = ReturnType<D1Database["prepare"]>;

function database(): D1Database {
  const db = (globalThis as typeof globalThis & CandleRuntimeGlobal).__CANDLE_RUNTIME_ENV__?.DB;
  if (!db) throw new Error("The application database is unavailable.");
  return db;
}

function nullable(value: unknown) {
  return value === undefined ? null : value;
}

function json(value: unknown) {
  return JSON.stringify(value ?? null);
}

function nowIso() {
  return new Date().toISOString();
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function safeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

async function runChunks(db: D1Database, statements: Statement[], chunkSize = 60) {
  for (let index = 0; index < statements.length; index += chunkSize) {
    await db.batch(statements.slice(index, index + chunkSize));
  }
}

async function ensureSchema(db: D1Database) {
  try {
    await db.prepare("SELECT 1 FROM app_meta LIMIT 1").first();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    if (!/no such table:\s*app_meta/i.test(detail)) throw error;
    const idempotentSchema = initialSchemaSql
      .replaceAll("CREATE TABLE `", "CREATE TABLE IF NOT EXISTS `")
      .replaceAll("CREATE INDEX `", "CREATE INDEX IF NOT EXISTS `")
      .replaceAll("CREATE UNIQUE INDEX `", "CREATE UNIQUE INDEX IF NOT EXISTS `")
      .replaceAll("CREATE TRIGGER `", "CREATE TRIGGER IF NOT EXISTS `")
      .split("--> statement-breakpoint")
      .map((statement) => statement.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .join("\n");
    await db.exec(idempotentSchema);
  }
  const materialColumns = await db.prepare("PRAGMA table_info(materials)").all<{ name: string }>();
  const existingColumns = new Set((materialColumns.results ?? []).map((column) => column.name));
  const catalogueColumns = [
    { name: "purchase_price_inc_vat_micros", sql: "ALTER TABLE materials ADD COLUMN purchase_price_inc_vat_micros integer" },
    { name: "supplier_product_url", sql: "ALTER TABLE materials ADD COLUMN supplier_product_url text" },
    { name: "price_checked_on", sql: "ALTER TABLE materials ADD COLUMN price_checked_on text" },
  ];
  for (const column of catalogueColumns) {
    if (existingColumns.has(column.name)) continue;
    try {
      await db.prepare(column.sql).run();
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      if (!/duplicate column name/i.test(detail)) throw error;
    }
  }
  await db.exec(OPERATIONAL_GUARDS_SQL);
}

function seedDomainState(): DomainState {
  const settings: SettingsRow = {
    business_name: workbookSeed.settings.businessName ?? "Lumina Candle Works",
    currency_code: "GBP",
    vat_bps: workbookSeed.settings.vatBps,
    waste_bps: workbookSeed.settings.wasteBps,
    labour_rate_pence_per_hour: workbookSeed.settings.labourRatePencePerHour,
    target_margin_bps: workbookSeed.settings.targetMarginBps,
  };
  const suppliers: SupplierRow[] = seedSuppliers.map((item) => ({ id: item.id!, name: item.name!, minimum_order_pence: item.minimumOrderPence, lead_time_days: item.leadTimeDays, active: item.active ? 1 : 0 }));
  const materials: MaterialRow[] = seedMaterials.map((item) => ({
    id: item.id!, name: item.name!, category: item.category!, supplier_id: item.supplierId, supplier_sku: item.supplierSku, unit: item.unit!, pack_size_milli: item.packSizeMilli,
    purchase_price_micros: item.purchasePriceMicros, purchase_price_inc_vat_micros: "purchasePriceIncVatMicros" in item ? item.purchasePriceIncVatMicros : null,
    unit_cost_micros: item.unitCostMicros, last_purchase_unit_cost_micros: item.lastPurchaseUnitCostMicros,
    minimum_stock_milli: item.minimumStockMilli, reorder_point_milli: item.reorderPointMilli, preferred_order_qty_milli: item.preferredOrderQtyMilli,
    lead_time_days: item.leadTimeDays, location: item.location, supplier_product_url: "supplierProductUrl" in item ? item.supplierProductUrl : null,
    price_checked_on: "priceCheckedOn" in item ? item.priceCheckedOn : null, active: item.active ? 1 : 0,
  }));
  const products: ProductRow[] = workbookSeed.products.map((item) => ({
    id: item.id!, sku: item.sku!, name: item.name!, collection: item.collection!, candle_type: item.candleType!, selling_price_pence: item.sellingPricePence,
    target_stock_milli: item.targetStockMilli, production_trigger_milli: item.productionTriggerMilli, direct_labour_minutes_milli: item.directLabourMinutesMilli,
    packaging_labour_minutes_milli: item.packagingLabourMinutesMilli, energy_cost_micros: item.energyCostMicros, overhead_cost_micros: item.overheadCostMicros,
    selling_cost_micros: item.sellingCostMicros, active: item.active ? 1 : 0,
  }));
  const bomItems: BomRow[] = workbookSeed.bomItems.map((item) => ({ product_id: item.productId!, material_id: item.materialId!, quantity_milli: item.quantityMilli }));
  return { settings, suppliers, materials, products, bomItems, movements: [], purchaseOrders: [], purchaseOrderLines: [], batches: [], wasteEvents: [], planLines: [] };
}

export async function ensureSeeded() {
  const db = database();
  await ensureSchema(db);
  const marker = await db.prepare("SELECT value FROM app_meta WHERE key = 'seed_version'").all();
  if (marker.results?.[0]?.value === SEED_VERSION) return;

  const base = seedDomainState();
  const materialById = new Map(base.materials.map((item) => [item.id, item]));
  const costByProduct = new Map(base.products.map((product) => [product.id, computeProductCost(product, base)]));
  const statements: Statement[] = [];

  statements.push(db.prepare(`INSERT OR IGNORE INTO settings (workspace_id,business_name,currency_code,vat_bps,waste_bps,labour_rate_pence_per_hour,target_margin_bps,source_filename,imported_on) VALUES (?,?,?,?,?,?,?,?,?)`).bind(
    WORKSPACE_ID, base.settings.business_name, base.settings.currency_code, base.settings.vat_bps, base.settings.waste_bps, base.settings.labour_rate_pence_per_hour,
    base.settings.target_margin_bps, workbookSeed.source.filename, workbookSeed.source.importedOn,
  ));

  for (const item of seedSuppliers) statements.push(db.prepare(`INSERT OR IGNORE INTO suppliers (id,name,contact_name,email,phone,website,address,lead_time_days,minimum_order_pence,payment_terms,materials_supplied,active,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
    item.id, item.name, nullable(item.contactName), nullable(item.email), nullable(item.phone), nullable(item.website), nullable(item.address), item.leadTimeDays,
    item.minimumOrderPence, nullable(item.paymentTerms), nullable(item.materialsSupplied), item.active ? 1 : 0, nullable(item.notes),
  ));

  for (const item of seedMaterials) statements.push(db.prepare(`INSERT OR IGNORE INTO materials (id,name,category,supplier_id,supplier_sku,unit,pack_size_milli,purchase_price_micros,purchase_price_inc_vat_micros,unit_cost_micros,last_purchase_unit_cost_micros,minimum_stock_milli,reorder_point_milli,preferred_order_qty_milli,lead_time_days,location,supplier_product_url,price_checked_on,active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
    item.id, item.name, item.category, nullable(item.supplierId), nullable(item.supplierSku), item.unit, item.packSizeMilli, item.purchasePriceMicros,
    "purchasePriceIncVatMicros" in item ? item.purchasePriceIncVatMicros : null, item.unitCostMicros, item.lastPurchaseUnitCostMicros,
    item.minimumStockMilli, item.reorderPointMilli, item.preferredOrderQtyMilli, item.leadTimeDays, nullable(item.location),
    "supplierProductUrl" in item ? item.supplierProductUrl : null, "priceCheckedOn" in item ? item.priceCheckedOn : null, item.active ? 1 : 0,
  ));

  for (const item of workbookSeed.products) statements.push(db.prepare(`INSERT OR IGNORE INTO products (id,sku,name,collection,candle_type,container_size_ml,wax_weight_milli,fragrance,fragrance_bps,wick_type,colour,selling_price_pence,target_stock_milli,production_trigger_milli,direct_labour_minutes_milli,packaging_labour_minutes_milli,energy_cost_micros,overhead_cost_micros,selling_cost_micros,active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
    item.id, item.sku, item.name, item.collection, item.candleType, item.containerSizeMl, item.waxWeightMilli, item.fragrance, item.fragranceBps, item.wickType, item.colour,
    item.sellingPricePence, item.targetStockMilli, item.productionTriggerMilli, item.directLabourMinutesMilli, item.packagingLabourMinutesMilli, item.energyCostMicros,
    item.overheadCostMicros, item.sellingCostMicros, item.active ? 1 : 0,
  ));

  for (const item of workbookSeed.bomItems) statements.push(db.prepare(`INSERT OR IGNORE INTO bom_items (product_id,material_id,quantity_milli) VALUES (?,?,?)`).bind(item.productId, item.materialId, item.quantityMilli));

  statements.push(db.prepare(`INSERT OR IGNORE INTO production_plans (id,name,status,notes) VALUES (?,?,?,?)`).bind("PLAN-IMPORT-001", "Imported workbook scenario", "scenario", "Planning scratchpad imported without reserving stock."));
  for (const line of workbookSeed.productionPlanLines) statements.push(db.prepare(`INSERT OR IGNORE INTO production_plan_lines (plan_id,line_no,product_id,desired_qty_milli,notes) VALUES (?,?,?,?,?)`).bind("PLAN-IMPORT-001", line.line, line.productId, line.desiredQtyMilli, nullable(line.notes)));

  for (const po of workbookSeed.purchaseOrders) {
    statements.push(db.prepare(`INSERT OR IGNORE INTO purchase_orders (po_number,order_date,supplier_id,status,expected_date,actual_date,notes) VALUES (?,?,?,?,?,?,?)`).bind(po.poNumber, po.orderDate, po.supplierId, po.status, nullable(po.expectedDate), nullable(po.actualDate), nullable(po.notes)));
    for (const line of po.lines) {
      const material = materialById.get(line.materialId!)!;
      const importedUnitPriceMicros = line.unitPriceMicros > 0 ? line.unitPriceMicros : material.unit_cost_micros;
      const importedReceivedQtyMilli = normalizedImportedReceipt(po.status, line.orderedQtyMilli, line.receivedQtyMilli);
      statements.push(db.prepare(`INSERT INTO purchase_order_lines (po_number,line_no,material_id,ordered_qty_milli,received_qty_milli,unit_price_micros,unit) VALUES (?,?,?,?,?,?,?) ON CONFLICT(po_number,line_no) DO UPDATE SET unit_price_micros=CASE WHEN purchase_order_lines.unit_price_micros=0 THEN excluded.unit_price_micros ELSE purchase_order_lines.unit_price_micros END`).bind(po.poNumber, line.lineNo, line.materialId, line.orderedQtyMilli, importedReceivedQtyMilli, importedUnitPriceMicros, line.unit ?? material.unit));
    }
  }

  const legacyOutputMovements = workbookSeed.stockMovements.filter((movement) => movement.movementType === "production_output" && movement.batchId && !workbookSeed.batches.some((batch) => String(batch.id) === String(movement.batchId)));
  const allBatches = [
    ...legacyOutputMovements.map((movement) => ({ id: movement.batchId!, productionDate: movement.date!, productId: movement.itemId!, plannedQtyMilli: Math.max(0, movement.quantityMilli), actualProducedMilli: Math.max(0, movement.quantityMilli), rejectedMilli: 0, status: "completed", operator: null, waxLot: null, fragranceLot: null, containerLot: null, notes: "Reconstructed from a legacy finished-goods output movement." })),
    ...workbookSeed.batches.map((batch) => ({ ...batch, id: batch.id!, productionDate: batch.productionDate!, productId: batch.productId! })),
  ];

  for (const batch of allBatches) {
    const unitCost = costByProduct.get(batch.productId)?.totalCostMicros ?? 0;
    const goodQty = Math.max(0, batch.actualProducedMilli - batch.rejectedMilli);
    const totalCost = batch.status === "completed" ? quantityCostMicros(batch.actualProducedMilli, unitCost) : null;
    const wasteCost = batch.status === "completed" ? quantityCostMicros(batch.rejectedMilli, unitCost) : null;
    statements.push(db.prepare(`INSERT OR IGNORE INTO production_batches (id,production_date,product_id,planned_qty_milli,actual_produced_milli,rejected_milli,status,operator,wax_lot,fragrance_lot,container_lot,unit_cost_snapshot_micros,total_cost_snapshot_micros,waste_cost_snapshot_micros,completed_at,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      batch.id, batch.productionDate, batch.productId, batch.plannedQtyMilli, batch.actualProducedMilli, batch.rejectedMilli, batch.status, nullable(batch.operator), nullable(batch.waxLot),
      nullable(batch.fragranceLot), nullable(batch.containerLot), batch.status === "completed" ? unitCost : null, totalCost, wasteCost, batch.status === "completed" ? `${batch.productionDate}T17:00:00.000Z` : null, nullable(batch.notes),
    ));
    void goodQty;
  }

  const existingWasteMovementByKey = new Map<string, string>();
  for (const movement of workbookSeed.stockMovements) {
    const material = movement.itemKind === "material" ? materialById.get(movement.itemId!) : null;
    const productCost = movement.itemKind === "product" ? costByProduct.get(movement.itemId!) : null;
    const unitCost = material?.unit_cost_micros ?? productCost?.totalCostMicros ?? 0;
    const matchingWaste = workbookSeed.wasteEvents.find((event) => movement.movementType === "waste" && movement.batchId === event.batchId && movement.itemId === event.materialId && Math.abs(movement.quantityMilli) === event.quantityMilli);
    if (matchingWaste) existingWasteMovementByKey.set(matchingWaste.id!, movement.id!);
    statements.push(db.prepare(`INSERT OR IGNORE INTO stock_movements (id,occurred_on,item_kind,item_id,movement_type,quantity_milli,unit_cost_micros,batch_id,po_number,lot_ref,waste_event_id,reason,source) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      movement.id, movement.date, movement.itemKind, movement.itemId, movement.movementType, movement.quantityMilli, unitCost, nullable(movement.batchId), nullable(movement.poNumber),
      nullable(movement.lotRef), matchingWaste?.id ?? null, nullable(movement.notes), "workbook_import",
    ));
  }

  const correctionMovements: Array<{ id: string; date: string; itemKind: "material" | "product"; itemId: string; movementType: string; quantityMilli: number; unitCostMicros: number; batchId?: string | null; poNumber?: string | null; lotRef?: string | null; wasteEventId?: string | null; reason: string }> = [];

  for (const po of workbookSeed.purchaseOrders) {
    for (const line of po.lines) {
      const importedReceivedQtyMilli = normalizedImportedReceipt(po.status, line.orderedQtyMilli, line.receivedQtyMilli);
      if (importedReceivedQtyMilli <= 0) continue;
      const importedUnitPriceMicros = line.unitPriceMicros > 0 ? line.unitPriceMicros : materialById.get(line.materialId!)?.unit_cost_micros ?? 0;
      correctionMovements.push({ id: `MIG-${po.poNumber}-RECEIPT-${line.lineNo}`, date: po.actualDate ?? po.orderDate!, itemKind: "material", itemId: line.materialId!, movementType: "purchase_receipt", quantityMilli: importedReceivedQtyMilli, unitCostMicros: importedUnitPriceMicros, poNumber: po.poNumber!, lotRef: `IMPORT-${po.poNumber}`, reason: "Reconciled received PO quantity that was absent from the workbook ledger." });
    }
  }

  const batchesNeedingPosting = allBatches.filter((batch) => batch.status === "completed");
  const baseBatchMovements = new Set(workbookSeed.stockMovements.map((movement) => `${movement.batchId}|${movement.movementType}|${movement.itemId}`));
  for (const batch of batchesNeedingPosting) {
    for (const requirement of requiredMaterialsForProduct(batch.productId, batch.actualProducedMilli, base, false)) {
      if (baseBatchMovements.has(`${batch.id}|production_consumption|${requirement.materialId}`)) continue;
      const material = materialById.get(requirement.materialId)!;
      correctionMovements.push({ id: `MIG-${batch.id}-${requirement.materialId}`, date: batch.productionDate, itemKind: "material", itemId: requirement.materialId, movementType: "production_consumption", quantityMilli: -requirement.requiredQtyMilli, unitCostMicros: material.unit_cost_micros, batchId: batch.id, lotRef: null, reason: "Reconciled material consumption missing from the workbook ledger." });
    }
    if (!baseBatchMovements.has(`${batch.id}|production_output|${batch.productId}`)) {
      const goodQty = Math.max(0, batch.actualProducedMilli - batch.rejectedMilli);
      correctionMovements.push({ id: `MIG-${batch.id}-OUTPUT`, date: batch.productionDate, itemKind: "product", itemId: batch.productId, movementType: "production_output", quantityMilli: goodQty, unitCostMicros: costByProduct.get(batch.productId)?.totalCostMicros ?? 0, batchId: batch.id, lotRef: `FG-${batch.id}`, reason: "Reconciled finished-goods output missing from the workbook ledger." });
    }
  }

  for (const event of workbookSeed.wasteEvents) {
    let movementId = existingWasteMovementByKey.get(event.id!);
    if (!movementId) {
      movementId = `MIG-${event.id}-WASTE`;
      const material = materialById.get(event.materialId!)!;
      correctionMovements.push({ id: movementId, date: event.date!, itemKind: "material", itemId: event.materialId!, movementType: "waste", quantityMilli: -event.quantityMilli, unitCostMicros: material.unit_cost_micros, batchId: event.batchId, lotRef: event.lotRef, wasteEventId: event.id, reason: `Reconciled ${event.wasteType} event missing from the workbook ledger.` });
    }
    const material = materialById.get(event.materialId!)!;
    statements.push(db.prepare(`INSERT OR IGNORE INTO waste_events (id,occurred_on,batch_id,product_id,material_id,waste_type,lot_ref,quantity_milli,unit,unit_cost_snapshot_micros,stock_movement_id,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      event.id, event.date, nullable(event.batchId), nullable(event.productId), event.materialId, event.wasteType, nullable(event.lotRef), event.quantityMilli, event.unit,
      material.unit_cost_micros, movementId, nullable(event.notes),
    ));
  }

  for (const movement of correctionMovements) statements.push(db.prepare(`INSERT INTO stock_movements (id,occurred_on,item_kind,item_id,movement_type,quantity_milli,unit_cost_micros,batch_id,po_number,lot_ref,waste_event_id,reason,source) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET unit_cost_micros=CASE WHEN stock_movements.unit_cost_micros=0 THEN excluded.unit_cost_micros ELSE stock_movements.unit_cost_micros END`).bind(
    movement.id, movement.date, movement.itemKind, movement.itemId, movement.movementType, movement.quantityMilli, movement.unitCostMicros, nullable(movement.batchId), nullable(movement.poNumber),
    nullable(movement.lotRef), nullable(movement.wasteEventId), movement.reason, "migration_reconciliation",
  ));

  const importAudits = [
    { id: "AUD-IMPORT-001", entity: "workbook", action: "workbook_imported", effects: { worksheets: 15, formulasAudited: workbookSeed.source.formulaCount, recordsImported: { suppliers: workbookSeed.suppliers.length, materials: workbookSeed.materials.length, products: workbookSeed.products.length, bomLines: workbookSeed.bomItems.length } } },
    { id: "AUD-IMPORT-002", entity: "data_quality", action: "placeholder_values_cleaned", effects: { strayLiteralFoursFound: workbookSeed.source.strayPlaceholderCount, legitimateLineNumberRetained: 1, invalidPlaceholdersRemoved: workbookSeed.source.strayPlaceholderCount - 1 } },
    { id: "AUD-IMPORT-003", entity: "ledger", action: "missing_stock_effects_reconciled", effects: { correctionMovements: correctionMovements.length, completedBatchesReconciled: batchesNeedingPosting.length, wasteRecordsLinked: workbookSeed.wasteEvents.length } },
    { id: "AUD-IMPORT-004", entity: "calculation_policy", action: "calculation_model_corrected", effects: { fixes: ["single-count production reservations", "Draft POs excluded from projected stock", "VAT-exclusive gross margin", "planning waste allowance", "pack-rounded reorders", "historical cost snapshots", "non-negative asset valuation with deficits separately flagged"] } },
    { id: "AUD-IMPORT-005", entity: "purchase_orders", action: "partial_receipt_reconciled", effects: { poNumber: "PO-26002", workbookFormulaOutstandingUnits: 72, noteStatedOutstandingUnits: 36, adoptedReceivedUnits: 72, adoptedOutstandingUnits: 36 } },
    { id: "AUD-IMPORT-006", entity: "purchase_orders", action: "purchase_prices_reconstructed", effects: { zeroPricedPoLines: 6, basis: "Imported material base-unit purchase cost", downstreamChecksRestored: ["PO total", "outstanding value", "supplier minimum"] } },
    { id: "AUD-IMPORT-007", entity: "purchase_orders", action: "receipt_status_normalized", effects: { workbookLinesWithReceivedEqualOrdered: 5, legitimateReceiptsRetained: ["PO-26002", "PO-26005"], nonReceivedStatusesForcedToZero: ["draft", "ordered", "cancelled"] } },
    { id: "AUD-IMPORT-008", entity: "controls", action: "concurrency_guards_installed", effects: { databaseGuards: ["material stock cannot cross below zero from an app write", "PO receipts cannot be double-posted"], transactionMode: "atomic D1 batch", idempotencyKeys: true } },
    { id: "AUD-CATALOGUE-001", entity: "supplier_catalogue", action: "supplier_catalogue_imported", effects: { supplierId: supplierCatalogue.source.supplierId, supplierName: supplierCatalogue.supplier.name, materialsAdded: supplierCatalogue.materials.length, initialOnHandMilli: 0, vatBps: supplierCatalogue.source.vatBps, priceCheckedOn: supplierCatalogue.source.priceCheckedOn, selectionBasis: supplierCatalogue.source.selectionBasis, productPagesAttached: true } },
  ];
  for (const audit of importAudits) statements.push(db.prepare(`INSERT INTO audit_events (id,occurred_at,actor,entity_type,entity_id,action,before_json,after_json,effects_json,source) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET occurred_at=excluded.occurred_at, effects_json=excluded.effects_json`).bind(
    audit.id, `${workbookSeed.source.importedOn}T08:00:00.000Z`, "Migration engine", audit.entity, audit.id, audit.action, null, null, json(audit.effects), "migration_reconciliation",
  ));

  await runChunks(db, statements);
  await db.prepare(`INSERT INTO app_meta (key,value,updated_at) VALUES ('seed_version',?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP`).bind(SEED_VERSION).run();
}

async function queryRows<T>(db: D1Database, sql: string, ...bindings: unknown[]): Promise<T[]> {
  const result = await db.prepare(sql).bind(...bindings).all<T>();
  return result.results ?? [];
}

export async function loadDomainState(): Promise<DomainState> {
  await ensureSeeded();
  const db = database();
  const results = await db.batch([
    db.prepare("SELECT * FROM settings WHERE workspace_id = ?").bind(WORKSPACE_ID),
    db.prepare("SELECT * FROM suppliers ORDER BY id"),
    db.prepare("SELECT * FROM materials ORDER BY id"),
    db.prepare("SELECT * FROM products ORDER BY id"),
    db.prepare("SELECT * FROM bom_items ORDER BY product_id, id"),
    db.prepare("SELECT * FROM stock_movements ORDER BY occurred_on, created_at, id"),
    db.prepare("SELECT * FROM purchase_orders ORDER BY order_date DESC, po_number DESC"),
    db.prepare("SELECT * FROM purchase_order_lines ORDER BY po_number, line_no"),
    db.prepare("SELECT * FROM production_batches ORDER BY production_date DESC, id DESC"),
    db.prepare("SELECT * FROM waste_events ORDER BY occurred_on DESC, id DESC"),
    db.prepare("SELECT * FROM production_plan_lines ORDER BY plan_id, line_no"),
    db.prepare("SELECT * FROM audit_events ORDER BY occurred_at DESC, id DESC LIMIT 200"),
  ]);
  const rows = <T,>(index: number) => (results[index].results ?? []) as T[];
  const settings = rows<SettingsRow>(0)[0];
  if (!settings) throw new Error("Workspace settings are missing.");
  return {
    settings,
    suppliers: rows<SupplierRow>(1),
    materials: rows<MaterialRow>(2),
    products: rows<ProductRow>(3),
    bomItems: rows<BomRow>(4),
    movements: rows<MovementRow>(5),
    purchaseOrders: rows<PurchaseOrderRow>(6),
    purchaseOrderLines: rows<PurchaseOrderLineRow>(7),
    batches: rows<BatchRow>(8),
    wasteEvents: rows<WasteRow>(9),
    planLines: rows<PlanLineRow>(10),
    auditEvents: rows<AuditRow>(11),
  };
}

export async function loadSnapshot() {
  return computeSnapshot(await loadDomainState());
}

export function requestActor(request: Request) {
  const encoded = request.headers.get("oai-authenticated-user-full-name");
  const name = encoded && request.headers.get("oai-authenticated-user-full-name-encoding") === "percent-encoded-utf-8" ? decodeURIComponent(encoded) : encoded;
  return name || request.headers.get("oai-authenticated-user-email") || "Workspace owner";
}

async function existingIdempotentResponse(key: string) {
  const row = await database().prepare("SELECT response_json FROM idempotency_keys WHERE key = ?").bind(key).first<{ response_json: string }>();
  return row ? JSON.parse(row.response_json) : null;
}

function validateIdempotencyKey(key: unknown) {
  if (typeof key !== "string" || key.length < 8 || key.length > 160) throw new Error("A valid idempotency key is required.");
  return key;
}

function auditStatement(db: D1Database, input: { actor: string; entityType: string; entityId: string; action: string; before?: unknown; after?: unknown; effects: unknown; idempotencyKey: string }) {
  return db.prepare(`INSERT INTO audit_events (id,occurred_at,actor,entity_type,entity_id,action,before_json,after_json,effects_json,idempotency_key,source) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(
    safeId("AUD"), nowIso(), input.actor, input.entityType, input.entityId, input.action, input.before === undefined ? null : json(input.before), input.after === undefined ? null : json(input.after), json(input.effects), input.idempotencyKey, "app",
  );
}

function idempotencyStatement(db: D1Database, key: string, action: string, response: unknown) {
  return db.prepare("INSERT INTO idempotency_keys (key,action,response_json) VALUES (?,?,?)").bind(key, action, json(response));
}

export async function receivePurchaseOrder(payload: Record<string, unknown>, actor: string) {
  const db = database();
  const key = validateIdempotencyKey(payload.idempotencyKey);
  const existing = await existingIdempotentResponse(key);
  if (existing) return existing;
  const poNumber = String(payload.poNumber ?? "");
  const lineId = Number(payload.lineId);
  const quantityMilli = Number(payload.quantityMilli);
  const lotRef = String(payload.lotRef ?? "").trim();
  const occurredOn = String(payload.occurredOn ?? todayIso());
  if (!poNumber || !Number.isInteger(lineId) || !Number.isInteger(quantityMilli) || quantityMilli <= 0 || !lotRef) throw new Error("PO line, received quantity, date and lot reference are required.");
  const po = await db.prepare("SELECT * FROM purchase_orders WHERE po_number = ?").bind(poNumber).first<PurchaseOrderRow>();
  const line = await db.prepare("SELECT * FROM purchase_order_lines WHERE id = ? AND po_number = ?").bind(lineId, poNumber).first<PurchaseOrderLineRow>();
  if (!po || !line) throw new Error("Purchase order line was not found.");
  if (!["ordered", "part_received"].includes(po.status)) throw new Error("Only ordered or part-received POs can receive stock.");
  const outstanding = line.ordered_qty_milli - line.received_qty_milli;
  if (quantityMilli > outstanding) throw new Error("Receipt exceeds the outstanding PO quantity.");
  const material = await db.prepare("SELECT * FROM materials WHERE id = ?").bind(line.material_id).first<MaterialRow>();
  if (!material) throw new Error("The PO material no longer exists.");
  const settings = await db.prepare("SELECT vat_bps FROM settings WHERE workspace_id = ?").bind(WORKSPACE_ID).first<Pick<SettingsRow, "vat_bps">>();
  if (!settings) throw new Error("Workspace VAT settings are unavailable.");
  const newReceived = line.received_qty_milli + quantityMilli;
  const poLines = await queryRows<PurchaseOrderLineRow>(db, "SELECT * FROM purchase_order_lines WHERE po_number = ?", poNumber);
  const newStatus = purchaseOrderStatusAfterReceipt(poLines, line.id, newReceived);
  const movementId = safeId("MOV-RECEIPT");
  const response = { ok: true, message: `${material.name} receipt posted`, poNumber, lineId, movementId, receivedQtyMilli: quantityMilli, outstandingQtyMilli: line.ordered_qty_milli - newReceived, status: newStatus };
  const purchasePriceMicros = quantityCostMicros(material.pack_size_milli, line.unit_price_micros);
  const purchasePriceIncVatMicros = Math.round((purchasePriceMicros * (10_000 + settings.vat_bps)) / 10_000);
  await db.batch([
    db.prepare("UPDATE purchase_order_lines SET received_qty_milli = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND received_qty_milli = ?").bind(newReceived, lineId, line.received_qty_milli),
    db.prepare("UPDATE purchase_orders SET status = ?, actual_date = ?, updated_at = CURRENT_TIMESTAMP WHERE po_number = ?").bind(newStatus, newStatus === "received" ? occurredOn : null, poNumber),
    db.prepare("UPDATE materials SET unit_cost_micros = ?, last_purchase_unit_cost_micros = ?, purchase_price_micros = ?, purchase_price_inc_vat_micros = ?, price_checked_on = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(line.unit_price_micros, line.unit_price_micros, purchasePriceMicros, purchasePriceIncVatMicros, occurredOn, material.id),
    db.prepare(`INSERT INTO stock_movements (id,occurred_on,item_kind,item_id,movement_type,quantity_milli,unit_cost_micros,po_number,lot_ref,reason,source) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(movementId, occurredOn, "material", material.id, "purchase_receipt", quantityMilli, line.unit_price_micros, poNumber, lotRef, "PO receipt posted in the application.", "app"),
    auditStatement(db, { actor, entityType: "purchase_order", entityId: poNumber, action: "receipt_posted", before: { status: po.status, receivedQtyMilli: line.received_qty_milli }, after: { status: newStatus, receivedQtyMilli: newReceived }, effects: { stockIncrease: { materialId: material.id, quantityMilli }, costUpdate: { oldUnitCostMicros: material.unit_cost_micros, newUnitCostMicros: line.unit_price_micros, purchasePriceMicros, purchasePriceIncVatMicros, vatBps: settings.vat_bps, priceCheckedOn: occurredOn }, movementId }, idempotencyKey: key }),
    idempotencyStatement(db, key, "receive_purchase_order", response),
  ]);
  return response;
}

export async function createBatch(payload: Record<string, unknown>, actor: string) {
  const db = database();
  const key = validateIdempotencyKey(payload.idempotencyKey);
  const existing = await existingIdempotentResponse(key);
  if (existing) return existing;
  const productId = String(payload.productId ?? "");
  const plannedQtyMilli = Number(payload.plannedQtyMilli);
  const operator = String(payload.operator ?? "").trim();
  const productionDate = String(payload.productionDate ?? todayIso());
  if (!productId || !Number.isInteger(plannedQtyMilli) || plannedQtyMilli <= 0) throw new Error("Product and a positive planned quantity are required.");
  const product = await db.prepare("SELECT id,name FROM products WHERE id = ? AND active = 1").bind(productId).first<{ id: string; name: string }>();
  if (!product) throw new Error("The selected product is unavailable.");
  const batchId = safeId("BAT").slice(0, 24).toUpperCase();
  const response = { ok: true, message: `${product.name} batch planned`, batchId };
  await db.batch([
    db.prepare(`INSERT INTO production_batches (id,production_date,product_id,planned_qty_milli,status,operator,wax_lot,fragrance_lot,container_lot,notes) VALUES (?,?,?,?,?,?,?,?,?,?)`).bind(batchId, productionDate, productId, plannedQtyMilli, "planned", operator || null, nullable(payload.waxLot), nullable(payload.fragranceLot), nullable(payload.containerLot), nullable(payload.notes)),
    auditStatement(db, { actor, entityType: "production_batch", entityId: batchId, action: "batch_planned", after: { productId, plannedQtyMilli, productionDate, operator }, effects: { materialReservationsRecalculated: true, stockLedgerChanged: false }, idempotencyKey: key }),
    idempotencyStatement(db, key, "create_batch", response),
  ]);
  return response;
}

export async function completeBatch(payload: Record<string, unknown>, actor: string) {
  const db = database();
  const key = validateIdempotencyKey(payload.idempotencyKey);
  const existing = await existingIdempotentResponse(key);
  if (existing) return existing;
  const batchId = String(payload.batchId ?? "");
  const actualProducedMilli = Number(payload.actualProducedMilli);
  const rejectedMilli = Number(payload.rejectedMilli ?? 0);
  if (!batchId || !Number.isInteger(actualProducedMilli) || actualProducedMilli <= 0 || !Number.isInteger(rejectedMilli) || rejectedMilli < 0 || rejectedMilli > actualProducedMilli) throw new Error("Actual output must be positive and rejects cannot exceed output.");
  const state = await loadDomainState();
  const batch = state.batches.find((item) => item.id === batchId);
  if (!batch) throw new Error("Batch was not found.");
  if (!["planned", "in_production"].includes(batch.status)) throw new Error("Only planned or in-production batches can be completed.");
  const product = state.products.find((item) => item.id === batch.product_id)!;
  const requirements = requiredMaterialsForProduct(batch.product_id, actualProducedMilli, state, false);
  const balances = new Map<string, number>();
  for (const movement of state.movements) if (movement.item_kind === "material") balances.set(movement.item_id, (balances.get(movement.item_id) ?? 0) + movement.quantity_milli);
  const shortages = requirements.filter((item) => (balances.get(item.materialId) ?? 0) < item.requiredQtyMilli);
  if (shortages.length) {
    const labels = shortages.map((item) => state.materials.find((material) => material.id === item.materialId)?.name ?? item.materialId);
    throw new Error(`Batch cannot complete: insufficient ${labels.join(", ")}. No stock was changed.`);
  }
  const cost = computeProductCost(product, state);
  const goodQtyMilli = actualProducedMilli - rejectedMilli;
  const totalCostMicros = quantityCostMicros(actualProducedMilli, cost.totalCostMicros);
  const wasteCostMicros = quantityCostMicros(rejectedMilli, cost.totalCostMicros);
  const statements: Statement[] = [db.prepare("UPDATE production_batches SET actual_produced_milli = ?, rejected_milli = ?, status = 'completed', unit_cost_snapshot_micros = ?, total_cost_snapshot_micros = ?, waste_cost_snapshot_micros = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('planned','in_production')").bind(actualProducedMilli, rejectedMilli, cost.totalCostMicros, totalCostMicros, wasteCostMicros, nowIso(), batchId)];
  const effects: Array<{ movementId: string; itemId: string; quantityMilli: number }> = [];
  for (const requirement of requirements) {
    const material = state.materials.find((item) => item.id === requirement.materialId)!;
    const movementId = `MOV-${batchId}-${material.id}`;
    effects.push({ movementId, itemId: material.id, quantityMilli: -requirement.requiredQtyMilli });
    statements.push(db.prepare(`INSERT INTO stock_movements (id,occurred_on,item_kind,item_id,movement_type,quantity_milli,unit_cost_micros,batch_id,lot_ref,reason,source) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(movementId, batch.production_date, "material", material.id, "production_consumption", -requirement.requiredQtyMilli, material.unit_cost_micros, batchId, batch.wax_lot || batch.fragrance_lot || batch.container_lot || null, "Atomic batch completion consumption.", "app"));
  }
  const outputMovementId = `MOV-${batchId}-OUTPUT`;
  effects.push({ movementId: outputMovementId, itemId: product.id, quantityMilli: goodQtyMilli });
  statements.push(db.prepare(`INSERT INTO stock_movements (id,occurred_on,item_kind,item_id,movement_type,quantity_milli,unit_cost_micros,batch_id,lot_ref,reason,source) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(outputMovementId, batch.production_date, "product", product.id, "production_output", goodQtyMilli, cost.totalCostMicros, batchId, `FG-${batchId}`, "Atomic batch completion output.", "app"));
  const response = { ok: true, message: `${product.name} batch completed`, batchId, goodQtyMilli, totalCostMicros, outputMovementId };
  statements.push(auditStatement(db, { actor, entityType: "production_batch", entityId: batchId, action: "batch_completed", before: { status: batch.status, actualProducedMilli: batch.actual_produced_milli, rejectedMilli: batch.rejected_milli }, after: { status: "completed", actualProducedMilli, rejectedMilli, goodQtyMilli, unitCostSnapshotMicros: cost.totalCostMicros }, effects: { movements: effects, reservationsReleased: true, costingSnapshotFrozen: true }, idempotencyKey: key }));
  statements.push(idempotencyStatement(db, key, "complete_batch", response));
  await db.batch(statements);
  return response;
}

export async function recordWaste(payload: Record<string, unknown>, actor: string) {
  const db = database();
  const key = validateIdempotencyKey(payload.idempotencyKey);
  const existing = await existingIdempotentResponse(key);
  if (existing) return existing;
  const materialId = String(payload.materialId ?? "");
  const quantityMilli = Number(payload.quantityMilli);
  const wasteType = String(payload.wasteType ?? "").trim();
  const lotRef = String(payload.lotRef ?? "").trim();
  const occurredOn = String(payload.occurredOn ?? todayIso());
  if (!materialId || !Number.isInteger(quantityMilli) || quantityMilli <= 0 || !wasteType || !lotRef) throw new Error("Material, positive quantity, waste type and lot reference are required.");
  const material = await db.prepare("SELECT * FROM materials WHERE id = ?").bind(materialId).first<MaterialRow>();
  if (!material) throw new Error("Material was not found.");
  const balance = await db.prepare("SELECT COALESCE(SUM(quantity_milli),0) AS quantity FROM stock_movements WHERE item_kind = 'material' AND item_id = ?").bind(materialId).first<{ quantity: number }>();
  if ((balance?.quantity ?? 0) < quantityMilli) throw new Error("Waste exceeds stock on hand. No stock was changed.");
  const wasteId = safeId("WST").slice(0, 24).toUpperCase();
  const movementId = `MOV-${wasteId}-WASTE`;
  const response = { ok: true, message: `${material.name} waste recorded`, wasteId, movementId, quantityMilli };
  await db.batch([
    db.prepare(`INSERT INTO stock_movements (id,occurred_on,item_kind,item_id,movement_type,quantity_milli,unit_cost_micros,batch_id,lot_ref,waste_event_id,reason,source) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).bind(movementId, occurredOn, "material", materialId, "waste", -quantityMilli, material.unit_cost_micros, nullable(payload.batchId), lotRef, wasteId, wasteType, "app"),
    db.prepare(`INSERT INTO waste_events (id,occurred_on,batch_id,product_id,material_id,waste_type,lot_ref,quantity_milli,unit,unit_cost_snapshot_micros,stock_movement_id,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).bind(wasteId, occurredOn, nullable(payload.batchId), nullable(payload.productId), materialId, wasteType, lotRef, quantityMilli, material.unit, material.unit_cost_micros, movementId, nullable(payload.notes)),
    auditStatement(db, { actor, entityType: "waste_event", entityId: wasteId, action: "waste_recorded", after: { materialId, quantityMilli, wasteType, lotRef }, effects: { stockDecrease: { materialId, quantityMilli }, movementId, costSnapshotMicros: quantityCostMicros(quantityMilli, material.unit_cost_micros) }, idempotencyKey: key }),
    idempotencyStatement(db, key, "record_waste", response),
  ]);
  return response;
}

export async function createPurchaseOrder(payload: Record<string, unknown>, actor: string) {
  const db = database();
  const key = validateIdempotencyKey(payload.idempotencyKey);
  const existing = await existingIdempotentResponse(key);
  if (existing) return existing;
  const materialId = String(payload.materialId ?? "");
  const orderedQtyMilli = Number(payload.orderedQtyMilli);
  const orderDate = String(payload.orderDate ?? todayIso());
  const material = await db.prepare("SELECT * FROM materials WHERE id = ? AND active = 1").bind(materialId).first<MaterialRow>();
  if (!material || !material.supplier_id) throw new Error("Select an active material with an assigned supplier.");
  if (!Number.isInteger(orderedQtyMilli) || orderedQtyMilli <= 0 || orderedQtyMilli % material.pack_size_milli !== 0) throw new Error("Order quantity must be a positive whole pack multiple.");
  const supplier = await db.prepare("SELECT * FROM suppliers WHERE id = ? AND active = 1").bind(material.supplier_id).first<SupplierRow>();
  if (!supplier) throw new Error("The material supplier is unavailable.");
  const openDraft = await db.prepare("SELECT * FROM purchase_orders WHERE supplier_id = ? AND status = 'draft' ORDER BY order_date, po_number LIMIT 1").bind(supplier.id).first<PurchaseOrderRow>();
  if (openDraft) {
    const existingLine = await db.prepare("SELECT id FROM purchase_order_lines WHERE po_number = ? AND material_id = ?").bind(openDraft.po_number, materialId).first<{ id: number }>();
    if (existingLine) throw new Error(`${material.name} is already on ${openDraft.po_number}.`);
    const nextLine = await db.prepare("SELECT COALESCE(MAX(line_no),0) + 1 AS line_no FROM purchase_order_lines WHERE po_number = ?").bind(openDraft.po_number).first<{ line_no: number }>();
    const lineNo = nextLine?.line_no ?? 1;
    const response = { ok: true, message: `${material.name} added to ${openDraft.po_number}`, poNumber: openDraft.po_number, lineNo };
    await db.batch([
      db.prepare("INSERT INTO purchase_order_lines (po_number,line_no,material_id,ordered_qty_milli,received_qty_milli,unit_price_micros,unit) VALUES (?,?,?,?,?,?,?)").bind(openDraft.po_number, lineNo, materialId, orderedQtyMilli, 0, material.unit_cost_micros, material.unit),
      auditStatement(db, { actor, entityType: "purchase_order", entityId: openDraft.po_number, action: "po_line_added", after: { supplierId: supplier.id, materialId, orderedQtyMilli, lineNo }, effects: { projectedStockChanged: false, draftExcludedUntilSubmitted: true, supplierMinimumRecalculated: true }, idempotencyKey: key }),
      idempotencyStatement(db, key, "create_purchase_order", response),
    ]);
    return response;
  }
  const sequence = await db.prepare("SELECT COUNT(*) AS count FROM purchase_orders").first<{ count: number }>();
  const poNumber = `PO-${todayIso().slice(2, 4)}${String((sequence?.count ?? 0) + 1).padStart(3, "0")}`;
  const expectedDate = addDays(orderDate, material.lead_time_days || supplier.lead_time_days);
  const response = { ok: true, message: `${poNumber} drafted`, poNumber };
  await db.batch([
    db.prepare("INSERT INTO purchase_orders (po_number,order_date,supplier_id,status,expected_date,notes) VALUES (?,?,?,?,?,?)").bind(poNumber, orderDate, supplier.id, "draft", expectedDate, nullable(payload.notes)),
    db.prepare("INSERT INTO purchase_order_lines (po_number,line_no,material_id,ordered_qty_milli,received_qty_milli,unit_price_micros,unit) VALUES (?,?,?,?,?,?,?)").bind(poNumber, 1, materialId, orderedQtyMilli, 0, material.unit_cost_micros, material.unit),
    auditStatement(db, { actor, entityType: "purchase_order", entityId: poNumber, action: "po_drafted", after: { supplierId: supplier.id, materialId, orderedQtyMilli, expectedDate }, effects: { projectedStockChanged: false, draftExcludedUntilSubmitted: true }, idempotencyKey: key }),
    idempotencyStatement(db, key, "create_purchase_order", response),
  ]);
  return response;
}

export async function submitPurchaseOrder(payload: Record<string, unknown>, actor: string) {
  const db = database();
  const key = validateIdempotencyKey(payload.idempotencyKey);
  const existing = await existingIdempotentResponse(key);
  if (existing) return existing;
  const poNumber = String(payload.poNumber ?? "");
  const po = await db.prepare("SELECT * FROM purchase_orders WHERE po_number = ?").bind(poNumber).first<PurchaseOrderRow>();
  if (!po || po.status !== "draft") throw new Error("Only a Draft PO can be submitted.");
  const supplier = await db.prepare("SELECT * FROM suppliers WHERE id = ?").bind(po.supplier_id).first<SupplierRow>();
  const lines = await queryRows<PurchaseOrderLineRow>(db, "SELECT * FROM purchase_order_lines WHERE po_number = ?", poNumber);
  const totalMicros = lines.reduce((sum, line) => sum + quantityCostMicros(line.ordered_qty_milli, line.unit_price_micros), 0);
  if (totalMicros < (supplier?.minimum_order_pence ?? 0) * 10_000) throw new Error("PO total is below the supplier minimum order value.");
  const response = { ok: true, message: `${poNumber} submitted`, poNumber, status: "ordered" };
  await db.batch([
    db.prepare("UPDATE purchase_orders SET status = 'ordered', updated_at = CURRENT_TIMESTAMP WHERE po_number = ? AND status = 'draft'").bind(poNumber),
    auditStatement(db, { actor, entityType: "purchase_order", entityId: poNumber, action: "po_submitted", before: { status: "draft" }, after: { status: "ordered" }, effects: { projectedStockNowIncludesOutstanding: true, totalMicros }, idempotencyKey: key }),
    idempotencyStatement(db, key, "submit_purchase_order", response),
  ]);
  return response;
}

export async function updateSettings(payload: Record<string, unknown>, actor: string) {
  const db = database();
  const key = validateIdempotencyKey(payload.idempotencyKey);
  const existing = await existingIdempotentResponse(key);
  if (existing) return existing;
  const current = await db.prepare("SELECT * FROM settings WHERE workspace_id = ?").bind(WORKSPACE_ID).first<SettingsRow>();
  if (!current) throw new Error("Workspace settings were not found.");
  const next = {
    businessName: String(payload.businessName ?? current.business_name).trim(),
    vatBps: Number(payload.vatBps ?? current.vat_bps),
    wasteBps: Number(payload.wasteBps ?? current.waste_bps),
    labourRatePencePerHour: Number(payload.labourRatePencePerHour ?? current.labour_rate_pence_per_hour),
    targetMarginBps: Number(payload.targetMarginBps ?? current.target_margin_bps),
  };
  if (!next.businessName || ![next.vatBps, next.wasteBps, next.labourRatePencePerHour, next.targetMarginBps].every(Number.isInteger)) throw new Error("Settings must be complete numeric values.");
  if (next.vatBps < 0 || next.vatBps > 5000 || next.wasteBps < 0 || next.wasteBps >= 5000 || next.labourRatePencePerHour <= 0 || next.targetMarginBps <= 0 || next.targetMarginBps >= 9500) throw new Error("One or more settings are outside safe operating limits.");
  const response = { ok: true, message: "Calculation policy updated" };
  await db.batch([
    db.prepare("UPDATE settings SET business_name = ?, vat_bps = ?, waste_bps = ?, labour_rate_pence_per_hour = ?, target_margin_bps = ?, updated_at = CURRENT_TIMESTAMP WHERE workspace_id = ?").bind(next.businessName, next.vatBps, next.wasteBps, next.labourRatePencePerHour, next.targetMarginBps, WORKSPACE_ID),
    auditStatement(db, { actor, entityType: "settings", entityId: WORKSPACE_ID, action: "calculation_policy_updated", before: current, after: next, effects: { productCostsRecalculated: true, marginsRecalculated: true, materialReservationsRecalculated: true, historicalSnapshotsChanged: false }, idempotencyKey: key }),
    idempotencyStatement(db, key, "update_settings", response),
  ]);
  return response;
}

export async function runAction(action: string, payload: Record<string, unknown>, actor: string) {
  if (action === "receive_purchase_order") return receivePurchaseOrder(payload, actor);
  if (action === "create_batch") return createBatch(payload, actor);
  if (action === "complete_batch") return completeBatch(payload, actor);
  if (action === "record_waste") return recordWaste(payload, actor);
  if (action === "create_purchase_order") return createPurchaseOrder(payload, actor);
  if (action === "submit_purchase_order") return submitPurchaseOrder(payload, actor);
  if (action === "update_settings") return updateSettings(payload, actor);
  throw new Error("Unknown action.");
}
