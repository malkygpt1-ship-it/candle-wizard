-- Use native PostgreSQL temporal types while preserving the app's ISO inputs.
alter table public.app_meta alter column updated_at drop default;
alter table public.settings alter column created_at drop default, alter column updated_at drop default;
alter table public.suppliers alter column created_at drop default, alter column updated_at drop default;
alter table public.materials alter column created_at drop default, alter column updated_at drop default;
alter table public.products alter column created_at drop default, alter column updated_at drop default;
alter table public.bom_items alter column created_at drop default, alter column updated_at drop default;
alter table public.production_plans alter column created_at drop default, alter column updated_at drop default;
alter table public.production_plan_lines alter column created_at drop default, alter column updated_at drop default;
alter table public.purchase_orders alter column created_at drop default, alter column updated_at drop default;
alter table public.purchase_order_lines alter column created_at drop default, alter column updated_at drop default;
alter table public.production_batches alter column created_at drop default, alter column updated_at drop default;
alter table public.stock_movements alter column created_at drop default;
alter table public.waste_events alter column created_at drop default;
alter table public.audit_events alter column occurred_at drop default;
alter table public.idempotency_keys alter column created_at drop default;

alter table public.app_meta alter column updated_at type timestamptz using updated_at::timestamptz;

alter table public.settings
  alter column imported_on type date using imported_on::date,
  alter column created_at type timestamptz using created_at::timestamptz,
  alter column updated_at type timestamptz using updated_at::timestamptz;

alter table public.suppliers
  alter column created_at type timestamptz using created_at::timestamptz,
  alter column updated_at type timestamptz using updated_at::timestamptz;

alter table public.materials
  alter column price_checked_on type date using price_checked_on::date,
  alter column created_at type timestamptz using created_at::timestamptz,
  alter column updated_at type timestamptz using updated_at::timestamptz;

alter table public.products
  alter column created_at type timestamptz using created_at::timestamptz,
  alter column updated_at type timestamptz using updated_at::timestamptz;

alter table public.bom_items
  alter column created_at type timestamptz using created_at::timestamptz,
  alter column updated_at type timestamptz using updated_at::timestamptz;

alter table public.production_plans
  alter column created_at type timestamptz using created_at::timestamptz,
  alter column updated_at type timestamptz using updated_at::timestamptz;

alter table public.production_plan_lines
  alter column created_at type timestamptz using created_at::timestamptz,
  alter column updated_at type timestamptz using updated_at::timestamptz;

alter table public.purchase_orders
  alter column order_date type date using order_date::date,
  alter column expected_date type date using expected_date::date,
  alter column actual_date type date using actual_date::date,
  alter column created_at type timestamptz using created_at::timestamptz,
  alter column updated_at type timestamptz using updated_at::timestamptz;

alter table public.purchase_order_lines
  alter column created_at type timestamptz using created_at::timestamptz,
  alter column updated_at type timestamptz using updated_at::timestamptz;

alter table public.production_batches
  alter column production_date type date using production_date::date,
  alter column completed_at type timestamptz using completed_at::timestamptz,
  alter column created_at type timestamptz using created_at::timestamptz,
  alter column updated_at type timestamptz using updated_at::timestamptz;

alter table public.stock_movements
  alter column occurred_on type date using occurred_on::date,
  alter column created_at type timestamptz using created_at::timestamptz;

alter table public.waste_events
  alter column occurred_on type date using occurred_on::date,
  alter column created_at type timestamptz using created_at::timestamptz;

alter table public.audit_events alter column occurred_at type timestamptz using occurred_at::timestamptz;
alter table public.idempotency_keys alter column created_at type timestamptz using created_at::timestamptz;

alter table public.app_meta alter column updated_at set default current_timestamp;
alter table public.settings alter column created_at set default current_timestamp, alter column updated_at set default current_timestamp;
alter table public.suppliers alter column created_at set default current_timestamp, alter column updated_at set default current_timestamp;
alter table public.materials alter column created_at set default current_timestamp, alter column updated_at set default current_timestamp;
alter table public.products alter column created_at set default current_timestamp, alter column updated_at set default current_timestamp;
alter table public.bom_items alter column created_at set default current_timestamp, alter column updated_at set default current_timestamp;
alter table public.production_plans alter column created_at set default current_timestamp, alter column updated_at set default current_timestamp;
alter table public.production_plan_lines alter column created_at set default current_timestamp, alter column updated_at set default current_timestamp;
alter table public.purchase_orders alter column created_at set default current_timestamp, alter column updated_at set default current_timestamp;
alter table public.purchase_order_lines alter column created_at set default current_timestamp, alter column updated_at set default current_timestamp;
alter table public.production_batches alter column created_at set default current_timestamp, alter column updated_at set default current_timestamp;
alter table public.stock_movements alter column created_at set default current_timestamp;
alter table public.waste_events alter column created_at set default current_timestamp;
alter table public.audit_events alter column occurred_at set default current_timestamp;
alter table public.idempotency_keys alter column created_at set default current_timestamp;

-- PostgreSQL does not automatically index every foreign-key side.
create index production_plan_line_product_idx on public.production_plan_lines(product_id);
create index waste_product_idx on public.waste_events(product_id);
create unique index stock_movement_waste_event_uidx on public.stock_movements(waste_event_id) where waste_event_id is not null;

-- Preserve the one-to-one waste event / stock movement link, even though either
-- record may be inserted first inside the same transaction.
alter table public.stock_movements
  add constraint stock_movement_waste_event_fkey
  foreign key (waste_event_id) references public.waste_events(id)
  on delete set null deferrable initially deferred;

alter table public.waste_events
  add constraint waste_event_stock_movement_fkey
  foreign key (stock_movement_id) references public.stock_movements(id)
  on delete restrict deferrable initially deferred;

-- Keep malformed operational values out of the ledger even if a future client
-- bypasses the current application validation.
alter table public.settings
  add constraint settings_vat_bps_check check (vat_bps between 0 and 5000),
  add constraint settings_waste_bps_check check (waste_bps >= 0 and waste_bps < 10000),
  add constraint settings_labour_rate_check check (labour_rate_pence_per_hour > 0),
  add constraint settings_target_margin_check check (target_margin_bps > 0 and target_margin_bps < 10000);

alter table public.suppliers
  add constraint suppliers_lead_time_check check (lead_time_days >= 0),
  add constraint suppliers_minimum_order_check check (minimum_order_pence >= 0);

alter table public.materials
  add constraint materials_pack_size_check check (pack_size_milli > 0),
  add constraint materials_prices_check check (
    purchase_price_micros >= 0
    and (purchase_price_inc_vat_micros is null or purchase_price_inc_vat_micros >= 0)
    and unit_cost_micros >= 0
    and last_purchase_unit_cost_micros >= 0
  ),
  add constraint materials_stock_policy_check check (
    minimum_stock_milli >= 0
    and reorder_point_milli >= 0
    and preferred_order_qty_milli >= 0
    and lead_time_days >= 0
  );

alter table public.products
  add constraint products_quantities_check check (
    container_size_ml > 0
    and wax_weight_milli > 0
    and fragrance_bps >= 0
    and selling_price_pence >= 0
    and target_stock_milli >= 0
    and production_trigger_milli >= 0
  ),
  add constraint products_costs_check check (
    direct_labour_minutes_milli >= 0
    and packaging_labour_minutes_milli >= 0
    and energy_cost_micros >= 0
    and overhead_cost_micros >= 0
    and selling_cost_micros >= 0
  );

alter table public.bom_items add constraint bom_quantity_check check (quantity_milli > 0);
alter table public.production_plan_lines add constraint plan_quantity_check check (desired_qty_milli > 0);

alter table public.purchase_orders
  add constraint purchase_order_status_check check (status in ('draft', 'ordered', 'part_received', 'received', 'cancelled'));

alter table public.purchase_order_lines
  add constraint po_line_quantities_check check (
    ordered_qty_milli > 0
    and received_qty_milli >= 0
    and received_qty_milli <= ordered_qty_milli
    and unit_price_micros >= 0
  );

alter table public.production_batches
  add constraint production_batch_status_check check (status in ('planned', 'in_production', 'completed', 'cancelled')),
  add constraint production_batch_quantities_check check (
    planned_qty_milli > 0
    and actual_produced_milli >= 0
    and rejected_milli >= 0
    and rejected_milli <= actual_produced_milli
  );

alter table public.stock_movements
  add constraint stock_movement_item_kind_check check (item_kind in ('material', 'product')),
  add constraint stock_movement_unit_cost_check check (unit_cost_micros >= 0);

alter table public.waste_events
  add constraint waste_quantity_check check (quantity_milli > 0),
  add constraint waste_cost_check check (unit_cost_snapshot_micros >= 0);

revoke all on schema public from anon, authenticated;
grant usage on schema public to service_role;
revoke execute on function candle_private.enforce_material_stock_nonnegative() from public, anon, authenticated;
revoke execute on function candle_private.enforce_po_receipt_not_overposted() from public, anon, authenticated;
