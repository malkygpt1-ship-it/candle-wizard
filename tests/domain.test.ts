import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  SCALE,
  activeReservations,
  assertPositiveInteger,
  computeProductCost,
  computeSnapshot,
  grossUpForWaste,
  labourCostMicros,
  movementBalances,
  normalizedImportedReceipt,
  openPurchaseQuantities,
  purchaseOrderStatusAfterReceipt,
  quantityCostMicros,
  roundOrderQuantity,
  simulatePlan,
  type DomainState,
  type MaterialRow,
  type ProductRow,
} from "../lib/domain.ts";
import { supplierCatalogue } from "../lib/supplier-catalogue.ts";

function material(input: Partial<MaterialRow> & Pick<MaterialRow, "id" | "name" | "category" | "unit_cost_micros">): MaterialRow {
  return {
    supplier_id: "SUP-1", supplier_sku: null, unit: "units", pack_size_milli: 36_000, purchase_price_micros: 0,
    last_purchase_unit_cost_micros: input.unit_cost_micros, minimum_stock_milli: 0, reorder_point_milli: 0,
    preferred_order_qty_milli: 0, lead_time_days: 7, location: "A1", active: 1, ...input,
  };
}

function product(input: Partial<ProductRow> = {}): ProductRow {
  return {
    id: "PRD-1", sku: "P-1", name: "Test Candle", collection: "Signature", candle_type: "Jar", selling_price_pence: 2200,
    target_stock_milli: 40_000, production_trigger_milli: 25_000, direct_labour_minutes_milli: 4_966,
    packaging_labour_minutes_milli: 1_448, energy_cost_micros: 250_000, overhead_cost_micros: 600_000,
    selling_cost_micros: 450_000, active: 1, ...input,
  };
}

function fixture(overrides: Partial<DomainState> = {}): DomainState {
  const materials: MaterialRow[] = [
    material({ id: "MAT-WAX", name: "Soy Wax", category: "WAX", unit: "g", unit_cost_micros: 3_300, pack_size_milli: 25_000_000, reorder_point_milli: 15_000_000, preferred_order_qty_milli: 25_000_000 }),
    material({ id: "MAT-JAR", name: "Amber Jar", category: "CONTAINERS", unit_cost_micros: 1_400_000, pack_size_milli: 48_000, reorder_point_milli: 150_000, preferred_order_qty_milli: 288_000 }),
    material({ id: "MAT-DOT", name: "Wick Sticker", category: "OTHER", unit_cost_micros: 18_000, pack_size_milli: 2_000_000 }),
  ];
  return {
    settings: { business_name: "Test Works", currency_code: "GBP", vat_bps: 2_000, waste_bps: 300, labour_rate_pence_per_hour: 1_450, target_margin_bps: 6_500 },
    suppliers: [{ id: "SUP-1", name: "Supplier", minimum_order_pence: 10_000, lead_time_days: 7, active: 1 }],
    materials,
    products: [product()],
    bomItems: [
      { product_id: "PRD-1", material_id: "MAT-WAX", quantity_milli: 180_000 },
      { product_id: "PRD-1", material_id: "MAT-JAR", quantity_milli: 1_000 },
      { product_id: "PRD-1", material_id: "MAT-DOT", quantity_milli: 1_000 },
    ],
    movements: [
      { id: "M1", occurred_on: "2026-08-01", item_kind: "material", item_id: "MAT-WAX", movement_type: "purchase_receipt", quantity_milli: 40_000_000, unit_cost_micros: 3_300 },
      { id: "M2", occurred_on: "2026-08-01", item_kind: "material", item_id: "MAT-JAR", movement_type: "purchase_receipt", quantity_milli: 310_000, unit_cost_micros: 1_400_000 },
      { id: "M3", occurred_on: "2026-08-01", item_kind: "material", item_id: "MAT-DOT", movement_type: "purchase_receipt", quantity_milli: 2_000_000, unit_cost_micros: 18_000 },
      { id: "M4", occurred_on: "2026-08-01", item_kind: "product", item_id: "PRD-1", movement_type: "production_output", quantity_milli: 28_000, unit_cost_micros: 0 },
    ],
    purchaseOrders: [], purchaseOrderLines: [], batches: [], wasteEvents: [], planLines: [], auditEvents: [],
    ...overrides,
  };
}

function catalogueMaterialRows(): MaterialRow[] {
  return supplierCatalogue.materials.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    supplier_id: item.supplierId,
    supplier_sku: item.supplierSku,
    unit: item.unit,
    pack_size_milli: item.packSizeMilli,
    purchase_price_micros: item.purchasePriceMicros,
    purchase_price_inc_vat_micros: item.purchasePriceIncVatMicros,
    unit_cost_micros: item.unitCostMicros,
    last_purchase_unit_cost_micros: item.lastPurchaseUnitCostMicros,
    minimum_stock_milli: item.minimumStockMilli,
    reorder_point_milli: item.reorderPointMilli,
    preferred_order_qty_milli: item.preferredOrderQtyMilli,
    lead_time_days: item.leadTimeDays,
    location: item.location,
    supplier_product_url: item.supplierProductUrl,
    price_checked_on: item.priceCheckedOn,
    active: item.active ? 1 : 0,
  }));
}

test("fractional base-unit costs retain sub-penny precision", () => assert.equal(quantityCostMicros(180_000, 3_300), 594_000));
test("labour rate converts minutes to micro-GBP deterministically", () => assert.equal(labourCostMicros(60_000, 1_450), 14_500_000));
test("zero waste leaves requirement unchanged", () => assert.equal(grossUpForWaste(180_000, 0), 180_000));
test("3% waste is grossed up once", () => assert.equal(grossUpForWaste(180_000, 300), 185_568));
test("100% waste is rejected", () => assert.throws(() => grossUpForWaste(1_000, 10_000), /below 100/));
test("small reorder shortfall respects preferred order", () => assert.equal(roundOrderQuantity(10_000, 216_000, 36_000), 216_000));
test("order recommendation rounds upward to a whole pack", () => assert.equal(roundOrderQuantity(217_000, 216_000, 36_000), 252_000));
test("no shortfall produces no order", () => assert.equal(roundOrderQuantity(0, 216_000, 36_000), 0));
test("negative and zero operational quantities are rejected", () => { assert.throws(() => assertPositiveInteger(-1, "qty")); assert.throws(() => assertPositiveInteger(0, "qty")); });

test("imported receipt quantities obey the PO lifecycle instead of worksheet placeholders", () => {
  assert.equal(normalizedImportedReceipt("draft", 25_000, 25_000), 0);
  assert.equal(normalizedImportedReceipt("ordered", 25_000, 25_000), 0);
  assert.equal(normalizedImportedReceipt("cancelled", 25_000, 25_000), 0);
  assert.equal(normalizedImportedReceipt("part_received", 25_000, 8_000), 8_000);
  assert.equal(normalizedImportedReceipt("received", 25_000, 0), 25_000);
});

test("multi-line PO status remains part received until every line is complete", () => {
  const lines = [
    { id: 1, po_number: "PO", line_no: 1, material_id: "A", ordered_qty_milli: 10_000, received_qty_milli: 0, unit_price_micros: 1, unit: "units" },
    { id: 2, po_number: "PO", line_no: 2, material_id: "B", ordered_qty_milli: 20_000, received_qty_milli: 20_000, unit_price_micros: 1, unit: "units" },
  ];
  assert.equal(purchaseOrderStatusAfterReceipt(lines, 1, 10_000), "received");
  assert.equal(purchaseOrderStatusAfterReceipt(lines, 1, 5_000), "part_received");
});

test("BOM cost classifies raw, packaging and other correctly", () => {
  const cost = computeProductCost(product({ direct_labour_minutes_milli: 0, packaging_labour_minutes_milli: 0, energy_cost_micros: 0, overhead_cost_micros: 0, selling_cost_micros: 0 }), fixture());
  assert.equal(cost.rawBaseMicros, 594_000); assert.equal(cost.packagingMicros, 1_400_000); assert.equal(cost.otherMicros, 18_000);
});

test("connected labour setting changes current product cost", () => {
  const state = fixture();
  const low = computeProductCost(state.products[0], state).totalCostMicros;
  state.settings.labour_rate_pence_per_hour = 2_900;
  const high = computeProductCost(state.products[0], state).totalCostMicros;
  assert.ok(high > low);
});

test("VAT-inclusive revenue is converted to ex-VAT before margin", () => {
  const state = fixture(); const cost = computeProductCost(state.products[0], state);
  const naiveInclusiveMarginBps = Math.round(((22_000_000 - cost.totalCostMicros) * 10_000) / 22_000_000);
  assert.equal(cost.exVatRevenueMicros, 18_333_333); assert.ok(cost.grossMarginBps < naiveInclusiveMarginBps);
});

test("suggested retail includes VAT after applying target margin", () => {
  const state = fixture(); const cost = computeProductCost(state.products[0], state);
  assert.ok(cost.suggestedRetailPence > Math.ceil(cost.totalCostMicros / (1 - .65) / 10_000));
});

test("movement balances are signed and item-specific", () => {
  const state = fixture(); state.movements.push({ id: "M5", occurred_on: "2026-08-02", item_kind: "material", item_id: "MAT-WAX", movement_type: "waste", quantity_milli: -650_000, unit_cost_micros: 3_300 });
  assert.equal(movementBalances(state.movements).get("material:MAT-WAX"), 39_350_000);
  assert.equal(movementBalances(state.movements).get("product:PRD-1"), 28_000);
});

test("only planned and in-production batches reserve materials", () => {
  const state = fixture(); state.batches = [
    { id: "B1", production_date: "2026-08-12", product_id: "PRD-1", planned_qty_milli: 10_000, actual_produced_milli: 0, rejected_milli: 0, status: "planned" },
    { id: "B2", production_date: "2026-08-12", product_id: "PRD-1", planned_qty_milli: 10_000, actual_produced_milli: 0, rejected_milli: 0, status: "in_production" },
    { id: "B3", production_date: "2026-08-12", product_id: "PRD-1", planned_qty_milli: 10_000, actual_produced_milli: 10_000, rejected_milli: 0, status: "completed" },
    { id: "B4", production_date: "2026-08-12", product_id: "PRD-1", planned_qty_milli: 10_000, actual_produced_milli: 0, rejected_milli: 0, status: "cancelled" },
  ];
  assert.equal(activeReservations(state).get("MAT-JAR"), 20_000);
});

test("planning waste applies to raw reservations but not containers", () => {
  const state = fixture(); state.batches = [{ id: "B1", production_date: "2026-08-12", product_id: "PRD-1", planned_qty_milli: 10_000, actual_produced_milli: 0, rejected_milli: 0, status: "planned" }];
  const reserved = activeReservations(state);
  assert.equal(reserved.get("MAT-JAR"), 10_000); assert.ok((reserved.get("MAT-WAX") ?? 0) > 1_800_000);
});

test("Draft PO is excluded from open purchase quantities", () => {
  const state = fixture(); state.purchaseOrders = [{ po_number: "PO-D", order_date: "2026-08-01", supplier_id: "SUP-1", status: "draft", expected_date: null, actual_date: null }];
  state.purchaseOrderLines = [{ id: 1, po_number: "PO-D", line_no: 1, material_id: "MAT-WAX", ordered_qty_milli: 25_000_000, received_qty_milli: 0, unit_price_micros: 3_300, unit: "g" }];
  assert.equal(openPurchaseQuantities(state).get("MAT-WAX"), undefined);
});

test("ordered and part-received POs contribute only outstanding quantity", () => {
  const state = fixture(); state.purchaseOrders = [{ po_number: "PO-1", order_date: "2026-08-01", supplier_id: "SUP-1", status: "part_received", expected_date: null, actual_date: null }];
  state.purchaseOrderLines = [{ id: 1, po_number: "PO-1", line_no: 1, material_id: "MAT-JAR", ordered_qty_milli: 108_000, received_qty_milli: 72_000, unit_price_micros: 1_400_000, unit: "units" }];
  assert.equal(openPurchaseQuantities(state).get("MAT-JAR"), 36_000);
});

test("Received and Cancelled POs contribute no projected stock", () => {
  const state = fixture(); state.purchaseOrders = [
    { po_number: "PO-R", order_date: "2026-08-01", supplier_id: "SUP-1", status: "received", expected_date: null, actual_date: "2026-08-02" },
    { po_number: "PO-C", order_date: "2026-08-01", supplier_id: "SUP-1", status: "cancelled", expected_date: null, actual_date: null },
  ];
  state.purchaseOrderLines = [
    { id: 1, po_number: "PO-R", line_no: 1, material_id: "MAT-JAR", ordered_qty_milli: 10_000, received_qty_milli: 10_000, unit_price_micros: 1, unit: "units" },
    { id: 2, po_number: "PO-C", line_no: 1, material_id: "MAT-JAR", ordered_qty_milli: 10_000, received_qty_milli: 0, unit_price_micros: 1, unit: "units" },
  ];
  assert.equal(openPurchaseQuantities(state).size, 0);
});

test("availability subtracts an active reservation exactly once", () => {
  const state = fixture(); state.batches = [{ id: "B1", production_date: "2026-08-12", product_id: "PRD-1", planned_qty_milli: 100_000, actual_produced_milli: 0, rejected_milli: 0, status: "planned" }];
  const snapshot = computeSnapshot(state, "2026-08-12"); const wax = snapshot.materials.find((item) => item.id === "MAT-WAX")!;
  const expectedReservation = activeReservations(state).get("MAT-WAX")!;
  assert.equal(wax.availableMilli, 40_000_000 - expectedReservation);
});

test("plan simulation does not subtract its own demand twice", () => {
  const state = fixture(); state.planLines = [{ plan_id: "P", line_no: 1, product_id: "PRD-1", desired_qty_milli: 100_000 }];
  const available = new Map([["MAT-WAX", 20_000_000], ["MAT-JAR", 200_000], ["MAT-DOT", 200_000]]);
  assert.equal(simulatePlan(state, available).lines[0].status, "ready");
});

test("plan lines are assessed sequentially instead of globally blocking all lines", () => {
  const state = fixture(); state.planLines = [
    { plan_id: "P", line_no: 1, product_id: "PRD-1", desired_qty_milli: 10_000 },
    { plan_id: "P", line_no: 2, product_id: "PRD-1", desired_qty_milli: 100_000 },
  ];
  const available = new Map([["MAT-WAX", 5_000_000], ["MAT-JAR", 50_000], ["MAT-DOT", 50_000]]);
  const plan = simulatePlan(state, available); assert.equal(plan.lines[0].status, "ready"); assert.equal(plan.lines[1].status, "blocked");
});

test("empty plan has no phantom blocked lines", () => assert.equal(simulatePlan(fixture(), new Map()).blockedCount, 0));

test("planned finished goods are incoming, not allocated out of current stock", () => {
  const state = fixture(); state.batches = [{ id: "B1", production_date: "2026-08-12", product_id: "PRD-1", planned_qty_milli: 25_000, actual_produced_milli: 0, rejected_milli: 0, status: "planned" }];
  const item = computeSnapshot(state, "2026-08-12").products[0]; assert.equal(item.onHandMilli, 28_000); assert.equal(item.projectedMilli, 53_000);
});

test("material reservation greater than on-hand becomes blocked", () => {
  const state = fixture(); state.batches = [{ id: "B1", production_date: "2026-08-12", product_id: "PRD-1", planned_qty_milli: 400_000, actual_produced_milli: 0, rejected_milli: 0, status: "planned" }];
  assert.equal(computeSnapshot(state, "2026-08-12").materials.find((item) => item.id === "MAT-WAX")!.status, "blocked");
});

test("zero stock with committed incoming is On order", () => {
  const state = fixture(); state.movements = state.movements.filter((movement) => movement.item_id !== "MAT-JAR");
  state.purchaseOrders = [{ po_number: "PO-1", order_date: "2026-08-01", supplier_id: "SUP-1", status: "ordered", expected_date: "2026-08-20", actual_date: null }];
  state.purchaseOrderLines = [{ id: 1, po_number: "PO-1", line_no: 1, material_id: "MAT-JAR", ordered_qty_milli: 48_000, received_qty_milli: 0, unit_price_micros: 1_400_000, unit: "units" }];
  assert.equal(computeSnapshot(state, "2026-08-12").materials.find((item) => item.id === "MAT-JAR")!.status, "on_order");
});

test("negative ledger stock is flagged but never valued as a negative asset", () => {
  const state = fixture();
  state.movements = state.movements.filter((movement) => movement.item_id !== "MAT-WAX");
  state.movements.push({ id: "NEG", occurred_on: "2026-08-01", item_kind: "material", item_id: "MAT-WAX", movement_type: "migration_reconciliation", quantity_milli: -1_000_000, unit_cost_micros: 3_300 });
  const wax = computeSnapshot(state, "2026-08-12").materials.find((item) => item.id === "MAT-WAX")!;
  assert.equal(wax.status, "blocked");
  assert.equal(wax.inventoryValueMicros, 0);
});

test("suggested quantity respects pack size in full snapshot", () => {
  const state = fixture(); state.materials[1].reorder_point_milli = 527_000;
  const jar = computeSnapshot(state, "2026-08-12").materials.find((item) => item.id === "MAT-JAR")!;
  assert.equal(jar.shortfallMilli, 217_000); assert.equal(jar.suggestedOrderMilli, 288_000);
});

test("Draft POs are absent from dashboard open line and value metrics", () => {
  const state = fixture(); state.purchaseOrders = [{ po_number: "PO-D", order_date: "2026-08-01", supplier_id: "SUP-1", status: "draft", expected_date: "2026-08-02", actual_date: null }];
  state.purchaseOrderLines = [{ id: 1, po_number: "PO-D", line_no: 1, material_id: "MAT-WAX", ordered_qty_milli: 25_000_000, received_qty_milli: 0, unit_price_micros: 3_300, unit: "g" }];
  const dashboard = computeSnapshot(state, "2026-08-12").dashboard; assert.equal(dashboard.openPoLines, 0); assert.equal(dashboard.openPoValueMicros, 0); assert.equal(dashboard.overduePoLines, 0);
});

test("overdue metric includes only committed outstanding POs", () => {
  const state = fixture(); state.purchaseOrders = [{ po_number: "PO-1", order_date: "2026-08-01", supplier_id: "SUP-1", status: "ordered", expected_date: "2026-08-02", actual_date: null }];
  state.purchaseOrderLines = [{ id: 1, po_number: "PO-1", line_no: 1, material_id: "MAT-WAX", ordered_qty_milli: 25_000_000, received_qty_milli: 0, unit_price_micros: 3_300, unit: "g" }];
  assert.equal(computeSnapshot(state, "2026-08-12").dashboard.overduePoLines, 1);
});

test("multi-line committed POs aggregate quantities and values line by line", () => {
  const state = fixture();
  state.purchaseOrders = [{ po_number: "PO-M", order_date: "2026-08-01", supplier_id: "SUP-1", status: "part_received", expected_date: "2026-08-20", actual_date: null }];
  state.purchaseOrderLines = [
    { id: 1, po_number: "PO-M", line_no: 1, material_id: "MAT-WAX", ordered_qty_milli: 25_000_000, received_qty_milli: 25_000_000, unit_price_micros: 3_300, unit: "g" },
    { id: 2, po_number: "PO-M", line_no: 2, material_id: "MAT-JAR", ordered_qty_milli: 48_000, received_qty_milli: 12_000, unit_price_micros: 1_400_000, unit: "units" },
  ];
  const snapshot = computeSnapshot(state, "2026-08-12");
  const po = snapshot.purchaseOrders[0];
  assert.equal(po.lines[0].outstandingQtyMilli, 0);
  assert.equal(po.lines[1].outstandingQtyMilli, 36_000);
  assert.equal(po.outstandingValueMicros, 50_400_000);
  assert.equal(snapshot.dashboard.openPoLines, 1);
});

test("max producible and limiting material use available stock", () => {
  const item = computeSnapshot(fixture(), "2026-08-12").products[0]; assert.equal(item.maxProducible, 215); assert.equal(item.limitingMaterialId, "MAT-WAX");
});

test("completed batch snapshot stays fixed after current settings change", () => {
  const state = fixture(); state.batches = [{ id: "B1", production_date: "2026-08-12", product_id: "PRD-1", planned_qty_milli: 10_000, actual_produced_milli: 10_000, rejected_milli: 1_000, status: "completed", unit_cost_snapshot_micros: 6_500_000, total_cost_snapshot_micros: 65_000_000, waste_cost_snapshot_micros: 6_500_000 }];
  state.settings.labour_rate_pence_per_hour = 9_999;
  const batch = computeSnapshot(state, "2026-08-12").batches[0]; assert.equal(batch.total_cost_snapshot_micros, 65_000_000); assert.notEqual(batch.currentUnitCostMicros, batch.unit_cost_snapshot_micros);
});

test("good batch output is actual produced less rejected", () => {
  const state = fixture(); state.batches = [{ id: "B1", production_date: "2026-08-12", product_id: "PRD-1", planned_qty_milli: 50_000, actual_produced_milli: 48_000, rejected_milli: 2_000, status: "completed", total_cost_snapshot_micros: 1 }];
  assert.equal(computeSnapshot(state, "2026-08-12").batches[0].goodQtyMilli, 46_000);
});

test("zero selling price yields safe zero margin instead of divide-by-zero", () => {
  const state = fixture({ products: [product({ selling_price_pence: 0 })] }); assert.equal(computeProductCost(state.products[0], state).grossMarginBps, 0);
});

test("quantity scale is explicitly one thousand", () => assert.equal(SCALE.quantity, 1_000));

test("Candle Shack catalogue contains 14 uniquely sourced and dated materials", () => {
  assert.equal(supplierCatalogue.materials.length, 14);
  assert.equal(new Set(supplierCatalogue.materials.map((item) => item.id)).size, 14);
  assert.equal(new Set(supplierCatalogue.materials.map((item) => item.supplierSku)).size, 14);
  for (const item of supplierCatalogue.materials) {
    assert.match(item.supplierProductUrl, /^https:\/\/candle-shack\.co\.uk\/products\//);
    assert.equal(item.priceCheckedOn, "2026-08-12");
    assert.ok(item.purchasePriceIncVatMicros > item.purchasePriceMicros);
  }
});

test("catalogue unit costs reproduce supplier pack prices to the nearest penny", () => {
  for (const item of supplierCatalogue.materials) {
    const reconstructed = quantityCostMicros(item.packSizeMilli, item.unitCostMicros);
    assert.ok(Math.abs(reconstructed - item.purchasePriceMicros) <= 10_000, `${item.id} pack price drifted by more than one penny`);
  }
});

test("new supplier catalogue materials enter the inventory ledger at exactly zero", () => {
  const state = fixture();
  state.suppliers.push({
    id: supplierCatalogue.supplier.id,
    name: supplierCatalogue.supplier.name,
    minimum_order_pence: supplierCatalogue.supplier.minimumOrderPence,
    lead_time_days: supplierCatalogue.supplier.leadTimeDays,
    active: 1,
    website: supplierCatalogue.supplier.website,
  });
  state.materials.push(...catalogueMaterialRows());
  const catalogueRows = computeSnapshot(state, "2026-08-12").materials.filter((item) => item.supplier_id === supplierCatalogue.supplier.id);
  assert.equal(catalogueRows.length, 14);
  assert.ok(catalogueRows.every((item) => item.onHandMilli === 0 && item.availableMilli === 0 && item.projectedMilli === 0 && item.inventoryValueMicros === 0));
});

test("supplier-quoted inc-VAT prices remain attached when workspace VAT policy changes", () => {
  const state = fixture();
  state.settings.vat_bps = 0;
  state.materials.push(catalogueMaterialRows()[0]);
  const item = computeSnapshot(state, "2026-08-12").materials.find((row) => row.id === "MAT-CS-001");
  assert.equal(item?.purchasePriceIncVatMicros, 5_240_000);
});

test("database migration contains stock and receipt concurrency guards", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20260812191928_candle_wizard_initial_schema.sql", import.meta.url), "utf8");
  assert.match(sql, /app_material_stock_nonnegative/);
  assert.match(sql, /app_po_receipt_not_overposted/);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on table public\.%I from anon, authenticated/);
});
