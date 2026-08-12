export const SCALE = {
  quantity: 1_000,
  moneyMicros: 1_000_000,
  penceToMicros: 10_000,
  basisPoints: 10_000,
} as const;

export type SettingsRow = {
  workspace_id?: string;
  business_name: string;
  currency_code: string;
  vat_bps: number;
  waste_bps: number;
  labour_rate_pence_per_hour: number;
  target_margin_bps: number;
  source_filename?: string;
  imported_on?: string;
};

export type SupplierRow = {
  id: string;
  name: string;
  minimum_order_pence: number;
  lead_time_days: number;
  active: number;
  [key: string]: unknown;
};

export type MaterialRow = {
  id: string;
  name: string;
  category: string;
  supplier_id: string | null;
  supplier_sku?: string | null;
  unit: string;
  pack_size_milli: number;
  purchase_price_micros: number;
  purchase_price_inc_vat_micros?: number | null;
  unit_cost_micros: number;
  last_purchase_unit_cost_micros: number;
  minimum_stock_milli: number;
  reorder_point_milli: number;
  preferred_order_qty_milli: number;
  lead_time_days: number;
  location?: string | null;
  supplier_product_url?: string | null;
  price_checked_on?: string | null;
  active: number;
  [key: string]: unknown;
};

export type ProductRow = {
  id: string;
  sku: string;
  name: string;
  collection: string;
  candle_type: string;
  selling_price_pence: number;
  target_stock_milli: number;
  production_trigger_milli: number;
  direct_labour_minutes_milli: number;
  packaging_labour_minutes_milli: number;
  energy_cost_micros: number;
  overhead_cost_micros: number;
  selling_cost_micros: number;
  active: number;
  [key: string]: unknown;
};

export type BomRow = {
  id?: number;
  product_id: string;
  material_id: string;
  quantity_milli: number;
};

export type MovementRow = {
  id: string;
  occurred_on: string;
  item_kind: "material" | "product";
  item_id: string;
  movement_type: string;
  quantity_milli: number;
  unit_cost_micros: number;
  batch_id?: string | null;
  po_number?: string | null;
  lot_ref?: string | null;
  waste_event_id?: string | null;
  reason?: string | null;
  source?: string;
};

export type PurchaseOrderRow = {
  po_number: string;
  order_date: string;
  supplier_id: string;
  status: string;
  expected_date: string | null;
  actual_date: string | null;
  notes?: string | null;
  [key: string]: unknown;
};

export type PurchaseOrderLineRow = {
  id: number;
  po_number: string;
  line_no: number;
  material_id: string;
  ordered_qty_milli: number;
  received_qty_milli: number;
  unit_price_micros: number;
  unit: string;
};

export type BatchRow = {
  id: string;
  production_date: string;
  product_id: string;
  planned_qty_milli: number;
  actual_produced_milli: number;
  rejected_milli: number;
  status: string;
  operator?: string | null;
  wax_lot?: string | null;
  fragrance_lot?: string | null;
  container_lot?: string | null;
  unit_cost_snapshot_micros?: number | null;
  total_cost_snapshot_micros?: number | null;
  waste_cost_snapshot_micros?: number | null;
  notes?: string | null;
  [key: string]: unknown;
};

export type WasteRow = {
  id: string;
  occurred_on: string;
  batch_id?: string | null;
  product_id?: string | null;
  material_id: string;
  waste_type: string;
  lot_ref?: string | null;
  quantity_milli: number;
  unit: string;
  unit_cost_snapshot_micros: number;
  stock_movement_id: string;
  notes?: string | null;
};

export type PlanLineRow = {
  id?: number;
  plan_id: string;
  line_no: number;
  product_id: string;
  desired_qty_milli: number;
  notes?: string | null;
};

export type AuditRow = {
  id: string;
  occurred_at: string;
  actor: string;
  entity_type: string;
  entity_id: string;
  action: string;
  before_json?: string | null;
  after_json?: string | null;
  effects_json: string;
  source: string;
};

export type DomainState = {
  settings: SettingsRow;
  suppliers: SupplierRow[];
  materials: MaterialRow[];
  products: ProductRow[];
  bomItems: BomRow[];
  movements: MovementRow[];
  purchaseOrders: PurchaseOrderRow[];
  purchaseOrderLines: PurchaseOrderLineRow[];
  batches: BatchRow[];
  wasteEvents: WasteRow[];
  planLines: PlanLineRow[];
  auditEvents?: AuditRow[];
};

export function assertPositiveInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value) || Number(value) <= 0) throw new Error(`${label} must be greater than zero.`);
  return Number(value);
}

export function quantityCostMicros(quantityMilli: number, unitCostMicros: number): number {
  return Math.round((quantityMilli * unitCostMicros) / SCALE.quantity);
}

export function labourCostMicros(minutesMilli: number, ratePencePerHour: number): number {
  return Math.round((minutesMilli * ratePencePerHour * SCALE.penceToMicros) / (60 * SCALE.quantity));
}

export function grossUpForWaste(quantityMilli: number, wasteBps: number): number {
  if (wasteBps <= 0) return quantityMilli;
  if (wasteBps >= SCALE.basisPoints) throw new Error("Waste rate must be below 100%.");
  return Math.ceil((quantityMilli * SCALE.basisPoints) / (SCALE.basisPoints - wasteBps));
}

export function roundOrderQuantity(quantityMilli: number, preferredMilli: number, packSizeMilli: number): number {
  if (quantityMilli <= 0) return 0;
  const base = Math.max(quantityMilli, preferredMilli, packSizeMilli);
  return Math.ceil(base / packSizeMilli) * packSizeMilli;
}

export function normalizedImportedReceipt(status: string, orderedQtyMilli: number, recordedReceivedQtyMilli: number): number {
  if (status === "received") return orderedQtyMilli;
  if (status === "part_received") return Math.max(0, Math.min(recordedReceivedQtyMilli, orderedQtyMilli));
  return 0;
}

export function purchaseOrderStatusAfterReceipt(lines: PurchaseOrderLineRow[], targetLineId: number, targetReceivedQtyMilli: number) {
  return lines.every((line) => line.id === targetLineId ? targetReceivedQtyMilli === line.ordered_qty_milli : line.received_qty_milli === line.ordered_qty_milli)
    ? "received"
    : "part_received";
}

function isRawMaterial(category: string): boolean {
  return ["WAX", "FRAGRANCE", "WICKS", "COLOURANTS"].includes(category);
}

function isPackagingMaterial(category: string): boolean {
  return ["CONTAINERS", "PACKAGING"].includes(category);
}

export function computeProductCost(product: ProductRow, state: Pick<DomainState, "settings" | "materials" | "bomItems">) {
  const materialById = new Map(state.materials.map((material) => [material.id, material]));
  const lines = state.bomItems.filter((line) => line.product_id === product.id);
  let rawBaseMicros = 0;
  let packagingMicros = 0;
  let otherMicros = 0;

  for (const line of lines) {
    const material = materialById.get(line.material_id);
    if (!material) continue;
    const lineCost = quantityCostMicros(line.quantity_milli, material.unit_cost_micros);
    if (isRawMaterial(material.category)) rawBaseMicros += lineCost;
    else if (isPackagingMaterial(material.category)) packagingMicros += lineCost;
    else otherMicros += lineCost;
  }

  const rawWithWasteMicros = grossUpForWaste(rawBaseMicros, state.settings.waste_bps);
  const processWasteAllowanceMicros = rawWithWasteMicros - rawBaseMicros;
  const directLabourMicros = labourCostMicros(product.direct_labour_minutes_milli, state.settings.labour_rate_pence_per_hour);
  const packagingLabourMicros = labourCostMicros(product.packaging_labour_minutes_milli, state.settings.labour_rate_pence_per_hour);
  const totalCostMicros = rawWithWasteMicros + packagingMicros + otherMicros + directLabourMicros + packagingLabourMicros + product.energy_cost_micros + product.overhead_cost_micros + product.selling_cost_micros;
  const retailPriceMicros = product.selling_price_pence * SCALE.penceToMicros;
  const exVatRevenueMicros = Math.round((retailPriceMicros * SCALE.basisPoints) / (SCALE.basisPoints + state.settings.vat_bps));
  const grossProfitMicros = exVatRevenueMicros - totalCostMicros;
  const grossMarginBps = exVatRevenueMicros > 0 ? Math.round((grossProfitMicros * SCALE.basisPoints) / exVatRevenueMicros) : 0;
  const markupBps = totalCostMicros > 0 ? Math.round((grossProfitMicros * SCALE.basisPoints) / totalCostMicros) : 0;
  const targetDenominator = SCALE.basisPoints - state.settings.target_margin_bps;
  const suggestedExVatMicros = targetDenominator > 0 ? Math.ceil((totalCostMicros * SCALE.basisPoints) / targetDenominator) : 0;
  const suggestedRetailPence = Math.ceil((suggestedExVatMicros * (SCALE.basisPoints + state.settings.vat_bps)) / SCALE.basisPoints / SCALE.penceToMicros);

  return {
    rawBaseMicros,
    processWasteAllowanceMicros,
    rawWithWasteMicros,
    packagingMicros,
    otherMicros,
    directLabourMicros,
    packagingLabourMicros,
    totalCostMicros,
    retailPricePence: product.selling_price_pence,
    exVatRevenueMicros,
    grossProfitMicros,
    grossMarginBps,
    markupBps,
    suggestedRetailPence,
  };
}

export function movementBalances(movements: MovementRow[]) {
  const balances = new Map<string, number>();
  for (const movement of movements) {
    const key = `${movement.item_kind}:${movement.item_id}`;
    balances.set(key, (balances.get(key) ?? 0) + movement.quantity_milli);
  }
  return balances;
}

export function requiredMaterialsForProduct(productId: string, outputQtyMilli: number, state: Pick<DomainState, "settings" | "materials" | "bomItems">, includePlanningWaste = true) {
  const materialById = new Map(state.materials.map((material) => [material.id, material]));
  return state.bomItems.filter((line) => line.product_id === productId).map((line) => {
    const material = materialById.get(line.material_id);
    const baseRequirement = Math.ceil((line.quantity_milli * outputQtyMilli) / SCALE.quantity);
    const requiredQtyMilli = includePlanningWaste && material && isRawMaterial(material.category)
      ? grossUpForWaste(baseRequirement, state.settings.waste_bps)
      : baseRequirement;
    return { materialId: line.material_id, requiredQtyMilli };
  });
}

export function activeReservations(state: Pick<DomainState, "settings" | "materials" | "bomItems" | "batches">) {
  const reservations = new Map<string, number>();
  for (const batch of state.batches) {
    if (!["planned", "in_production"].includes(batch.status)) continue;
    for (const requirement of requiredMaterialsForProduct(batch.product_id, batch.planned_qty_milli, state, true)) {
      reservations.set(requirement.materialId, (reservations.get(requirement.materialId) ?? 0) + requirement.requiredQtyMilli);
    }
  }
  return reservations;
}

export function openPurchaseQuantities(state: Pick<DomainState, "purchaseOrders" | "purchaseOrderLines">) {
  const poByNumber = new Map(state.purchaseOrders.map((po) => [po.po_number, po]));
  const open = new Map<string, number>();
  for (const line of state.purchaseOrderLines) {
    const po = poByNumber.get(line.po_number);
    if (!po || !["ordered", "part_received"].includes(po.status)) continue;
    const outstanding = Math.max(0, line.ordered_qty_milli - line.received_qty_milli);
    open.set(line.material_id, (open.get(line.material_id) ?? 0) + outstanding);
  }
  return open;
}

export function simulatePlan(state: DomainState, availableByMaterial: Map<string, number>) {
  const remaining = new Map(availableByMaterial);
  const materialById = new Map(state.materials.map((material) => [material.id, material]));
  const productById = new Map(state.products.map((product) => [product.id, product]));
  const lines = [...state.planLines].sort((a, b) => a.line_no - b.line_no).map((line) => {
    const requirements = requiredMaterialsForProduct(line.product_id, line.desired_qty_milli, state, true);
    const blockers = requirements.filter((item) => (remaining.get(item.materialId) ?? 0) < item.requiredQtyMilli).map((item) => ({
      materialId: item.materialId,
      materialName: materialById.get(item.materialId)?.name ?? item.materialId,
      shortageMilli: Math.max(0, item.requiredQtyMilli - (remaining.get(item.materialId) ?? 0)),
    }));
    if (blockers.length === 0) {
      for (const item of requirements) remaining.set(item.materialId, (remaining.get(item.materialId) ?? 0) - item.requiredQtyMilli);
    }
    return {
      ...line,
      productName: productById.get(line.product_id)?.name ?? line.product_id,
      status: blockers.length === 0 ? "ready" : "blocked",
      blockers,
    };
  });
  return { lines, blockedCount: lines.filter((line) => line.status === "blocked").length };
}

export function computeSnapshot(state: DomainState, today = new Date().toISOString().slice(0, 10)) {
  const balances = movementBalances(state.movements);
  const reservations = activeReservations(state);
  const openPo = openPurchaseQuantities(state);
  const supplierById = new Map(state.suppliers.map((supplier) => [supplier.id, supplier]));
  const materialById = new Map(state.materials.map((material) => [material.id, material]));
  const productById = new Map(state.products.map((product) => [product.id, product]));
  const costByProduct = new Map(state.products.map((product) => [product.id, computeProductCost(product, state)]));

  const materials = state.materials.map((material) => {
    const supplier = supplierById.get(material.supplier_id ?? "");
    const onHandMilli = balances.get(`material:${material.id}`) ?? 0;
    const reservedMilli = reservations.get(material.id) ?? 0;
    const availableMilli = onHandMilli - reservedMilli;
    const openPoMilli = openPo.get(material.id) ?? 0;
    const projectedMilli = onHandMilli + openPoMilli - reservedMilli;
    const shortfallMilli = Math.max(0, material.reorder_point_milli - projectedMilli);
    const suggestedOrderMilli = roundOrderQuantity(shortfallMilli, material.preferred_order_qty_milli, material.pack_size_milli);
    let status = "ok";
    if (availableMilli < 0) status = "blocked";
    else if (onHandMilli <= 0 && openPoMilli > 0) status = "on_order";
    else if (onHandMilli <= 0) status = "out_of_stock";
    else if (projectedMilli < material.reorder_point_milli) status = "low";
    else if (material.reorder_point_milli > 0 && onHandMilli > material.reorder_point_milli * 4) status = "overstock";
    const inventoryValueMicros = quantityCostMicros(Math.max(0, onHandMilli), material.unit_cost_micros);
    const purchasePriceIncVatMicros = material.purchase_price_inc_vat_micros
      ?? Math.round((material.purchase_price_micros * (SCALE.basisPoints + state.settings.vat_bps)) / SCALE.basisPoints);
    return {
      ...material,
      supplierName: supplier?.name ?? "Unassigned",
      supplierWebsite: typeof supplier?.website === "string" ? supplier.website : null,
      purchasePriceIncVatMicros,
      onHandMilli,
      reservedMilli,
      availableMilli,
      openPoMilli,
      projectedMilli,
      shortfallMilli,
      suggestedOrderMilli,
      status,
      inventoryValueMicros,
    };
  });

  const availableByMaterial = new Map(materials.map((material) => [material.id, material.availableMilli]));
  const products = state.products.map((product) => {
    const onHandMilli = balances.get(`product:${product.id}`) ?? 0;
    const expectedIncomingMilli = state.batches.filter((batch) => batch.product_id === product.id && ["planned", "in_production"].includes(batch.status)).reduce((sum, batch) => sum + batch.planned_qty_milli, 0);
    const requirements = requiredMaterialsForProduct(product.id, SCALE.quantity, state, true);
    let maxProducible = Number.POSITIVE_INFINITY;
    let limitingMaterialId: string | null = null;
    for (const requirement of requirements) {
      if (requirement.requiredQtyMilli <= 0) continue;
      const possible = Math.floor(Math.max(0, availableByMaterial.get(requirement.materialId) ?? 0) / requirement.requiredQtyMilli);
      if (possible < maxProducible) {
        maxProducible = possible;
        limitingMaterialId = requirement.materialId;
      }
    }
    if (!Number.isFinite(maxProducible)) maxProducible = 0;
    const cost = costByProduct.get(product.id)!;
    return {
      ...product,
      onHandMilli,
      expectedIncomingMilli,
      projectedMilli: onHandMilli + expectedIncomingMilli,
      inventoryValueMicros: quantityCostMicros(Math.max(0, onHandMilli), cost.totalCostMicros),
      stockStatus: onHandMilli <= 0 ? "out_of_stock" : onHandMilli < product.production_trigger_milli ? "low" : onHandMilli > product.target_stock_milli * 4 ? "overstock" : "ok",
      maxProducible,
      limitingMaterialId,
      limitingMaterialName: limitingMaterialId ? materialById.get(limitingMaterialId)?.name ?? limitingMaterialId : null,
      cost,
    };
  });

  const purchaseOrders = state.purchaseOrders.map((po) => {
    const isCommitted = ["ordered", "part_received"].includes(po.status);
    const lines = state.purchaseOrderLines.filter((line) => line.po_number === po.po_number).map((line) => {
      const outstandingQtyMilli = Math.max(0, line.ordered_qty_milli - line.received_qty_milli);
      return {
        ...line,
        materialName: materialById.get(line.material_id)?.name ?? line.material_id,
        outstandingQtyMilli,
        lineTotalMicros: quantityCostMicros(line.ordered_qty_milli, line.unit_price_micros),
        outstandingValueMicros: quantityCostMicros(outstandingQtyMilli, line.unit_price_micros),
      };
    });
    const totalMicros = lines.reduce((sum, line) => sum + line.lineTotalMicros, 0);
    const outstandingValueMicros = isCommitted ? lines.reduce((sum, line) => sum + line.outstandingValueMicros, 0) : 0;
    const overdue = isCommitted && Boolean(po.expected_date && po.expected_date < today) && lines.some((line) => line.outstandingQtyMilli > 0);
    const minimumOrderPence = supplierById.get(po.supplier_id)?.minimum_order_pence ?? 0;
    return { ...po, supplierName: supplierById.get(po.supplier_id)?.name ?? po.supplier_id, lines, totalMicros, outstandingValueMicros, isCommitted, overdue, belowMinimum: po.status === "draft" && totalMicros < minimumOrderPence * SCALE.penceToMicros };
  });

  const plan = simulatePlan(state, availableByMaterial);
  const monthStart = `${today.slice(0, 7)}-01`;
  const completedThisMonth = state.batches.filter((batch) => batch.status === "completed" && batch.production_date >= monthStart && batch.production_date <= today);
  const materialValueMicros = materials.reduce((sum, item) => sum + item.inventoryValueMicros, 0);
  const finishedValueMicros = products.reduce((sum, item) => sum + item.inventoryValueMicros, 0);
  const dashboard = {
    totalInventoryValueMicros: materialValueMicros + finishedValueMicros,
    materialInventoryValueMicros: materialValueMicros,
    finishedInventoryValueMicros: finishedValueMicros,
    activeMaterials: state.materials.filter((item) => item.active).length,
    activeProducts: state.products.filter((item) => item.active).length,
    materialAlerts: materials.filter((item) => ["blocked", "out_of_stock", "low"].includes(item.status)).length,
    finishedGoodAlerts: products.filter((item) => ["out_of_stock", "low"].includes(item.stockStatus)).length,
    openPoLines: purchaseOrders.filter((po) => po.isCommitted).flatMap((po) => po.lines).filter((line) => line.outstandingQtyMilli > 0).length,
    overduePoLines: purchaseOrders.filter((po) => po.overdue).reduce((sum, po) => sum + po.lines.filter((line) => line.outstandingQtyMilli > 0).length, 0),
    activeBatches: state.batches.filter((batch) => ["planned", "in_production"].includes(batch.status)).length,
    unitsProducedThisMonthMilli: completedThisMonth.reduce((sum, batch) => sum + Math.max(0, batch.actual_produced_milli - batch.rejected_milli), 0),
    productionCostThisMonthMicros: completedThisMonth.reduce((sum, batch) => sum + (batch.total_cost_snapshot_micros ?? 0), 0),
    wasteCostThisMonthMicros: state.wasteEvents.filter((event) => event.occurred_on >= monthStart && event.occurred_on <= today).reduce((sum, event) => sum + quantityCostMicros(event.quantity_milli, event.unit_cost_snapshot_micros), 0),
    blockedPlanLines: plan.blockedCount,
    openPoValueMicros: purchaseOrders.reduce((sum, po) => sum + po.outstandingValueMicros, 0),
  };

  const batches = state.batches.map((batch) => ({
    ...batch,
    productName: productById.get(batch.product_id)?.name ?? batch.product_id,
    goodQtyMilli: Math.max(0, batch.actual_produced_milli - batch.rejected_milli),
    currentUnitCostMicros: costByProduct.get(batch.product_id)?.totalCostMicros ?? 0,
  }));

  const wasteEvents = state.wasteEvents.map((event) => ({
    ...event,
    materialName: materialById.get(event.material_id)?.name ?? event.material_id,
    productName: event.product_id ? productById.get(event.product_id)?.name ?? event.product_id : null,
    wasteCostMicros: quantityCostMicros(event.quantity_milli, event.unit_cost_snapshot_micros),
  }));

  const auditEvents = (state.auditEvents ?? []).map((event) => ({ ...event, effects: safeJson(event.effects_json), before: safeJson(event.before_json), after: safeJson(event.after_json) }));

  return { settings: state.settings, dashboard, materials, products, purchaseOrders, batches, wasteEvents, plan, auditEvents, source: { today } };
}

function safeJson(value?: string | null) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return value; }
}
