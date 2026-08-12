/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Snapshot = Record<string, any>;
type TabId = "overview" | "inventory" | "production" | "purchasing" | "costing" | "traceability" | "audit" | "settings";
type ModalState = { type: string; data?: any } | null;

const tabs: Array<{ id: TabId; label: string; mark: string }> = [
  { id: "overview", label: "Operations", mark: "O" },
  { id: "inventory", label: "Inventory", mark: "I" },
  { id: "production", label: "Production", mark: "P" },
  { id: "purchasing", label: "Purchasing", mark: "£" },
  { id: "costing", label: "Costing", mark: "C" },
  { id: "traceability", label: "Traceability", mark: "T" },
  { id: "audit", label: "Audit trail", mark: "A" },
  { id: "settings", label: "Settings", mark: "S" },
];

const statusText: Record<string, string> = {
  ok: "Healthy", low: "Low", blocked: "Blocked", out_of_stock: "Out of stock", on_order: "On order", overstock: "Overstock",
  planned: "Planned", in_production: "In production", completed: "Completed", cancelled: "Cancelled", ordered: "Ordered",
  part_received: "Part received", received: "Received", draft: "Draft", ready: "Ready",
};

function money(micros = 0) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(micros / 1_000_000);
}

function price(pence = 0) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pence / 100);
}

function quantity(milli = 0, unit = "units") {
  const value = milli / 1_000;
  return `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: Number.isInteger(value) ? 0 : 3 }).format(value)} ${unit}`;
}

function packQuantity(milli = 0, unit = "units") {
  const value = milli / 1_000;
  if (unit === "g" && value >= 1_000) return `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 3 }).format(value / 1_000)} kg`;
  return quantity(milli, unit);
}

function percent(bps = 0) { return `${(bps / 100).toFixed(1)}%`; }

function clientIdempotencyKey() {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  return `client-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function dateLabel(date?: string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00Z`));
}

function Status({ value }: { value: string }) { return <span className={`status status-${value}`}>{statusText[value] ?? value.replaceAll("_", " ")}</span>; }

function Metric({ label, value, note, tone = "default" }: { label: string; value: string; note: string; tone?: string }) {
  return <article className={`metric metric-${tone}`}><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></article>;
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action}</div>;
}

function Empty({ children }: { children: React.ReactNode }) { return <div className="empty-state">{children}</div>; }

export default function DashboardApp() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [modal, setModal] = useState<ModalState>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [railOpen, setRailOpen] = useState(false);

  async function refresh() {
    setLoading(true); setError(null);
    try {
      const response = await fetch("/api/snapshot", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not load the workspace.");
      setSnapshot(data);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load the workspace."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadInitialSnapshot() {
      try {
        const response = await fetch("/api/snapshot", { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Could not load the workspace.");
        if (active) setSnapshot(data);
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        if (active) setError(caught instanceof Error ? caught.message : "Could not load the workspace.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadInitialSnapshot();
    return () => { active = false; controller.abort(); };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!modal) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [modal]);

  async function act(action: string, payload: Record<string, unknown>) {
    setLoading(true); setError(null);
    try {
      const response = await fetch("/api/actions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, payload: { ...payload, idempotencyKey: clientIdempotencyKey() } }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "The operation failed.");
      setSnapshot(data.snapshot); setModal(null); setToast(data.result?.message ?? "Operation completed"); return true;
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The operation failed."); return false; }
    finally { setLoading(false); }
  }

  function selectTab(next: TabId) { setTab(next); setRailOpen(false); setSearch(""); setStatusFilter("all"); }

  if (!snapshot && loading) return <LoadingScreen />;
  if (!snapshot) return <FailureScreen message={error ?? "The workspace is unavailable."} retry={refresh} />;
  const ledgerDeficits = snapshot.materials.filter((item: any) => item.onHandMilli < 0).length;

  return <div className="app-shell">
    <aside className={`rail ${railOpen ? "rail-open" : ""}`}>
      <div className="brand"><div className="brand-seal"><span>LW</span></div><div><strong>Lumina</strong><small>Manufacturing OS</small></div></div>
      <nav aria-label="Primary navigation">{tabs.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => selectTab(item.id)} aria-current={tab === item.id ? "page" : undefined}><span className="nav-mark">{item.mark}</span><span>{item.label}</span>{item.id === "audit" && <i>{Math.min(snapshot.auditEvents.length, 99)}</i>}</button>)}</nav>
      <div className="rail-foot"><span className={`health-dot ${ledgerDeficits ? "attention" : ""}`} /><div><strong>{ledgerDeficits ? `${ledgerDeficits} ledger deficit${ledgerDeficits === 1 ? "" : "s"}` : "Ledger reconciled"}</strong><small>{ledgerDeficits ? "Physical count required" : "All writes are audited"}</small></div></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><button className="menu-button" onClick={() => setRailOpen((value) => !value)} aria-label="Toggle navigation">☰</button><div className="topbar-title"><span>{tabs.find((item) => item.id === tab)?.label}</span><strong>{snapshot.settings.business_name}</strong></div><div className="topbar-actions"><button className="quiet-button" onClick={() => void refresh()} disabled={loading}>↻ <span>Refresh</span></button><button className="primary-button" onClick={() => setModal({ type: "create_batch" })}>+ Plan batch</button></div></header>
      <main className="content">
        {error && <div className="error-banner" role="alert"><span>!</span><p>{error}</p><button onClick={() => setError(null)} aria-label="Dismiss error">×</button></div>}
        {tab === "overview" && <Overview snapshot={snapshot} open={setModal} go={selectTab} />}
        {tab === "inventory" && <Inventory snapshot={snapshot} search={search} setSearch={setSearch} filter={statusFilter} setFilter={setStatusFilter} />}
        {tab === "production" && <Production snapshot={snapshot} open={setModal} />}
        {tab === "purchasing" && <Purchasing snapshot={snapshot} open={setModal} />}
        {tab === "costing" && <Costing snapshot={snapshot} open={setModal} />}
        {tab === "traceability" && <Traceability snapshot={snapshot} open={setModal} />}
        {tab === "audit" && <Audit snapshot={snapshot} />}
        {tab === "settings" && <Settings snapshot={snapshot} act={act} loading={loading} />}
      </main>
    </div>
    {modal && <ActionModal modal={modal} snapshot={snapshot} close={() => setModal(null)} act={act} loading={loading} />}
    {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}{loading && <div className="working-bar" aria-label="Working" />}
  </div>;
}

function LoadingScreen() { return <div className="loading-screen"><div className="loading-seal">LW</div><strong>Reconciling the factory ledger</strong><span>Inventory · production · purchasing · cost snapshots</span><div className="loading-line" /></div>; }
function FailureScreen({ message, retry }: { message: string; retry: () => void }) { return <div className="failure-screen"><span>!</span><h1>The workspace didnae load</h1><p>{message}</p><button className="primary-button" onClick={retry}>Try again</button></div>; }

function Overview({ snapshot, open, go }: { snapshot: Snapshot; open: (modal: ModalState) => void; go: (tab: TabId) => void }) {
  const d = snapshot.dashboard;
  const urgent = snapshot.materials.filter((item: any) => ["blocked", "out_of_stock", "low"].includes(item.status)).slice(0, 5);
  const activeBatches = snapshot.batches.filter((item: any) => ["planned", "in_production"].includes(item.status));
  return <div className="page-stack">
    <section className="hero-panel"><div className="hero-copy"><div className="eyebrow"><span className="pulse" /> Live operating position · {dateLabel(snapshot.source.today)}</div><h1>Good stock decisions start with one ledger.</h1><p>The spreadsheet has been migrated, its broken links reconciled, and every production, purchase and waste event now leaves a permanent trail.</p><div className="hero-actions"><button className="primary-button" onClick={() => open({ type: "create_batch" })}>Plan production</button><button className="secondary-button" onClick={() => open({ type: "record_waste" })}>Record waste</button></div></div>
      <div className="reconciliation-card"><span className="reconciliation-kicker">Import control</span><strong>Workbook reconciled</strong><div className="reconciliation-score"><b>135</b><span>invalid placeholders removed</span></div><div className="mini-rule" /><p>Completed batches, PO receipts and waste records now post their stock effects automatically.</p></div></section>
    <section className="metrics-grid"><Metric label="Inventory value" value={money(d.totalInventoryValueMicros)} note={`${money(d.materialInventoryValueMicros)} materials · ${money(d.finishedInventoryValueMicros)} finished`} /><Metric label="Materials requiring action" value={String(d.materialAlerts)} note={`${d.overduePoLines} overdue PO line${d.overduePoLines === 1 ? "" : "s"}`} tone={d.materialAlerts ? "warning" : "good"} /><Metric label="Output this month" value={quantity(d.unitsProducedThisMonthMilli)} note={`${money(d.productionCostThisMonthMicros)} frozen production cost`} tone="accent" /><Metric label="Waste this month" value={money(d.wasteCostThisMonthMicros)} note={`${snapshot.wasteEvents.length} traceable event${snapshot.wasteEvents.length === 1 ? "" : "s"}`} /></section>
    <section className="split-grid"><div className="panel"><SectionHeading eyebrow="Exceptions first" title="Inventory attention" action={<button className="text-button" onClick={() => go("inventory")}>View inventory →</button>} />{urgent.length ? <div className="attention-list">{urgent.map((item: any) => <button key={item.id} onClick={() => go("inventory")}><span className="item-avatar">{item.name.slice(0, 2).toUpperCase()}</span><span className="attention-copy"><strong>{item.name}</strong><small>{quantity(item.availableMilli, item.unit)} available · {quantity(item.openPoMilli, item.unit)} incoming</small></span><Status value={item.status} /></button>)}</div> : <Empty>No material exceptions. Lovely.</Empty>}</div>
      <div className="panel"><SectionHeading eyebrow="Floor control" title="Active production" action={<button className="text-button" onClick={() => go("production")}>Open board →</button>} />{activeBatches.length ? <div className="batch-strip">{activeBatches.map((batch: any) => <article key={batch.id}><div><span>{batch.id}</span><Status value={batch.status} /></div><strong>{batch.productName}</strong><p>{quantity(batch.planned_qty_milli)} planned · {batch.operator || "Unassigned"}</p><button onClick={() => open({ type: "complete_batch", data: batch })}>Complete batch</button></article>)}</div> : <Empty>No active batches.</Empty>}</div></section>
    <section className="panel management-panel"><SectionHeading eyebrow="Control room" title="Operational controls" /><div className="control-grid"><button onClick={() => open({ type: "create_po" })}><span>01</span><strong>Draft purchase order</strong><small>Pack-rounded and supplier checked</small></button><button onClick={() => open({ type: "create_batch" })}><span>02</span><strong>Plan a batch</strong><small>Reserve materials once, never twice</small></button><button onClick={() => open({ type: "record_waste" })}><span>03</span><strong>Post a waste event</strong><small>Deduct stock and preserve lot trace</small></button><button onClick={() => go("audit")}><span>04</span><strong>Inspect audit effects</strong><small>See before, after and downstream impact</small></button></div></section>
  </div>;
}

function Inventory({ snapshot, search, setSearch, filter, setFilter }: { snapshot: Snapshot; search: string; setSearch: (value: string) => void; filter: string; setFilter: (value: string) => void }) {
  const rows = useMemo(() => snapshot.materials.filter((item: any) => `${item.id} ${item.name} ${item.category} ${item.supplierName}`.toLowerCase().includes(search.toLowerCase()) && (filter === "all" || item.status === filter)), [snapshot.materials, search, filter]);
  const sourcedCatalogue = snapshot.materials.filter((item: any) => item.supplier_product_url && item.price_checked_on);
  const catalogueLead = sourcedCatalogue[0];
  return <div className="page-stack"><PageIntro eyebrow="Single source of truth" title="Inventory without shadow balances" copy="On-hand stock is the signed sum of immutable ledger movements. Active batches create reservations; Draft POs never inflate projected stock." />
    {catalogueLead && <div className="supplier-catalogue-banner">
      <div><span className="catalogue-mark">UK</span><div><strong>Supplier catalogue · {catalogueLead.supplierName}</strong><small>{sourcedCatalogue.length} sourced materials · all added at zero on-hand · prices checked {dateLabel(catalogueLead.price_checked_on)}</small></div></div>
      <a href={catalogueLead.supplierWebsite} target="_blank" rel="noreferrer">Visit supplier ↗</a>
    </div>}
    <div className="filterbar"><label className="searchbox"><span>⌕</span><input aria-label="Search inventory" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search material, code, category or supplier" /></label><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter inventory status"><option value="all">All statuses</option><option value="blocked">Blocked</option><option value="out_of_stock">Out of stock</option><option value="low">Low</option><option value="on_order">On order</option><option value="ok">Healthy</option><option value="overstock">Overstock</option></select><span className="row-count">{rows.length} materials</span></div>
    <div className="table-panel inventory-table"><table><thead><tr><th>Material</th><th>On hand</th><th>Reserved</th><th>Available</th><th>Open PO</th><th>Projected</th><th>Supplier pack</th><th>Ex VAT</th><th>Inc VAT</th><th>Value</th><th>Status</th></tr></thead><tbody>{rows.map((item: any) => <tr key={item.id}><td>{item.supplier_product_url ? <a className="material-source-link" href={item.supplier_product_url} target="_blank" rel="noreferrer"><strong>{item.name}</strong><span>Supplier page ↗</span></a> : <strong>{item.name}</strong>}<small>{item.id} · {item.category} · {item.supplierName}{item.supplier_sku ? ` · ${item.supplier_sku}` : ""}</small></td><td>{quantity(item.onHandMilli, item.unit)}</td><td>{quantity(item.reservedMilli, item.unit)}</td><td className={item.availableMilli < 0 ? "negative" : ""}>{quantity(item.availableMilli, item.unit)}</td><td>{quantity(item.openPoMilli, item.unit)}</td><td>{quantity(item.projectedMilli, item.unit)}</td><td>{packQuantity(item.pack_size_milli, item.unit)}</td><td className="supplier-price">{money(item.purchase_price_micros)}<small>ex VAT</small></td><td className="supplier-price supplier-price-gross">{money(item.purchasePriceIncVatMicros)}<small>{item.price_checked_on ? `checked ${dateLabel(item.price_checked_on)}` : `at ${percent(snapshot.settings.vat_bps)} VAT`}</small></td><td>{money(item.inventoryValueMicros)}</td><td><Status value={item.status} /></td></tr>)}</tbody></table>{!rows.length && <Empty>No materials match those filters.</Empty>}</div>
    <SectionHeading eyebrow="Finished goods" title="Sellable stock and incoming output" /><div className="product-inventory-grid">{snapshot.products.map((item: any) => <article key={item.id}><div><span>{item.collection}</span><Status value={item.stockStatus} /></div><h3>{item.name}</h3><small>{item.sku}</small><div className="stock-number">{quantity(item.onHandMilli)}</div><p>{quantity(item.expectedIncomingMilli)} incoming from active batches</p><footer><span>Value <strong>{money(item.inventoryValueMicros)}</strong></span><span>Max now <strong>{item.maxProducible}</strong></span></footer></article>)}</div>
  </div>;
}

function Production({ snapshot, open }: { snapshot: Snapshot; open: (modal: ModalState) => void }) {
  return <div className="page-stack"><PageIntro eyebrow="Plan → reserve → complete" title="Production that posts itself" copy="Completing a batch validates every BOM component, freezes its cost, consumes materials and adds good output in one atomic operation." action={<button className="primary-button" onClick={() => open({ type: "create_batch" })}>+ New batch</button>} />
    <section className="panel plan-panel"><SectionHeading eyebrow="Imported scenario · non-reserving" title="What-if production plan" /><p className="section-note">The old spreadsheet scratchpad is preserved as a simulation. Only committed batches reserve stock.</p><div className="plan-lines">{snapshot.plan.lines.map((line: any) => <article key={line.id ?? line.line_no}><div className="plan-sequence">{String(line.line_no).padStart(2, "0")}</div><div><strong>{line.productName}</strong><small>{quantity(line.desired_qty_milli)} desired</small></div><Status value={line.status} /><div className="plan-reason">{line.blockers.length ? line.blockers.map((blocker: any) => `${blocker.materialName} short ${quantity(blocker.shortageMilli, snapshot.materials.find((m: any) => m.id === blocker.materialId)?.unit)}`).join(" · ") : "Every component available after active reservations"}</div></article>)}</div></section>
    <section className="panel"><SectionHeading eyebrow="Batch register" title="Production queue" /><div className="table-panel flush"><table><thead><tr><th>Batch</th><th>Product</th><th>Date</th><th>Planned</th><th>Actual / good</th><th>Operator</th><th>Cost snapshot</th><th>Status</th><th /></tr></thead><tbody>{snapshot.batches.map((batch: any) => <tr key={batch.id}><td><strong>{batch.id}</strong></td><td>{batch.productName}</td><td>{dateLabel(batch.production_date)}</td><td>{quantity(batch.planned_qty_milli)}</td><td>{batch.status === "completed" ? `${quantity(batch.actual_produced_milli)} / ${quantity(batch.goodQtyMilli)}` : "—"}</td><td>{batch.operator || "—"}</td><td>{batch.total_cost_snapshot_micros != null ? money(batch.total_cost_snapshot_micros) : "Pending"}</td><td><Status value={batch.status} /></td><td>{["planned", "in_production"].includes(batch.status) && <button className="row-button" onClick={() => open({ type: "complete_batch", data: batch })}>Complete</button>}</td></tr>)}</tbody></table></div></section>
  </div>;
}

function Purchasing({ snapshot, open }: { snapshot: Snapshot; open: (modal: ModalState) => void }) {
  const suggestions = snapshot.materials.filter((item: any) => item.suggestedOrderMilli > 0);
  return <div className="page-stack"><PageIntro eyebrow="Demand-led purchasing" title="Order what the floor will actually need" copy="Committed POs feed projected stock. Drafts remain visible but excluded until supplier minimums and pack multiples pass validation." action={<button className="primary-button" onClick={() => open({ type: "create_po" })}>+ Draft PO</button>} />
    <section className="po-grid">{snapshot.purchaseOrders.map((po: any) => <article className={po.overdue ? "po-card overdue" : "po-card"} key={po.po_number}><div className="po-head"><div><span>{po.po_number}</span><strong>{po.supplierName}</strong></div><Status value={po.status} /></div><div className="po-figures"><span><small>Order total</small><strong>{money(po.totalMicros)}</strong></span><span><small>Outstanding</small><strong>{money(po.outstandingValueMicros)}</strong></span></div>{po.lines.map((line: any) => <div className="po-line" key={line.id}><div><strong>{line.materialName}</strong><small>{quantity(line.outstandingQtyMilli, line.unit)} of {quantity(line.ordered_qty_milli, line.unit)} outstanding</small></div>{line.outstandingQtyMilli > 0 && ["ordered", "part_received"].includes(po.status) && <button onClick={() => open({ type: "receive_po", data: { po, line } })}>Receive</button>}</div>)}<footer><span>{po.overdue ? "Overdue" : `Expected ${dateLabel(po.expected_date)}`}</span>{po.belowMinimum && <b>Below supplier minimum</b>}{po.status === "draft" && !po.belowMinimum && <button onClick={() => open({ type: "submit_po", data: po })}>Submit order</button>}</footer></article>)}</section>
    <section className="panel"><SectionHeading eyebrow="Pack-rounded recommendations" title="Materials to order" />{suggestions.length ? <div className="recommendations">{suggestions.map((item: any) => <article key={item.id}><div><strong>{item.name}</strong><small>{item.supplierName} · {item.location || "No location"}</small></div><span><small>Projected</small><b>{quantity(item.projectedMilli, item.unit)}</b></span><span><small>Shortfall</small><b>{quantity(item.shortfallMilli, item.unit)}</b></span><span><small>Suggested</small><b>{quantity(item.suggestedOrderMilli, item.unit)}</b></span><button onClick={() => open({ type: "create_po", data: item })}>Draft PO</button></article>)}</div> : <Empty>No purchase recommendations.</Empty>}</section>
  </div>;
}

function Costing({ snapshot, open }: { snapshot: Snapshot; open: (modal: ModalState) => void }) {
  const target = snapshot.settings.target_margin_bps;
  return <div className="page-stack"><PageIntro eyebrow="VAT-aware unit economics" title="Margins you can trust at the till" copy={`Retail prices are treated as VAT-inclusive. Material waste, live labour rate and the ${percent(target)} target margin now flow through every product automatically.`} /><div className="costing-summary"><div><small>Target margin</small><strong>{percent(target)}</strong></div><div><small>VAT rate</small><strong>{percent(snapshot.settings.vat_bps)}</strong></div><div><small>Process waste</small><strong>{percent(snapshot.settings.waste_bps)}</strong></div><div><small>Labour rate</small><strong>{price(snapshot.settings.labour_rate_pence_per_hour)} / hr</strong></div></div>
    <div className="table-panel"><table><thead><tr><th>Product</th><th>Raw + waste</th><th>Packaging</th><th>Labour</th><th>Total unit cost</th><th>Retail inc VAT</th><th>Net revenue</th><th>Gross margin</th><th>Target retail</th></tr></thead><tbody>{snapshot.products.map((item: any) => { const c = item.cost; const below = c.grossMarginBps < target; return <tr key={item.id} className="clickable" onClick={() => open({ type: "cost_detail", data: item })}><td><strong>{item.name}</strong><small>{item.sku}</small></td><td>{money(c.rawWithWasteMicros)}</td><td>{money(c.packagingMicros)}</td><td>{money(c.directLabourMicros + c.packagingLabourMicros)}</td><td><strong>{money(c.totalCostMicros)}</strong></td><td>{price(c.retailPricePence)}</td><td>{money(c.exVatRevenueMicros)}</td><td><span className={below ? "margin-low" : "margin-good"}>{percent(c.grossMarginBps)}</span></td><td>{price(c.suggestedRetailPence)}</td></tr>; })}</tbody></table></div>
  </div>;
}

function Traceability({ snapshot, open }: { snapshot: Snapshot; open: (modal: ModalState) => void }) {
  return <div className="page-stack"><PageIntro eyebrow="Lot-to-ledger trace" title="Waste cannae disappear between sheets" copy="Every waste record now owns one stock movement and one frozen cost. The batch, material and lot stay linked for a future quality investigation." action={<button className="primary-button" onClick={() => open({ type: "record_waste" })}>+ Record waste</button>} /><section className="trace-summary"><div><span className="trace-node">01</span><strong>Waste event</strong><small>Reason, quantity and lot</small></div><i>→</i><div><span className="trace-node">02</span><strong>Ledger movement</strong><small>Stock deducted once</small></div><i>→</i><div><span className="trace-node">03</span><strong>Cost snapshot</strong><small>History never restates</small></div></section>
    <div className="table-panel"><table><thead><tr><th>Record</th><th>Date</th><th>Batch</th><th>Material</th><th>Type / lot</th><th>Quantity</th><th>Frozen cost</th><th>Ledger link</th></tr></thead><tbody>{snapshot.wasteEvents.map((item: any) => <tr key={item.id}><td><strong>{item.id}</strong></td><td>{dateLabel(item.occurred_on)}</td><td>{item.batch_id || "—"}</td><td>{item.materialName}</td><td><strong>{item.waste_type}</strong><small>{item.lot_ref || "No lot"}</small></td><td>{quantity(item.quantity_milli, item.unit)}</td><td>{money(item.wasteCostMicros)}</td><td><code>{item.stock_movement_id}</code></td></tr>)}</tbody></table></div>
  </div>;
}

function Audit({ snapshot }: { snapshot: Snapshot }) {
  const importControls = snapshot.auditEvents.filter((event: any) => event.source === "migration_reconciliation").length;
  return <div className="page-stack"><PageIntro eyebrow="Append-only evidence" title="Every change shows its blast radius" copy="The log stores who acted, what changed, the before and after state, and which stock, cost, planning or purchasing properties were affected." /><div className="audit-stats"><span><b>{snapshot.auditEvents.length}</b> visible events</span><span><b>{importControls}</b> import controls</span><span><b>0</b> silent formula writes</span></div><div className="audit-list">{snapshot.auditEvents.map((event: any) => <article key={event.id}><div className="audit-line"><span className={`audit-source ${event.source}`}>{event.source === "app" ? "Live action" : "Migration"}</span><time>{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.occurred_at))}</time></div><div className="audit-body"><div className="audit-icon">{event.action.slice(0, 1).toUpperCase()}</div><div><h3>{event.action.replaceAll("_", " ")}</h3><p>{event.entity_type.replaceAll("_", " ")} · {event.entity_id}</p><small>By {event.actor}</small></div></div><pre>{JSON.stringify(event.effects, null, 2)}</pre></article>)}</div></div>;
}

function Settings({ snapshot, act, loading }: { snapshot: Snapshot; act: (action: string, payload: Record<string, unknown>) => Promise<boolean>; loading: boolean }) {
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); await act("update_settings", { businessName: data.get("businessName"), vatBps: Math.round(Number(data.get("vat")) * 100), wasteBps: Math.round(Number(data.get("waste")) * 100), labourRatePencePerHour: Math.round(Number(data.get("labour")) * 100), targetMarginBps: Math.round(Number(data.get("margin")) * 100) }); }
  return <div className="page-stack settings-page"><PageIntro eyebrow="Connected calculation policy" title="One change, explicit downstream effects" copy="These values were disconnected in the workbook. Here, changing one recalculates planning and current product costs while completed batch and waste snapshots stay frozen." /><form className="settings-card" onSubmit={submit}><div className="settings-title"><div><span>Business policy</span><h2>Core calculation settings</h2></div><div className="locked-history"><span>✓</span> Historical snapshots protected</div></div><label><span>Business name</span><input name="businessName" defaultValue={snapshot.settings.business_name} required /><small>Appears across this workspace and reports.</small></label><div className="form-grid two"><label><span>VAT rate</span><div className="input-suffix"><input name="vat" type="number" min="0" max="50" step="0.1" defaultValue={snapshot.settings.vat_bps / 100} required /><b>%</b></div><small>Retail prices are VAT-inclusive.</small></label><label><span>Target gross margin</span><div className="input-suffix"><input name="margin" type="number" min="1" max="95" step="0.1" defaultValue={snapshot.settings.target_margin_bps / 100} required /><b>%</b></div><small>Drives suggested retail price.</small></label><label><span>Planning waste allowance</span><div className="input-suffix"><input name="waste" type="number" min="0" max="49" step="0.1" defaultValue={snapshot.settings.waste_bps / 100} required /><b>%</b></div><small>Grosses up raw material planning once.</small></label><label><span>Labour rate</span><div className="input-prefix"><b>£</b><input name="labour" type="number" min="0.01" step="0.01" defaultValue={snapshot.settings.labour_rate_pence_per_hour / 100} required /></div><small>Recalculates current product cost per minute.</small></label></div><div className="impact-box"><strong>On save</strong><span>Current costing recalculates</span><span>Plan reservations recalculate</span><span>Margins and recommendations refresh</span><span>Completed records do not change</span></div><button className="primary-button" type="submit" disabled={loading}>Save calculation policy</button></form></div>;
}

function PageIntro({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: React.ReactNode }) { return <section className="page-intro"><div><span>{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{action}</section>; }

function ActionModal({ modal, snapshot, close, act, loading }: { modal: NonNullable<ModalState>; snapshot: Snapshot; close: () => void; act: (action: string, payload: Record<string, unknown>) => Promise<boolean>; loading: boolean }) {
  const today = snapshot.source.today;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const type = modal.type;
    if (type === "create_batch") await act("create_batch", { productId: data.get("productId"), plannedQtyMilli: Math.round(Number(data.get("quantity")) * 1000), productionDate: data.get("date"), operator: data.get("operator"), waxLot: data.get("waxLot"), fragranceLot: data.get("fragranceLot"), containerLot: data.get("containerLot"), notes: data.get("notes") });
    if (type === "complete_batch") await act("complete_batch", { batchId: modal.data.id, actualProducedMilli: Math.round(Number(data.get("actual")) * 1000), rejectedMilli: Math.round(Number(data.get("rejected")) * 1000) });
    if (type === "record_waste") await act("record_waste", { materialId: data.get("materialId"), quantityMilli: Math.round(Number(data.get("quantity")) * 1000), wasteType: data.get("wasteType"), lotRef: data.get("lotRef"), occurredOn: data.get("date"), batchId: data.get("batchId") || null, notes: data.get("notes") });
    if (type === "create_po") await act("create_purchase_order", { materialId: data.get("materialId"), orderedQtyMilli: Math.round(Number(data.get("quantity")) * 1000), orderDate: data.get("date"), notes: data.get("notes") });
    if (type === "receive_po") await act("receive_purchase_order", { poNumber: modal.data.po.po_number, lineId: modal.data.line.id, quantityMilli: Math.round(Number(data.get("quantity")) * 1000), occurredOn: data.get("date"), lotRef: data.get("lotRef") });
    if (type === "submit_po") await act("submit_purchase_order", { poNumber: modal.data.po_number });
  }
  const selectedMaterial = modal.type === "create_po" ? modal.data : null;
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={close} aria-label="Close">×</button>{modal.type === "cost_detail" ? <CostDetail item={modal.data} close={close} /> : <form onSubmit={submit}>
    {modal.type === "create_batch" && <><ModalHead kicker="Production control" title="Plan a production batch" copy="This creates material reservations. Stock moves only when the batch completes." /><label><span>Product</span><select name="productId" required>{snapshot.products.map((item: any) => <option key={item.id} value={item.id}>{item.name} · max {item.maxProducible}</option>)}</select></label><div className="form-grid two"><label><span>Planned quantity</span><input name="quantity" type="number" min="1" step="1" defaultValue="25" required /></label><label><span>Production date</span><input name="date" type="date" defaultValue={today} required /></label></div><label><span>Operator</span><input name="operator" placeholder="e.g. M. Stone" /></label><div className="form-grid three"><label><span>Wax lot</span><input name="waxLot" placeholder="WAX-…" /></label><label><span>Fragrance lot</span><input name="fragranceLot" placeholder="FRG-…" /></label><label><span>Container lot</span><input name="containerLot" placeholder="JAR-…" /></label></div><label><span>Notes</span><textarea name="notes" rows={2} /></label><ModalFoot loading={loading} label="Plan batch" close={close} /></>}
    {modal.type === "complete_batch" && <><ModalHead kicker={modal.data.id} title={`Complete ${modal.data.productName}`} copy="The entire BOM is validated before any stock changes. The cost is frozen at completion." /><div className="effect-preview"><span>Materials</span><b>Consumed atomically</b><span>Good output</span><b>Added once</b><span>Cost</span><b>Snapshot frozen</b></div><div className="form-grid two"><label><span>Actual produced</span><input name="actual" type="number" min="0.001" step="0.001" defaultValue={modal.data.planned_qty_milli / 1000} required /></label><label><span>Rejected / damaged</span><input name="rejected" type="number" min="0" step="0.001" defaultValue="0" required /></label></div><ModalFoot loading={loading} label="Validate & complete" close={close} danger /></>}
    {modal.type === "record_waste" && <><ModalHead kicker="Traceability" title="Record material waste" copy="One save creates the waste record, deducts stock and freezes its unit cost." /><label><span>Material</span><select name="materialId" required>{snapshot.materials.map((item: any) => <option key={item.id} value={item.id}>{item.name} · {quantity(item.onHandMilli, item.unit)} on hand</option>)}</select></label><div className="form-grid two"><label><span>Quantity</span><input name="quantity" type="number" min="0.001" step="0.001" required /></label><label><span>Date</span><input name="date" type="date" defaultValue={today} required /></label></div><div className="form-grid two"><label><span>Waste type</span><select name="wasteType" required><option>Wax Spillage</option><option>Fragrance Loss</option><option>Damaged Jar</option><option>Failed Candle</option><option>Label Damage</option><option>Packaging Damage</option></select></label><label><span>Lot reference</span><input name="lotRef" required placeholder="Supplier or internal lot" /></label></div><label><span>Batch (optional)</span><select name="batchId"><option value="">No batch</option>{snapshot.batches.map((item: any) => <option key={item.id} value={item.id}>{item.id} · {item.productName}</option>)}</select></label><label><span>Notes</span><textarea name="notes" rows={2} /></label><ModalFoot loading={loading} label="Post waste event" close={close} danger /></>}
    {modal.type === "create_po" && <><ModalHead kicker="Purchasing" title="Draft a purchase order" copy="Whole-pack quantities join the supplier’s open Draft PO when one exists. Draft stock stays out of projections." /><label><span>Material</span><select name="materialId" defaultValue={selectedMaterial?.id} required>{snapshot.materials.filter((item: any) => item.supplier_id).map((item: any) => <option key={item.id} value={item.id}>{item.name} · pack {quantity(item.pack_size_milli, item.unit)}</option>)}</select></label><div className="form-grid two"><label><span>Order quantity</span><input name="quantity" type="number" min="0.001" step="0.001" defaultValue={selectedMaterial ? selectedMaterial.suggestedOrderMilli / 1000 : 1000} required /></label><label><span>Order date</span><input name="date" type="date" defaultValue={today} required /></label></div><label><span>Notes</span><textarea name="notes" rows={2} placeholder="Optional buyer note" /></label><ModalFoot loading={loading} label="Create Draft PO" close={close} /></>}
    {modal.type === "receive_po" && <><ModalHead kicker={modal.data.po.po_number} title={`Receive ${modal.data.line.materialName}`} copy={`${quantity(modal.data.line.outstandingQtyMilli, modal.data.line.unit)} remains outstanding. Over-receipts are blocked.`} /><div className="form-grid two"><label><span>Received quantity</span><input name="quantity" type="number" min="0.001" max={modal.data.line.outstandingQtyMilli / 1000} step="0.001" defaultValue={modal.data.line.outstandingQtyMilli / 1000} required /></label><label><span>Receipt date</span><input name="date" type="date" defaultValue={today} required /></label></div><label><span>Supplier lot reference</span><input name="lotRef" required placeholder="Required for traceability" /></label><ModalFoot loading={loading} label="Post receipt" close={close} /></>}
    {modal.type === "submit_po" && <><ModalHead kicker={modal.data.po_number} title="Submit this purchase order?" copy="Once submitted, its outstanding quantity enters projected stock and receipt posting becomes available." /><div className="confirm-box"><strong>{modal.data.supplierName}</strong><span>{money(modal.data.totalMicros)}</span></div><ModalFoot loading={loading} label="Submit order" close={close} /></>}
  </form>}</section></div>;
}

function ModalHead({ kicker, title, copy }: { kicker: string; title: string; copy: string }) { return <header className="modal-head"><span>{kicker}</span><h2 id="modal-title">{title}</h2><p>{copy}</p></header>; }
function ModalFoot({ loading, label, close, danger = false }: { loading: boolean; label: string; close: () => void; danger?: boolean }) { return <footer className="modal-foot"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button type="submit" className={danger ? "danger-button" : "primary-button"} disabled={loading}>{loading ? "Working…" : label}</button></footer>; }

function CostDetail({ item, close }: { item: any; close: () => void }) {
  const c = item.cost;
  const rows = [["Raw materials", c.rawBaseMicros], ["Process waste allowance", c.processWasteAllowanceMicros], ["Packaging & containers", c.packagingMicros], ["Other BOM", c.otherMicros], ["Direct labour", c.directLabourMicros], ["Packaging labour", c.packagingLabourMicros], ["Energy", item.energy_cost_micros], ["Overhead", item.overhead_cost_micros], ["Selling cost", item.selling_cost_micros]];
  return <div><ModalHead kicker={item.sku} title={item.name} copy="Current unit cost uses connected policy settings. Existing completed batches retain their frozen snapshot." /><div className="cost-stack">{rows.map(([label, value]) => <div key={String(label)}><span>{label}</span><b>{money(Number(value))}</b></div>)}<div className="cost-total"><span>Total unit cost</span><b>{money(c.totalCostMicros)}</b></div></div><div className="margin-panel"><span>Retail inc VAT <b>{price(c.retailPricePence)}</b></span><span>Ex-VAT revenue <b>{money(c.exVatRevenueMicros)}</b></span><span>Gross margin <b>{percent(c.grossMarginBps)}</b></span><span>Target retail <b>{price(c.suggestedRetailPence)}</b></span></div><footer className="modal-foot"><button className="primary-button" onClick={close}>Done</button></footer></div>;
}
