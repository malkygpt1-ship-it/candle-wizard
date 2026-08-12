-- The app uses a server-only pooled Postgres connection. Keep the Supabase Data
-- API fail-closed until a future authenticated client flow is designed.
do $$
declare
  relation_name text;
begin
  foreach relation_name in array array[
    'app_meta', 'settings', 'suppliers', 'materials', 'products', 'bom_items',
    'production_plans', 'production_plan_lines', 'purchase_orders',
    'purchase_order_lines', 'production_batches', 'stock_movements',
    'waste_events', 'audit_events', 'idempotency_keys'
  ] loop
    execute format(
      'create policy browser_access_denied on public.%I as restrictive for all to anon, authenticated using (false) with check (false)',
      relation_name
    );
  end loop;
end;
$$;
